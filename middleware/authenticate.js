/*!
 * authenticate
 * create: 2018/09/24
 * since: 0.0.1
 */
'use strict';

const jwt = require('jsonwebtoken');
const redis = require('redis');
const UserSchema = require('../schema/user');

const { errAdd, redisGet, redisSet, redisRemove } = require('../helper/node');

// token验证
// 验证失败在redis里删除对应数据
function verifyToken(token, secret, sessionId) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        await redisRemove(sessionId);
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

// 校验验证码
// function vailCaptcha(data, suffix = '', name) {
//   return new Promise((resolve, reject) => {
//     let client = redis.createClient(process.env.APP_REDIS_MASTER);
//     client.hmget(`${data.mail}-${suffix}`, ['captcha'], async (err, res) => {
//       if (err) {
//         return reject('验证失败，请联系管理员');
//       }
//       if (data[name].trim() != res[0]) {
//         return reject('验证码错误');
//       } else {
//         resolve();
//       }
//     });
//   });
// }

function findById(id) {
  // 直接使用schema，避免和model绑定
  return new Promise((resolve, reject) => {
    UserSchema.findById(id).exec((err, info) => {
      if (err || !info) {
        reject();
      } else {
        resolve(info);
      }
    });
  });
}

module.exports.default = module.exports = {

  // 后台权限认证
  vail(error = '未登录') {
    return async (ctx, next) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      // 请求验证header自定义字段 authorization
      let authorization = ctx.header.authorization;
      if (!authorization) return errAdd(ctx, error, 401);
      // 解密token
      const token = jwt.decode(authorization);
      const sessionId = token.sessionId;
      // 解密失败，返回未登录
      if (!token || sessionId == undefined) {
        return errAdd(ctx, error, 401);
      } else {
        // 解密成功，token合法，但不确定里面的信息和用户信息是否匹配
        try {
          let redisUser = JSON.parse(await redisGet(sessionId));
          let user;
          let redisUserInfo = JSON.parse(await redisGet(`userid:${redisUser.id}`));
          // 如果在redis有缓存的用户信息，取缓存。如果没有，查库获取用户信息，同时放入redis缓存
          if (redisUserInfo) {
            user = redisUserInfo;
          } else {
            let dbUserInfo = (await findById(redisUser.id)).toObject();
            await redisSet(`userid:${dbUserInfo._id}`, JSON.stringify(dbUserInfo), { timeout_in: 1000 * 60 * 60 * 24 });
            user = dbUserInfo;
          }
          const { salt, lastLoginTime, _id, createdAt, updatedAt, username, using, first } = user;
          // 与数据库的用户信息校验核对，核对失败，token可能是伪造的，删除token
          const { sessionId: id } = await verifyToken(authorization, salt + lastLoginTime + process.env.APP_SECRET_KEY_BASE, sessionId);
          // 账号被停用，删除sessionId，直接踢下线
          if (!using) {
            client.del(id);
            throw err;
          }
          // 有最后登录时间和过期时间
          if (+redisUser.timeout_in && redisUser.last_requested_at) {
            let now = +new Date();
            // 当前时间小于登录时间+过期时间，session未过期
            if (now <= +redisUser.last_requested_at + +redisUser.timeout_in) {
              // 更新最后登录时间，续约session
              client.set(id, JSON.stringify({ ...redisUser, last_requested_at: now }));
              // 更新redis的session过期时间
              client.pexpire(id, +redisUser.timeout_in);
            } else {
              // session过期，删除session
              client.del(id);
              throw err;
            }
          }
          ctx.user = {
            _id,
            lastLoginTime,
            createdAt,
            updatedAt,
            username,
            sessionId,
            first,
          };
        } catch (err) {
          return errAdd(ctx, error, 401);
        }
      }
      await next();
    }
  },

  // 在ctx写入log所需信息
  log() {
    return async (ctx, next) => {
      const { _id, username } = ctx.user;
      ctx.logs = {
        ip: ctx.request.ip,
        userid: _id + '',
        username,
        logTime: +new Date() + '',
      };
      await next();
    }
  },

  // 验证码验证
  // captcha(suffix = '', name) {
  //   return async (ctx, next) => {
  //     let data = ctx.request.permit(['mail', name]);
  //     try {
  //       await vailCaptcha(data, suffix, name);
  //     } catch (error) {
  //       publicFn_node.errAdd(ctx, { error }, 401);
  //       return;
  //     }
  //     await next();
  //   }
  // },
}
