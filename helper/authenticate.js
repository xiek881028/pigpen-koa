/*!
 * authenticate
 * create: 2018/09/24
 * since: 0.0.1
 */
'use strict';

const jwt = require('jsonwebtoken');
const redis = require('redis');
const User = require('../models/user');

const publicFn_node = require('./node');

// token验证
// 验证失败是否在redis里删除对应数据 del{ client: redis连接, sessionId: id }
function verifyToken(token, secret, del = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (del.sessionId) {
          del.client.del(del.sessionId);
        }
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

//根据sessionId寻找userId
function findUserBySession(id, client = redis.createClient(process.env.APP_REDIS_MASTER)) {
  return new Promise((resolve, reject) => {
    client.hmget(id, ['id', 'timeout_in', 'last_requested_at'], (err, res) => {
      if (err) {
        reject(err);
        client.del(id);
        return;
      }
      resolve(res);
    });
  });
}

// 校验验证码
function vailCaptcha(data, suffix = '', name) {
  return new Promise((resolve, reject) => {
    let client = redis.createClient(process.env.APP_REDIS_MASTER);
    client.hmget(`${data.mail}-${suffix}`, ['captcha'], async (err, res) => {
      if (err) {
        return reject('验证失败，请联系管理员');
      }
      if (data[name].trim() != res[0]) {
        return reject('验证码错误');
      } else {
        resolve();
      }
    });
  });
}

// 用户登录验证
module.exports.default = module.exports = {
  // 登陆权限认证
  vail(error = '没有权限') {
    return async (ctx, next) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      let authorization = ctx.header.authorization;
      let token = jwt.decode(authorization);
      if (!token || token.sessionId == undefined) {
        publicFn_node.errAdd(ctx, { error }, 401);
        return;
      } else {
        try {
          let redisUser = await findUserBySession(token.sessionId, client);
          let user = new User({ _id: redisUser[0] });
          await user.findById();
          await verifyToken(authorization, user.salt + user.lastLoginTime + process.env.APP_SECRET_KEY_BASE, {
            client,
            sessionId: token.sessionId,
          });
          if (+redisUser[1] && redisUser[2]) {
            let now = +new Date();
            if (now <= +redisUser[2] + +redisUser[1]) {
              client.hmset(token.sessionId, { last_requested_at: now });
              client.pexpire(token.sessionId, +redisUser[1]);
            } else {
              client.del(token.sessionId);
              throw err;
            }
          }
          ctx.user = user;
        } catch (err) {
          publicFn_node.errAdd(ctx, { error }, 401);
          return;
        }
      }
      await next();
    }
  },

  // 验证码验证
  captcha(suffix = '', name) {
    return async (ctx, next) => {
      let data = ctx.request.permit(['mail', name]);
      try {
        await vailCaptcha(data, suffix, name);
      } catch (error) {
        publicFn_node.errAdd(ctx, { error }, 401);
        return;
      }
      await next();
    }
  },
}
