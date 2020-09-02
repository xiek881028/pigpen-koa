'use strict';

// 角色表
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: '角色名不能为空',
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

roleSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('role', roleSchema);
