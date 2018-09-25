/*!
 * BaseModel
 * xiekai
 * create: 2018/09/13
 * since: 0.0.1
 */
'use strict';

module.exports.default = module.exports = class BaseModel {

  constructor(attributes = {}, options = {}) {
    this.set_attributes(attributes);
  }

  set_attributes(attributes) {
    Object.keys(attributes).map(item => {
      this[item] = attributes[item];
    });
  }

  errFormat(err = {}) {
    let out = {};
    Object.keys(err).map(item => {
      out[item] = err[item].message;
    });
    return out;
  }

}
