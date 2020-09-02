'use strict';

// 用户角色对应表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const userRoleSchema = new mongoose.Schema({
  userid: {
    type: Schema.Types.ObjectId,
    required: '用户id不能为空',
    ref: 'user',
  },
  roleid: {
    type: Schema.Types.ObjectId,
    required: '角色id不能为空',
    ref: 'role',
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

userRoleSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('userRole', userRoleSchema);
