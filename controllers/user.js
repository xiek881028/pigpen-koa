/*!
 * User
 * create: 2018/05/07
 * since: 0.0.1
 */
'use strict';

const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const redis = require('redis');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const router = module.exports = new Router();

const authenticate = require('../helper/authenticate');
const publicFn_node = require('../helper/node');

router.prefix('/user');

// POST /user/login
router.post('POST_user_login', '/login', async (ctx, next) => {
  let user = new User(ctx.request.permit(['mail', 'password']));
  let token;
  try {
    await user.login();
  } catch (err) {
    publicFn_node.errAdd(ctx, err);
    return;
  }

  // 默认session过期时间为3天
  function login(user, timeout_in = 1000 * 60 * 60 * 24 * 3) {
    return new Promise((resolve, reject) => {
      let uuid = uuidv4();
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      client.hmset(uuid, { id: user._id, timeout_in, last_requested_at: + new Date() }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        client.pexpire(uuid, timeout_in);
        let token = jwt.sign({ sessionId: uuid }, user.salt + user.lastLoginTime + process.env.APP_SECRET_KEY_BASE);
        resolve(token);
      });
    });
  }
  try {
    token = await login(user);
  } catch (err) {
    publicFn_node.errAdd(ctx, { error: '数据库错误，请联系管理员' });
    return;
  }
  ctx.body = {
    message: '登录成功',
    token,
    redirect_to: '/',
  };
});

// POST /user/register
router.post('POST_user_register', '/register',
  authenticate.captcha('mail-register', 'mailCaptcha'),
  async (ctx, next) => {
    let data = ctx.request.permit(['mail', 'mailCaptcha', 'password', 'repassword']);
    if (data.password != data.repassword) {
      publicFn_node.errAdd(ctx, { error: '两次密码输入不一致' });
      return;
    }
    let user = new User(data);

    try {
      await user.addUser();
    } catch (error) {
      publicFn_node.errAdd(ctx, error);
      return;
    }

    ctx.body = {
      message: '注册成功',
    };
  });

// POST /user/logout
router.post('POST_user_logout', '/logout',
  authenticate.vail(),
  async (ctx, next) => {
    function logout() {
      return new Promise((resolve, reject) => {
        let client = redis.createClient(process.env.APP_REDIS_MASTER);
        let authorization = ctx.header.authorization;
        if (!authorization || !ctx.user || !ctx.user.salt || !ctx.user.lastLoginTime) {
          reject({ error: '登出错误' });
          return;
        }
        jwt.verify(authorization, ctx.user.salt + ctx.user.lastLoginTime + process.env.APP_SECRET_KEY_BASE, (err, decoded) => {
          if (err) {
            reject({ error: '登出错误' });
            return;
          }
          client.del(decoded.sessionId);
          ctx.user = undefined;
          resolve(decoded);
        });
      });
    }
    await logout();

    ctx.body = {
      message: '操作成功',
      redirect_to: '/user/login',
    };
  });

// GET /user/info
router.get('GET_user_info', '/info',
  authenticate.vail(),
  async (ctx, next) => {
    let user = ctx.user;
    ctx.body = {
      message: '操作成功',
      info: {
        mail: user.mail,
        avatar: user.avatar,
      },
    };
  });

// GET /user/mailIsRegister
router.get('GET_user_mailIsRegister', '/mailIsRegister',
  async (ctx, next) => {
    let user = new User({mail: ctx.query.mail});
    try {
      await user.findByName();
      publicFn_node.errAdd(ctx, {error: '邮箱已被注册'});
      return;
    } catch (error) {}
    ctx.body = {
      message: '操作成功',
    };
  });
