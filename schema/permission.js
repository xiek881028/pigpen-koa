'use strict';

// 权限表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const permissionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: '权限code不能为空',
  },
  name: {
    type: String,
    required: '权限不能为空',
  },
  // 权限所属组
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'permissionGroup',
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

permissionSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('permission', permissionSchema);
