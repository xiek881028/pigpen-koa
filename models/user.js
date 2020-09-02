/*!
 * User
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
"use strict";

const crypto = require("crypto");

const mongoose = require("mongoose");
const UserSchema = require("../schema/user");
const UserRoleSchema = require("../schema/userRole");
const { isArray } = require("../helper");
const { redisSet } = require("../helper/node");
const RoleSchema = require("../schema/role");
const validator = require("validator");
const BaseModel = require("./BaseModel");
const { warningConsole } = require("../helper/node");

const notFoundTip = "用户不存在";

class User extends BaseModel {
  // username, password, lastLoginTime, _id, salt,

  // 获取随机盐
  static getSalt(num = 28) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(num, (err, buf) => {
        if (err) {
          reject("随机盐生成失败");
        } else {
          resolve(buf.toString("hex"));
        }
      });
    });
  }

  // 密码加密
  static encryptionPwd(
    pwd,
    salt,
    iterations = 256,
    keylen = 64,
    digest = "sha512"
  ) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        pwd,
        salt,
        iterations,
        keylen,
        digest,
        (err, derivedKey) => {
          if (err) {
            reject("账号或密码错误");
          } else {
            resolve(derivedKey.toString("hex"));
          }
        }
      );
    });
  }

  // 更新用户信息到redis
  updateRedis(data) {
    redisSet(`userid:${data._id}`, JSON.stringify(data));
  }

  // 根据账号寻找用户
  findByName(params = {}, ops = {}) {
    const defaultOps = {
      setObject: true,
      using: false,
    };
    const { using, setObject } = { ...defaultOps, ...ops };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.username(this.username);
        UserSchema.findOne({ username: this.username }).exec((err, info) => {
          if (err || !info) {
            return reject(notFoundTip);
          }
          if (!info.using && using) {
            return reject("用户账号已被停用");
          }
          setObject && this.setAttributes(info.toObject());
          resolve(info);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 根据用户id寻找用户
  findById(params = {}, ops = {}) {
    const defaultOps = {
      setObject: true,
      using: false,
    };
    const { using, setObject } = { ...defaultOps, ...ops };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        UserSchema.findById(this._id).exec((err, info) => {
          if (err || !info) {
            return reject(notFoundTip);
          }
          if (!info.using && using) {
            return reject("用户账号已被停用");
          }
          setObject && this.setAttributes(info.toObject());
          resolve(info);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 新增用户
  addUser(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        this.username = this.username.trim();
        await Valid.username(this.username);
        await Valid.pwd(this.password);
        // await Valid.pwdMatching(this.password, this.repassword);
        const salt = await User.getSalt();
        const savePwd = await User.encryptionPwd(this.password, salt);
        try {
          await this.findByName();
          reject("账号已存在");
        } catch (error) {
          UserSchema.create(
            {
              username: this.username,
              password: savePwd,
              salt,
              using: false,
              first: true,
            },
            async (err, info) => {
              if (err) {
                return reject("用户新增失败");
              }
              this.setAttributes(info.toObject());
              resolve(info);
            }
          );
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 检查用户是否已经拥有相同的角色(不要在外部调用)
  static checkUserhasRole(userData, roleData) {
    const { _id: userid } = userData;
    const { name: rolename, _id: roleid } = roleData;
    return new Promise(async (resolve, reject) => {
      UserRoleSchema.find({
        userid,
        roleid,
      }).exec((err, res) => {
        if (err) {
          return reject("用户添加角色失败");
        } else if (res.length) {
          return reject(`用户已经是角色${rolename}`);
        } else {
          resolve({
            userid,
            roleid,
          });
        }
      });
    });
  }

  // 用户新增角色插表方法(不要在外部调用)
  static addRoleFn(data) {
    return new Promise(async (resolve, reject) => {
      await UserRoleSchema.create(data, (err, res) => {
        if (err) {
          return reject("用户添加角色失败");
        }
        resolve();
      });
    });
  }

  static roundAddRoleFn(query, userData) {
    return new Promise(async (resolve, reject) => {
      RoleSchema.find({
        $or: query,
      }).exec(async (err, res) => {
        // 有一个角色未找到，都报角色不存在
        if (err || res.length != query.length) {
          return reject("角色不存在");
        }
        try {
          const addData = [];
          for (let i = 0, max = res.length; i < max; i++) {
            const child = res[i];
            const roleData = child.toObject();
            addData.push(await User.checkUserhasRole(userData, roleData));
          }
          await Promise.all(
            addData.map(async (item) => {
              await User.addRoleFn(item);
            })
          );
          resolve();
        } catch (error) {
          return reject(error);
        }
      });
    });
  }

  // 用户删除角色插表方法(不要在外部调用)
  static delRoleFn(params) {
    const { userid, roleid } = params;
    return new Promise(async (resolve, reject) => {
      await UserRoleSchema.deleteOne({ userid, roleid }, (err, res) => {
        if (err) {
          return reject("用户删除角色失败");
        }
        resolve();
      });
    });
  }

  // 用户新增角色(不支持事务回滚，只能在所有检查通过后才可以插入数据，性能较差)
  editRole(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        await Valid.role(this.role);
        const userData = await this.findById();
        const delRoleArr = [].concat(await this.hasRole());
        const addRoleArr = [].concat(this.role);
        for (let i = delRoleArr.length - 1; i >= 0; i--) {
          const item = delRoleArr[i];
          for (let j = addRoleArr.length - 1; j >= 0; j--) {
            const addItem = addRoleArr[j];
            if (item.id == addItem) {
              delRoleArr.splice(i, 1);
              addRoleArr.splice(j, 1);
              break;
            }
          }
        }
        if (addRoleArr.length) {
          const query = [];
          addRoleArr.map((item) => {
            query.push({ _id: item });
          });
          await User.roundAddRoleFn(query, userData);
        }
        if (delRoleArr.length) {
          await Promise.all(
            delRoleArr.map(async (item) => {
              await User.delRoleFn({
                userid: userData.toObject()._id,
                roleid: item.id,
              });
            })
          );
        }
        resolve();
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 删除用户(物理删除)
  del(params = {}, ops = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        UserSchema.findOneAndRemove({ _id: this._id }).exec(
          async (err, res) => {
            if (err || !res) {
              // 写系统警告，没有事务回滚，需要手动处理
              // 写危险操作库以及log日志文件，双保险
              await this.warnLog(
                "用户删除失败",
                `UserSchema userid: ${this._id}`
              );
              warningConsole(`UserSchema userid: ${this._id}`);
              return reject("用户删除失败");
            } else {
              UserRoleSchema.remove({ userid: this._id }).exec(
                async (err, res) => {
                  if (err || !res) {
                    // 写系统警告，没有事务回滚，需要手动处理
                    // 写危险操作库以及log日志文件，双保险
                    await this.warnLog(
                      "用户删除失败",
                      `UserRoleSchema userid: ${this._id}`
                    );
                    warningConsole(`UserRoleSchema userid: ${this._id}`);
                    return reject("用户删除失败");
                  }
                  resolve();
                }
              );
            }
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 用户所属的角色
  hasRole(params = {}, ops = {}) {
    const { roleSelect = "name _id" } = ops;
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        const { _id: userid } = await this.findById();
        UserRoleSchema.find({ userid })
          .populate({
            path: "roleid",
            select: roleSelect,
          })
          .exec((err, res) => {
            if (err) {
              return reject("查询用户所属角色失败");
            }
            const out = [];
            for (let i = 0, max = res.length; i < max; i++) {
              const { roleid } = res[i];
              let item = roleid.toObject();
              if (item._id) {
                item.id = item._id;
                delete item._id;
              }
              out.push(item);
            }
            resolve(out);
          });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 登录
  login(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      let enterPassword = this.password;
      try {
        let userModel = await this.findByName(
          {},
          {
            using: true,
          }
        );
        await Valid.vailPwd(enterPassword, userModel);
        await this.updateLoginTime();
        resolve();
      } catch (error) {
        return reject(error == notFoundTip ? "账号或密码错误" : error);
      }
    });
  }

  // 更新用户登录时间(涉及单点登陆，更改后token会改变)
  updateLoginTime(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      UserSchema.findOneAndUpdate({
        _id: this._id
      }, {
        lastLoginTime: Date.parse(new Date()).toString()
      }, {
        runValidators: true,
        new: true,
      }, (err, info) => {
        if (err) {
          reject(this.errFormat(err.errors));
          return;
        }
        let obj = info.toObject();
        this.setAttributes(obj);
        this.updateRedis(obj);
        resolve(obj);
      });
    });
  }

  // 停用/启用(更新redis)
  editUsing(params = {}, _ops = {}) {
    const defaultOps = {
      saveToRedis: false,
    };
    const ops = {
      ...defaultOps,
      ..._ops,
    };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        await Valid.using(this.using);
        const mode = !!this.using ? "启用" : "停用";
        let res = await this.findById(
          { _id: this._id },
          {
            setObject: false,
          }
        );
        try {
          res.using = !!this.using;
          res = await res.save();
          ops.saveToRedis && this.updateRedis(res.toObject());
          resolve(res);
        } catch (error) {
          return reject(`用户${mode}失败`);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 修改密码(更新redis)
  editPwd(params = {}, ops = {}) {
    const defaultOps = {
      first: false,
    };
    const { first } = { ...defaultOps, ...ops };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this._id);
        await Valid.pwd(this.password);
        let res = await this.findById(
          { _id: this._id },
          {
            setObject: false,
          }
        );
        const salt = await User.getSalt();
        const savePwd = await User.encryptionPwd(this.password, salt);
        try {
          res.password = savePwd;
          res.salt = salt;
          res.first = first;
          res = await res.save();
          this.updateRedis(res.toObject());
          resolve(res);
        } catch (error) {
          return reject(`密码修改失败`);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  static list() {
    return new Promise((resolve, reject) => {
      UserSchema.find({}, "username using")
        .limit(100)
        .exec(async (err, res) => {
          if (err) {
            return reject("获取用户列表失败");
          }
          let out = [];
          for (let i = 0; i < res.length; i++) {
            const { username, _id: id, using } = res[i];
            const user = new User({ _id: id });
            const role = await user.hasRole(
              {},
              {
                roleSelect: "name -_id",
              }
            );
            out.push({
              username,
              id,
              using,
              role,
            });
          }
          resolve(out);
        });
    });
  }
}

const Valid = {
  id(str) {
    return new Promise((resolve, reject) => {
      if (User.noVal(str) || validator.isEmpty(str + "")) {
        return reject("用户id不能为空");
      } else if (!mongoose.Types.ObjectId.isValid(str)) {
        return reject("用户id格式错误");
      }
      resolve(str);
    });
  },
  username(str) {
    return new Promise((resolve, reject) => {
      if (User.noVal(str) || validator.isEmpty(str + "")) {
        return reject("账号不能为空");
      } else if (!validator.isLength(str + "", { min: 1, max: 18 })) {
        return reject("账号长度为1~18位");
      }
      resolve();
    });
  },
  role(val) {
    return new Promise((resolve, reject) => {
      if (!isArray(val)) {
        return reject("传入角色必须为一个数组");
      }
      resolve();
    });
  },
  pwd(str) {
    return new Promise((resolve, reject) => {
      if (User.noVal(str) || validator.isEmpty(str + "")) {
        return reject("密码不能为空");
      } else if (!validator.isLength(str + "", { min: 8, max: 18 })) {
        return reject("密码长度为8~18位");
      } else if (/^[\d]+$/.test(str)) {
        return reject("密码不能为纯数字");
      }
      resolve();
    });
  },
  vailPwd(inPwd, model) {
    return new Promise(async (resolve, reject) => {
      const { password, salt } = model;
      try {
        const outPwd = await User.encryptionPwd(inPwd, salt);
        if (outPwd === password) {
          resolve();
        } else {
          reject("账号或密码错误");
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  using(str) {
    return new Promise((resolve, reject) => {
      if (typeof str !== "boolean") {
        return reject("停启用标识不能为空");
      }
      resolve(str);
    });
  },
};

module.exports.default = module.exports = User;
