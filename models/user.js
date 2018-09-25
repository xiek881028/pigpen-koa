/*!
 * User
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
'use strict';

const crypto = require('crypto');

const UserSchema = require('../schema/user');
const validator = require('validator');
const BaseModel = require('./BaseModel');

const valid = {
  mail: (_mail) => {
    let mail = _mail + '';
    let result = true;
    if (!validator.isEmail(mail)) {
      result = false;
    }
    return result;
  },
};

module.exports.default = module.exports = class User extends BaseModel {

  // mail, password, lastLoginTime, _id, salt, avatar,

  // 获取随机盐
  getSalt(num = 28) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(num, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  }

  // 根据用户名寻找用户
  findByName() {
    return new Promise((resolve, reject) => {
      if (!valid.mail(this.mail)) {
        reject({ mail: '邮箱格式错误' });
        return;
      }
      UserSchema.findOne({ mail: this.mail }).exec((err, info) => {
        if (err || !info) {
          reject({ user: '用户不存在' });
          return;
        }
        this.set_attributes(info.toObject());
        resolve(info);
      });
    });
  }

  // 根据用户id寻找用户
  findById() {
    return new Promise((resolve, reject) => {
      UserSchema.findById(this._id).exec((err, info) => {
        if (err || !info) {
          reject({ user: '用户不存在' });
          return;
        }
        this.set_attributes(info.toObject());
        resolve(info);
      });
    });
  }

  addAvatar() {
    return new Promise((resolve, reject) => {
      UserSchema.findByIdAndUpdate(this._id, {
        avatar: this.avatar
      }, {
          runValidators: true,
          upsert: true,
          new: true,
        }, (err, info) => {
          if (err) {
            reject(this.errFormat(err.errors));
            return;
          }
          this.set_attributes(info.toObject());
          resolve(this);
        });
    });
  }

  // 新增用户
  addUser() {
    return new Promise(async (resolve, reject) => {
      let salt;
      try {
        salt = await this.getSalt();
      } catch (err) {
        reject({ user: '注册失败，请联系管理员' });
      }
      UserSchema.create({
        mail: this.mail,
        password: this.password,
        salt,
      }, (err, info) => {
        if (err) {
          reject(this.errFormat(err.errors));
          return;
        }
        this.set_attributes(info.toObject());
        resolve(this);
      });
    });
  }

  // 登录
  login() {
    return new Promise(async (resolve, reject) => {
      let enterPassword = this.password;
      try {
        let userModel = await this.findByName();
        await userModel.vailPwd(enterPassword);
      } catch (err) {
        reject(err);
        return;
      }
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
          this.set_attributes(info.toObject());
          resolve(this);
        });
    });
  }
}
