/*!
 * Role
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
"use strict";

const mongoose = require("mongoose");
const RolePermissionSchema = require("../schema/rolePermission");
const PermissionSchema = require("../schema/permission");
const validator = require("validator");
const BaseModel = require("./BaseModel");
const { isArray } = require("../helper");
const { warningConsole } = require('../helper/node');

class Permission extends BaseModel {
  // 获取列表(无分页)
  static list(ops = {}) {
    // const {} = ops;
    return new Promise(async (resolve, reject) => {
      PermissionSchema.find({}, "name _id groupid code")
        .sort({ createdAt: -1 })
        .populate('groupid')
        .exec((err, res) => {
          if (err) {
            return reject("获取列表失败");
          }
          const out = [];
          res.map((_item) => {
            const item = _item.toJSON();
            item.id = item._id;
            delete item._id;
            if (item.groupid) {
              const { name: groupName, _id: group, } = item.groupid;
              item.groupName = groupName;
              item.group = group;
              delete item.groupid;
            } else if (item.groupid == null) {
              delete item.groupid;
            }
            out.push(item);
          });
          resolve(out);
        });
    });
  }

  // 绑定权限到权限组
  // groudid为空则取消权限与权限组的关联
  static bindGroup(val = {}) {
    const { ids, groupid } = val;
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.ids(ids);
        await Valid.groupid(groupid);
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const permission = new Permission({ id });
          let res = await permission.findById();
          res.groupid = groupid;
          res = await res.save();
        }
        resolve();
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 用code查找权限
  findByCode(params = {}, ops = {}) {
    const defaultOps = {
      setObject: true,
    };
    const { setObject } = { ...defaultOps, ...ops };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.code(this.code);
        PermissionSchema.findOne({ code: this.code }).exec((err, res) => {
          if (err || !res) {
            return reject("权限不存在");
          }
          setObject && this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 用id查找权限
  findById(params = {}, ops = {}) {
    const defaultOps = {
      setObject: true,
    };
    const { setObject } = { ...defaultOps, ...ops };
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        PermissionSchema.findOne({ _id: this.id }).exec((err, res) => {
          if (err || !res) {
            return reject("权限不存在");
          }
          setObject && this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 查询权限下的角色
  findRole(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        RolePermissionSchema.find({
          permissionid: this.id,
        })
          .populate("roleid")
          .exec((err, res) => {
            if (err) {
              return reject("查询权限下角色信息失败");
            }
            const out = [];
            for (let i = 0; i < res.length; i++) {
              const { roleid: role } = res[i];
              out.push({
                name: role.name,
              });
            }
            resolve(out);
          });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 更新权限
  edit(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        await Valid.code(this.code);
        await Valid.name(this.name);
        await Valid.groupid(this.groupid);
        const roleRes = await this.findById({}, { setObject: false });
        roleRes.code = this.code;
        roleRes.name = this.name;
        roleRes.groupid = this.groupid;
        const res = await roleRes.save();
        resolve(res);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 添加权限
  add(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.code(this.code);
        await Valid.name(this.name);
        await Valid.groupid(this.groupid);
        try {
          await this.findByCode(this.code);
          reject("权限已存在");
        } catch (error) {
          PermissionSchema.create(
            {
              code: this.code,
              name: this.name,
              groupid: this.groupid,
            },
            (err, res) => {
              if (err) {
                return reject("权限新增失败");
              }
              this.setAttributes(res.toObject());
              resolve(res.toJSON());
            }
          );
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 删除权限(物理删除)
  // 要删除对应的用户角色表还有角色权限表
  del(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        PermissionSchema.findOneAndRemove({ _id: this.id }).exec(
          async (err, res) => {
            if (err || !res) {
              // 写系统警告，没有事务回滚，需要手动处理
              // 写危险操作库以及log日志文件，双保险
              await this.warnLog("权限删除失败", `PermissionSchema id: ${this.id}`);
              warningConsole(`权限删除失败：PermissionSchema id: ${this.id}`);
              return reject("权限删除失败");
            } else {
              const permissionRes = res;
              RolePermissionSchema.findOneAndRemove({ permissionid: this.id }).exec(async (err, res) => {
                if (err || !res) {
                  // 写系统警告，没有事务回滚，需要手动处理
                  // 写危险操作库以及log日志文件，双保险
                  await this.warnLog("权限删除失败", `RolePermissionSchema permissionid: ${this.id} roleData: ${JSON.stringify(permissionRes.toJSON())}`);
                  warningConsole(`权限删除失败：RolePermissionSchema permissionid: ${this.id} roleData: ${JSON.stringify(permissionRes.toJSON())}`);
                  return reject("权限删除失败");
                } else {
                  resolve(res);
                }
              });
            }
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  }
}

const Valid = {
  ids(arr) {
    return new Promise((resolve, reject) => {
      if (!isArray(arr)) {
        return reject('权限id必须为一个数组');
      } else if (!arr.length) {
        return reject('权限id不能为空');
      }
      resolve(arr);
    });
  },
  id(str) {
    return new Promise((resolve, reject) => {
      if (Permission.noVal(str) || validator.isEmpty(str + "")) {
        return reject("权限id不能为空");
      } else if (!mongoose.Types.ObjectId.isValid(str)) {
        return reject("权限id格式错误");
      }
      resolve(str);
    });
  },
  code(str) {
    return new Promise((resolve, reject) => {
      if (Permission.noVal(str) || validator.isEmpty(str + "")) {
        return reject("权限code不能为空");
      } else if (!validator.isLength(str + "", { min: 1, max: 50 })) {
        return reject("权限code长度为1~50位");
      }
      resolve(str);
    });
  },
  groupid(str) {
    return new Promise((resolve, reject) => {
      if (
        !(Permission.noVal(str) || validator.isEmpty(str + "")) &&
        !mongoose.Types.ObjectId.isValid(str)
      ) {
        return reject("权限组id格式错误");
      }
      resolve(str);
    });
  },
  name(str) {
    return new Promise((resolve, reject) => {
      if (Permission.noVal(str) || validator.isEmpty(str + "")) {
        return reject("权限名不能为空");
      } else if (!validator.isLength(str + "", { min: 1, max: 20 })) {
        return reject("权限名长度为1~20位");
      }
      resolve();
    });
  },
};

module.exports.default = module.exports = Permission;
