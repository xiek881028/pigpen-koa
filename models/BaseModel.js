/*!
 * BaseModel
 * xiekai
 * create: 2018/09/13
 * since: 0.0.1
 */
'use strict';

const { isObject, isArray } = require('../helper/index.js');
const WarnLogSchema = require('../schema/warnLog.js');

module.exports.default = module.exports = class BaseModel {

  constructor(attributes = {}, options = {}) {
    this.setAttributes(attributes);
  }

  setAttributes(attributes = {}) {
    Object.keys(attributes).map(item => {
      // 初始化，将传入值绑定到this上
      this[item] = attributes[item];
    });
  }

  getObject(field = []) {
    let out = {};
    field.map(item => {
      // 从this中取出field中的值返回给out
      out[item] = this[item];
    });
    return out;
  }

  updateObject(field = []) {
    let out = {
      '$set': {},
      '$unset': {},
    };
    let hasSet = false;
    let hasUnset = false;
    field.map(item => {
      // this有，field有意味着需要更新
      if (this[item] !== undefined) {
        hasSet = true;
        out['$set'][item] = this[item];
      } else {// this有，field没有意味着需要删除
        hasUnset = true;
        out['$unset'][item] = this[item];
      }
    });
    if (!hasSet) {
      delete out['$set'];
    }
    if (!hasUnset) {
      delete out['$unset'];
    }
    return out;
  }

  errFormat(err = {}) {
    // let out = {};
    // // 只将err中的message取出返回，返回为所有错误
    // Object.keys(err).map(item => {
    //   out[item] = err[item].message;
    // });
    // return out;
    // 修改为只返回第一个错误
    return err[Object.keys(err)[0]].message;
  }

  // 检查日志所需信息
  checkLogs() {
    return new Promise((resolve, reject) => {
      if (typeof this.logs === "object" && Object.keys(this.logs).length) {
        resolve();
      } else {
        reject("日志预检查失败");
      }
    });
  }

  // 危险操作写入危险日志表
  warnLog(title = '', log = '') {
    return new Promise((resolve, reject) => {
      WarnLogSchema
        .create({
          title,
          log,
        }, (err, res) => {
          if(err) {
            console.error('err: ', err);
            reject("危险日志写入失败");
          }
          resolve(res);
        });
    });
  }

  static noVal(str) {
    return str === undefined || str === null || (typeof str === 'number' && isNaN(str));
  }

  static pruneEmptyData(data) {
    let out = {};
    Object.keys(data).map(item => {
      let key = data[item];
      if (!(key === '' || key == undefined || (typeof key === 'number' && isNaN(key)) || key == null || (isObject(key) && !Object.keys(key).length) || (isArray(key) && !key.length))) {
        out[item] = key;
      }
    });
    return out;
  }

}
