'use strict';

// 权限表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const rolePermissionSchema = new mongoose.Schema({
  permissionid: {
    type: Schema.Types.ObjectId,
    required: '权限id不能为空',
    ref: 'permission',
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

rolePermissionSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('rolePermission', rolePermissionSchema);
