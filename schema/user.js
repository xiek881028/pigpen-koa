/*!
 * User
 * xiekai
 * create: 2018/09/06
 * since: 0.0.1
 */
'use strict';

const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const crypto = require('crypto');

validate.extend('isNumber', val => {
  return /^[\d]+$/.test(val);
}, '检验值不为数字');

validate.extend('isNotEmpty', val => {
  return val.trim().length !== 0;
}, '检验值为零');

const userSchema = new mongoose.Schema({
  mail: {
    type: String,
    unique: '邮箱已被注册',
    required: '邮箱不能为空',
    validate: [
      validate({
        validator: 'isEmail',
        message: '邮箱格式错误',
      }),
    ],
  },
  password: {
    type: String,
    required: '用户密码不能为空',
    validate: [
      validate({
        validator: 'isNotEmpty',
        message: '用户密码不能全为空格',
      }),
      validate({
        validator: 'isAscii',
        message: '用户密码含有非法字符',
      }),
    ],
  },
  salt: {
    type: String,
    required: 'salt不能为空',
  },
  lastLoginTime: {
    type: String,
    validate: [
      validate({
        validator: 'isNumber',
        message: '时间戳格式错误，请联系管理员',
      }),
    ],
  },
  avatar: {
    type: String,
  },
}, {
    timestamps: true,
  });

// 密码加密
function getPwd(pwd, salt, iterations = 256, keylen = 64, digest = 'sha512') {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(pwd, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

userSchema.plugin(beautifyUnique);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await getPwd(this.password, this.salt);
  } catch (err) {
    return next({ errors: { password: { message: '密码保存失败，请联系管理员' } } });
  }
  next();
});

userSchema.methods.vailPwd = function (pwd) {
  return new Promise(async (resolve, reject) => {
    if (this.password != await getPwd(pwd, this.salt)) {
      return reject({ user: '用户名或密码错误' });
    }
    resolve();
  });
}

module.exports.default = module.exports = mongoose.model('user', userSchema);
