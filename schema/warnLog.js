'use strict';

// 角色表
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const warnLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: '危险日志标题不能为空',
  },
  log: {
    type: String,
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

warnLogSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('log.warn', warnLogSchema);
