/*!
 * User
 * create: 2018/05/07
 * since: 0.0.1
 */
'use strict';

const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Role = require('../models/role');
const router = module.exports = new Router();

const { vail } = require('../middleware/authenticate');
const { getPermissionFn, getPermission } = require('../middleware/permission');
const { errAdd, redisSet, redisRemove } = require('../helper/node');

router.prefix('/user');

// POST /user/login
router.post('POST_user_login', '/login', async (ctx, next) => {
  let user = new User(ctx.request.permit(['username', 'password']));
  let token;
  try {
    await user.login();
  } catch (err) {
    return errAdd(ctx, err);
  }
  try {
    const uuid = `session:${uuidv4()}`;
    // 默认session过期时间为3天
    let timeout_in = 1000 * 60 * 60 * 24 * 3;
    await redisSet(uuid, JSON.stringify({
      id: user._id + '',
      timeout_in,
      last_requested_at: + new Date()
    }), { timeout_in });
    token = jwt.sign({ sessionId: uuid }, user.salt + user.lastLoginTime + process.env.APP_SECRET_KEY_BASE);
  } catch (err) {
    return errAdd(ctx, '数据库错误，请联系管理员');
  }
  const { username, first } = user;
  ctx.body = {
    flag: true,
    message: '登录成功',
    data: {
      token,
      userinfo: {
        username,
        first,
      },
    },
  };
});

// 添加用户
router.post('POST_user_add', '/add',
  vail(),
  getPermission('add_user'),
  async (ctx, next) => {
    try {
      let user = new User(ctx.request.permit(['username', 'password']));
      await user.addUser();
    } catch (error) {
      return errAdd(ctx, error);
    }
    ctx.body = {
      flag: true,
      message: '添加用户成功',
    };
  });

// 获取用户列表
router.get('GET_user_list', '/list',
  vail(),
  getPermission('find_user'),
  async (ctx, next) => {
    try {
      const list = await User.list();
      ctx.body = {
        flag: true,
        message: '查询成功',
        data: list,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 获取绑定用户所需数据
router.get('GET_bind_role_data', '/bindRoleData',
  vail(),
  getPermission('find_user'),
  async (ctx, next) => {
    try {
      const { id: _id } = ctx.query;
      let user = new User({ _id });
      const role = await user.hasRole();
      const list = await Role.list();
      ctx.body = {
        flag: true,
        message: '查询成功',
        data: {
          role,
          list,
        },
      };
    } catch (error) {
      return errAdd(ctx, error);
    }
  });

// 用户添加(编辑)角色
router.post('POST_user_edit_role', '/editRole',
  vail(),
  getPermission('edit_user_role'),
  async (ctx, next) => {
    try {
      const { id: _id, role } = ctx.request.permit(['id', 'role']);
      let user = new User({
        _id,
        role,
      });
      await user.editRole();
    } catch (error) {
      return errAdd(ctx, error);
    }
    ctx.body = {
      flag: true,
      message: '用户修改所属角色成功',
    };
  });

// 用户所属的角色
// router.post('POST_user_has_role', '/hasRole',
//   vail(),
//   getPermission('find_user'),
//   async (ctx, next) => {
//     try {
//       const { id } = ctx.request.permit(['id']);
//       const queryUser = id !== undefined ? id : ctx.user._id;
//       let user = new User({ _id: queryUser });
//       const role = await user.hasRole();
//       ctx.body = {
//         flag: true,
//         message: '查询用户所属角色成功',
//         data: {
//           role,
//         },
//       };
//     } catch (error) {
//       return errAdd(ctx, error);
//     }
//   });

// POST /user/logout
router.post('POST_user_logout', '/logout',
  vail(),
  async (ctx, next) => {
    try {
      await redisRemove(ctx.user.sessionId);
      // ctx.user = undefined;
      ctx.body = {
        flag: true,
        message: '操作成功',
      };
    } catch (error) {
      return errAdd(ctx, '登出失败');
    }
  });

// 获取自己的用户信息
router.get('GET_user_info', '/info',
  vail(),
  async (ctx, next) => {
    const { username, first, _id } = ctx.user;
    ctx.body = {
      flag: true,
      message: '操作成功',
      data: {
        username,
        first,
      },
    };
  });

// 用户所拥有的权限(自己)
router.get('POST_user_permission', '/permission',
  vail(),
  async (ctx, next) => {
    try {
      ctx.body = {
        flag: true,
        message: '操作成功',
        data: await getPermissionFn(ctx.user._id, { onlyCode: true }),
      };
    } catch (error) {
      return errAdd(ctx, '获取权限失败');
    }
  });

// 用户所拥有的权限(管理员)
router.post('POST_user_permission_by_id', '/permissionById',
  vail(),
  getPermission('find_user'),
  async (ctx, next) => {
    try {
      const { id, tree } = ctx.request.permit(['id', 'tree']);
      ctx.body = {
        flag: true,
        message: '操作成功',
        data: {
          list: await getPermissionFn(id, { tree }),
        },
      };
    } catch (error) {
      // return errAdd(ctx, '获取权限失败');
      return errAdd(ctx, error);
    }
  });

// 停用/启用用户
router.post('using_user', '/using',
  vail(),
  getPermission('edit_user_using'),
  async (ctx, next) => {
    const { id: _id, using } = ctx.request.permit(['id', 'using']);
    try {
      let user = new User({
        _id,
        using,
      });
      await user.editUsing();
      ctx.body = {
        flag: true,
        message: `用户${using ? '启用' : '停用'}成功`,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 删除用户(物理删除)
router.post('delete_user', '/del',
  vail(),
  getPermission('del_user'),
  async (ctx, next) => {
    const { id: _id } = ctx.request.permit(['id']);
    try {
      let user = new User({
        _id,
      });
      await user.del();
      await redisRemove(`userid:${_id}`);
      ctx.body = {
        flag: true,
        message: `用户删除成功`,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 重置密码
router.post('reset_pwd', '/resetPwd',
  vail(),
  getPermission('reset_user_pwd'),
  async (ctx, next) => {
    try {
      const { id: _id, password } = ctx.request.permit(['id', 'password']);
      let user = new User({
        _id,
        password,
      });
      await user.editPwd({}, { first: true });
      // 并不知道修改用户的sessionId，redis只能冗余
      // ctx.user = undefined;
      ctx.body = {
        flag: true,
        message: '密码重置成功',
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 修改密码
router.post('edit_pwd', '/editPwd',
  vail(),
  async (ctx, next) => {
    try {
      let user = new User(ctx.request.permit(['password'], { _id: ctx.user._id }));
      await user.editPwd();
      await redisRemove(ctx.user.sessionId);
      ctx.user = undefined;
      ctx.body = {
        flag: true,
        message: '密码修改成功',
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });
