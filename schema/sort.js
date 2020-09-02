'use strict';

const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { utcDate } = require('../helper/mongoose');

const sortSchema = new mongoose.Schema({
  // 排序字段标识
  flag: {
    type: String,
  },
  // 排序数据(key: 数据id, value: 数据索引位置)
  data: {
    type: Object,
  },
  ...utcDate,
}, {
  id: false,
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
});

sortSchema.plugin(beautifyUnique);

module.exports.default = module.exports = mongoose.model('sort', sortSchema, 'sort');
