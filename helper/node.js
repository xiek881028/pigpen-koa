/*!
 * node
 * xiekai <xk285985285@.qq.com>
 * create: 2018/09/13
 * since: 0.0.1
 */
'use strict';
const fs = require('fs-extra');
const path = require('path');
const redis = require('redis');
const crypto = require('crypto');
const moment = require('moment');
const { isArray, isObject } = require('./index');

module.exports = {

  // 添加错误
  errAdd(ctx, message = '系统错误', status = 403) {
    ctx.status = status;
    ctx.body = {
      flag: false,
      message,
    };
  },

  // 循环指定目录，输出目录内所有文件列表的数组
  // file 文件名或文件夹名
  // loop 是否循环遍历所有子目录
  fileTree: function (file, loop = true) {
    let fileList = [];
    function walk(file) {
      //如果入参是文件，直接加入数组返回
      if (!fs.statSync(file).isDirectory()) {
        fileList.push(file);
        return;
      }
      let dirlist = fs.readdirSync(file);
      dirlist.forEach(function (item) {
        let itemPath = path.resolve(file, item);
        if (fs.statSync(itemPath).isDirectory() && loop) {
          walk(itemPath);
        } else {
          fileList.push(itemPath);
        }
      });
    };
    walk(file);
    return fileList;
  },

  // redis set hash
  redisSet(name, data, ops = {}) {
    return new Promise((resolve, reject) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      client.set(name, data, (err, res) => {
        if (err) {
          return reject(err);
        }
        // 有更新时间，续约
        ops.timeout_in != undefined && client.pexpire(name, ops.timeout_in);
        resolve(res);
      });
    });
  },

  // redis get hash
  redisGet(name) {
    return new Promise((resolve, reject) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      client.get(name, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  },

  // redis rm hash
  redisRemove(name) {
    return new Promise((resolve, reject) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      client.del(name, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  },

  // 设置允许上传文件类型
  fileFilter(types = []) {
    let type = new Set(types);
    return (req, file, cb) => {
      if (!type.has(file.mimetype)) {
        let error = new Error('文件格式不支持');
        error.code = 'ERROR_TYPE';
        cb(error);
      } else {
        cb(null, true);
      }
    };
  },

  // 删除文件
  delFiles(list = []) {
    if (typeof (list) == 'String') {
      fs.remove(list);
    } else if (isArray(list)) {
      list.map(item => {
        fs.remove(item);
      });
    } else if (isObject(list)) {
      Object.keys(list).map(item => {
        fs.remove(list[item]);
      });
    } else {
      return new Error('删除对象类型只能为string、array、object');
    }
  },

  // 生成指定位数随机byte
  randomBytes(num = 28) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(num, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  },

  // 权限生成树形结构
  permissionTree(list = [], ops = {}) {
    if(!list.length) return [];
    const defaultOps = {
      emptyGroup: [],
      sort: [],
    };
    let _list = [].concat(list);
    const { emptyGroup, sort } = { ...defaultOps, ...ops };
    if (emptyGroup.length) {
      const emptyArr = [];
      for (let i = 0; i < emptyGroup.length; i++) {
        const el = emptyGroup[i];
        emptyArr.push({
          groupName: el.name,
          group: el.id,
        });
      }
      _list = _list.concat(emptyArr);
    }
    const tempJson = {};
    const out = [];
    for (let i = 0; i < _list.length; i++) {
      const { group, groupName, code, name, id } = _list[i];
      if (!tempJson[group]) {
        tempJson[group] = {
          groupName,
          group,
          children: [],
        };
      }
      id && tempJson[group].children.push({
        code,
        name,
        id,
      });
    }
    if (sort.length) {
      for (let i = 0; i < sort.length; i++) {
        const el = sort[i];
        tempJson[el.id] && out.push(tempJson[el.id]);
      }
    } else {
      for (let item in tempJson) {
        out.push(tempJson[item]);
      }
    }
    return out;
  },

  // 危险操作，写入日志文件
  warningConsole(a, b) {
    let log = b ? b : a;
    const dir = path.join(__dirname, '../', 'log/warningConsole.log');
    const message = `${moment().format('YYYY-MM-DD hh:mm:ss')}  ${log}`;
    b ? console.warn(a, b) : console.warn(a);
    fs.ensureFileSync(dir);
    fs.appendFileSync(dir, `${message} \n`);
  },
}
