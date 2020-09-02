/*!
 * Role
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
"use strict";

const PermissionGroupSchema = require("../schema/permissionGroup");
const mongoose = require("mongoose");
const validator = require("validator");
const BaseModel = require("./BaseModel");

class Permission extends BaseModel {
  // 获取列表(无分页)
  static list(delId = true) {
    return new Promise(async (resolve, reject) => {
      PermissionGroupSchema.find({}, "name _id")
        .sort({ createdAt: -1 })
        .exec((err, res) => {
          if (err) {
            return reject("获取列表失败");
          }
          const out = [];
          res.map((_item) => {
            const item = _item.toJSON();
            if (delId) {
              item.id = item._id;
              delete item._id;
            }
            out.push(item);
          });
          resolve(out);
        });
    });
  }

  // 用id查找权限组
  findById(params = {}, ops = { setObject: true }) {
    const { setObject } = ops;
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        PermissionGroupSchema.findOne({ _id: this.id }).exec((err, res) => {
          if (err || !res) {
            return reject("权限组不存在");
          }
          setObject && this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }
  // 用name查找权限组
  findByName(params = {}, ops = { setObject: true }) {
    const { setObject } = ops;
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.name(this.name);
        PermissionGroupSchema.findOne({ name: this.name }).exec((err, res) => {
          if (err || !res) {
            return reject("权限组不存在");
          }
          setObject && this.setAttributes(res.toObject());
          resolve(res);
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 更新权限组
  edit(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        await Valid.name(this.name);
        try {
          await this.findByName({}, { setObject: false })
          reject("权限组已存在");
        } catch (error) {
          const permissionGroupRes = await this.findById({}, { setObject: false });
          permissionGroupRes.name = this.name;
          const res = await permissionGroupRes.save();
          resolve(res);
        }
      } catch (error) {
        return reject(error);
      }
    });
  }

  // 添加权限组
  add(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.name(this.name);
        try {
          await this.findByName(this.name);
          reject("权限组已存在");
        } catch (error) {
          PermissionGroupSchema.create(
            {
              name: this.name,
            },
            (err, res) => {
              if (err) {
                return reject("权限组新增失败");
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

  // 删除权限组(物理删除)
  del(params = {}) {
    this.setAttributes(params);
    return new Promise(async (resolve, reject) => {
      try {
        await Valid.id(this.id);
        PermissionGroupSchema.findOneAndRemove({ _id: this.id }).exec(
          async (err, res) => {
            if (err || !res) {
              return reject("权限组删除失败");
            } else {
              resolve(res);
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
  id(str) {
    return new Promise((resolve, reject) => {
      if (Permission.noVal(str) || validator.isEmpty(str + "")) {
        return reject("权限组id不能为空");
      } else if (!mongoose.Types.ObjectId.isValid(str)) {
        return reject("权限组id格式错误");
      }
      resolve(str);
    });
  },
  name(str) {
    return new Promise((resolve, reject) => {
      if (Permission.noVal(str) || validator.isEmpty(str + "")) {
        return reject("权限组名不能为空");
      } else if (!validator.isLength(str + "", { min: 1, max: 10 })) {
        return reject("权限组名长度为1~10位");
      }
      resolve();
    });
  },
};

module.exports.default = module.exports = Permission;
