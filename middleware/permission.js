/*!
 * permission
 * create: 2020/06/02
 * since: 0.0.1
 */
'use strict';
const User = require('../models/user');
const Role = require('../models/role');
const { permissionTree, errAdd } = require('../helper/node');
const { mathArr, isArray } = require('../helper');

const hasFn = (permissionList = [], permission = [], permissionMode = '|') => {
  let flag = false;
  const set = new Set(permissionList);
  let allIndex = 0;
  for (let i = 0; i < permission.length; i++) {
    const el = permission[i];
    if (set.has(el)) {
      if (permissionMode === '|') {
        flag = true;
        break;
      } else {
        allIndex += 1;
      }
    }
  }
  if (permissionMode !== '|' && allIndex === permission.length) {
    flag = true;
  }
  return flag;
};

const Permission = {
  // 获取用户所拥有的权限
  async getPermissionFn(_id = '', ops = {}) {
    const { tree, onlyCode } = ops;
    let user = new User({ _id });
    const roleList = await user.hasRole();
    let list = [];
    for (let i = 0; i < roleList.length; i++) {
      const { id } = roleList[i];
      const role = new Role({ id });
      const plist = await role.findPermission();
      list = list.concat(plist);
    }
    let tempObj = {};
    let out = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!tempObj[item.id]) {
        out.push(onlyCode ? item.code : item);
      }
      tempObj[item.id] = true;
    }
    return tree ? permissionTree(out) : out;
  },

  // 获取权限中间件
  // 入参为访问控制器所需的权限
  getPermission(inPermission = [], ops = {}) {
    const defaultOps = {
      mode: '|',
    };
    const { mode } = {...defaultOps, ...ops};
    return async (ctx, next) => {
      let _inPermission = inPermission;
      try {
        if (!isArray(_inPermission)) {
          if (typeof _inPermission === 'string') {
            _inPermission = [_inPermission];
          } else {
            throw new Error('inPermission必须为数组或字符串');
          }
        }
        const permissionArr = await Permission.getPermissionFn(ctx.user._id, { onlyCode: true });
        if (_inPermission.length && !hasFn(permissionArr, _inPermission, mode)) {
          throw new Error('权限校验失败');
        }
        ctx.user.permission = permissionArr;
        await next();
      } catch (error) {
        return errAdd(ctx, error.message, 403);
      }
    };
  },
};

module.exports.default = module.exports = Permission;
