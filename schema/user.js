'use strict';

const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: '用户名已被注册',
    required: '用户名不能为空',
  },
  password: {
    type: String,
    required: '用户密码不能为空',
  },
  salt: {
    type: String,
    required: 'salt不能为空',
  },
  lastLoginTime: {
    type: String,
  },
  // 账号是否启用
  using: {
    type: Boolean,
  },
  // 是否是首次登录（未修改过密码）
  first: {
    type: Boolean,
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

userSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('user', userSchema);
