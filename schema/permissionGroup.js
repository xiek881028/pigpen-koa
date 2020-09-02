'use strict';

// 权限组表
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const permissionGroupSchema = new mongoose.Schema({
  // 权限组名
  name: {
    type: String,
    required: '权限组名不能为空',
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

permissionGroupSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('permissionGroup', permissionGroupSchema);
