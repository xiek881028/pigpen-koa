/*!
 * Role
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
"use strict";

const UserRoleSchema = require("../schema/userRole");
const RoleSchema = require("../schema/role");
const RolePermissionSchema = require("../schema/rolePermission");
const PermissionSchema = require("../schema/permission");
const mongoose = require("mongoose");
const validator = require("validator");
const BaseModel = require("./BaseModel");
const { isArray } = require("../helper");
const { permissionTree, warningConsole } = require("../helper/node");

class Role extends BaseModel {
  // 获取列表(无分页)
  static list() {
    return new Promise(async (resolve, reject) => {
      RoleSchema.find({}, "name _id")
        .sort({ createdAt: -1 })
        .exec((err, res) => {
          if (err) {
            return reject("获取列表失败");
          }
          const out = [];
          res.map((_item) => {
            const item = _item.toJSON();
            item.id = item._id;
            delete item._id;
            out.push(item);
          });
          resolve(out);
        });
    });
  }

  // 查找角色
  findById(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        RoleSchema.findOne({ _id: this.id }).exec((err, res) => {
          if (err || !res) {
            return reject("角色不存在");
          }
          this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 查找角色
  findByName(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.name(this.name);
        RoleSchema.findOne({ name: this.name }).exec((err, res) => {
          if (err || !res) {
            return reject("角色不存在");
          }
          this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 查询角色下的用户
  findUser(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        UserRoleSchema.find({
          roleid: this.id,
        })
          .populate("userid")
          .exec((err, res) => {
            if (err) {
              return reject("查询角色下用户信息失败");
            }
            const out = [];
            for (let i = 0; i < res.length; i++) {
              const { userid: user } = res[i];
              out.push({
                username: user.username,
              });
            }
            resolve(out);
          });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 查询角色下的权限
  findPermission(params = {}, ops = {}) {
    const { tree } = ops;
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        RolePermissionSchema.find({
          roleid: this.id,
        })
          .populate({
            path: "permissionid",
            populate: {
              path: "groupid",
            },
          })
          .exec((err, res) => {
            if (err) {
              return reject("查询角色下权限信息失败");
            }
            const permissionArr = [];
            for (let i = 0; i < res.length; i++) {
              const { permissionid: permission } = res[i];
              // 如果权限被删，保证接口正常不报错
              if(permission === null) break;
              const { name, code, groupid, _id: id } = permission;
              let group = "";
              let groupName = "";
              if (groupid) {
                group = groupid._id;
                groupName = groupid.name;
              }
              permissionArr.push({
                name,
                code,
                group,
                groupName,
                id,
              });
            }
            const out = tree ? permissionTree(permissionArr) : permissionArr;
            resolve(out);
          });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 添加角色
  add(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.name(this.name);
        try {
          await this.findByName();
          reject("同名角色已存在");
        } catch (error) {
          RoleSchema.create({ name: this.name }, (err, res) => {
            if (err) {
              return reject("角色新增失败");
            }
            this.setAttributes(res.toObject());
            resolve(this);
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 编辑角色
  edit(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        await Valid.name(this.name);
        const save = {
          name: this.name,
        };
        let data = await this.findById();
        data.name = save.name;
        data = await data.save();
        resolve();
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 删除角色(物理删除)
  // 要删除对应的用户角色表还有角色权限表
  del(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        RoleSchema.findOneAndRemove({ _id: this.id }).exec(async (err, res) => {
          if (err || !res) {
            // 写危险操作库以及log日志文件，双保险
            await this.warnLog("角色删除失败", `RoleSchema roleid: ${this.id}`);
            warningConsole(`角色删除失败在：RoleSchema roleid: ${this.id}`);
            return reject("角色删除失败");
          } else {
            const roleRes = res;
            UserRoleSchema.deleteMany({ roleid: this.id }).exec(
              async (err, res) => {
                if (err || !res) {
                  // 写系统警告，没有事务回滚，需要手动处理
                  // 写危险操作库以及log日志文件，双保险
                  await this.warnLog(
                    "角色删除失败",
                    `UserRoleSchema roleid: ${
                      this.id
                    } roleData: ${JSON.stringify(roleRes.toJSON())}`
                  );
                  warningConsole(
                    `角色删除失败在：UserRoleSchema roleid: ${
                      this.id
                    } roleData: ${JSON.stringify(roleRes.toJSON())}`
                  );
                  return reject("角色删除失败");
                } else {
                  const userRoleRes = res;
                  RolePermissionSchema.deleteMany({ roleid: this.id }).exec(
                    async (err, res) => {
                      if (err || !res) {
                        // 写系统警告，没有事务回滚，需要手动处理
                        // 写危险操作库以及log日志文件，双保险
                        await this.warnLog(
                          "角色删除失败",
                          `RolePermissionSchema roleid: ${
                            this.id
                          } roleData: ${JSON.stringify(
                            roleRes.toJSON()
                          )} userRoleRes: ${JSON.stringify(
                            userRoleRes.toJSON()
                          )}`
                        );
                        warningConsole(
                          `角色删除失败在：RolePermissionSchema roleid: ${
                            this.id
                          } roleData: ${JSON.stringify(
                            roleRes.toJSON()
                          )} userRoleRes: ${JSON.stringify(
                            userRoleRes.toJSON()
                          )}`
                        );
                        return reject("角色删除失败");
                      } else {
                        resolve(res);
                      }
                    }
                  );
                }
              }
            );
          }
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 检查角色是否已经拥有相同的权限(不要在外部调用)
  static checkRoleHasPermission(roleData, PermissionData) {
    const { _id: roleid } = roleData;
    const { name: permissionName, _id: permissionid } = PermissionData;
    return new Promise(async (resolve, reject) => {
      RolePermissionSchema.find({
        roleid,
        permissionid,
      }).exec((err, res) => {
        if (err) {
          return reject("角色添加权限失败");
        } else if (res.length) {
          return reject(`角色已有权限${permissionName}`);
        } else {
          resolve({
            roleid,
            permissionid,
          });
        }
      });
    });
  }

  // 角色新增权限插表方法(不要在外部调用)
  static addPermissionFn(data) {
    return new Promise(async (resolve, reject) => {
      await RolePermissionSchema.create(data, (err, res) => {
        if (err) {
          return reject("角色添加权限失败");
        }
        resolve();
      });
    });
  }

  static roundAddPermissionFn(query, roleData) {
    return new Promise(async (resolve, reject) => {
      PermissionSchema.find({
        $or: query,
      }).exec(async (err, res) => {
        // 有一个权限未找到，都报权限不存在
        if (err || res.length != query.length) {
          return reject("权限不存在");
        }
        try {
          const addData = [];
          for (let i = 0, max = res.length; i < max; i++) {
            const child = res[i];
            const permissionData = child.toObject();
            addData.push(
              await Role.checkRoleHasPermission(roleData, permissionData)
            );
          }
          await Promise.all(
            addData.map(async (item) => {
              await Role.addPermissionFn(item);
            })
          );
          resolve();
        } catch (error) {
          return reject(error);
        }
      });
    });
  }

  // 角色删除权限插表方法(不要在外部调用)
  static delRoleFn(params) {
    const { permissionid, roleid } = params;
    return new Promise(async (resolve, reject) => {
      await RolePermissionSchema.deleteOne(
        { permissionid, roleid },
        (err, res) => {
          if (err) {
            return reject("角色删除权限失败");
          }
          resolve();
        }
      );
    });
  }

  // 角色绑定权限
  editPermission(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        await Valid.permission(this.permission);
        const roleData = await this.findById();
        const delPermissionArr = [].concat(await this.findPermission());
        const addPermissionArr = [].concat(this.permission);
        for (let i = delPermissionArr.length - 1; i >= 0; i--) {
          const item = delPermissionArr[i];
          for (let j = addPermissionArr.length - 1; j >= 0; j--) {
            const addItem = addPermissionArr[j];
            if (item.id == addItem) {
              delPermissionArr.splice(i, 1);
              addPermissionArr.splice(j, 1);
              break;
            }
          }
        }
        if (addPermissionArr.length) {
          const query = [];
          addPermissionArr.map((item) => {
            query.push({ _id: item });
          });
          await Role.roundAddPermissionFn(query, roleData);
        }
        if (delPermissionArr.length) {
          await Promise.all(
            delPermissionArr.map(async (item) => {
              await Role.delRoleFn({
                roleid: roleData.toObject()._id,
                permissionid: item.id,
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
}

const Valid = {
  id(str) {
    return new Promise((resolve, reject) => {
      if (Role.noVal(str) || validator.isEmpty(str + "")) {
        return reject("角色id不能为空");
      } else if (!mongoose.Types.ObjectId.isValid(str)) {
        return reject("角色id格式错误");
      }
      resolve(str);
    });
  },
  name(str) {
    return new Promise((resolve, reject) => {
      if (Role.noVal(str) || validator.isEmpty(str + "")) {
        return reject("角色名不能为空");
      } else if (!validator.isLength(str + "", { min: 1, max: 10 })) {
        return reject("角色名长度为1~10位");
      }
      resolve();
    });
  },
  permission(val) {
    return new Promise((resolve, reject) => {
      if (!isArray(val)) {
        return reject("传入权限必须为一个数组");
      }
      resolve();
    });
  },
};

module.exports.default = module.exports = Role;
