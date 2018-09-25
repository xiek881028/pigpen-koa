/*!
 * Captcha
 * create: 2018/09/24
 * since: 0.0.1
 */
'use strict';

const Router = require('koa-router');
const router = module.exports = new Router();

const User = require('../models/user');
const publicFn_node = require('../public/node');

router.prefix('/captcha');

// POST /captcha/register
router.post('POST_captcha_register', '/register', async (ctx, next) => {
  let info = ctx.request.permit(['mail']);
  let user = new User(info);
  try {
    await user.findByName();
    publicFn_node.errAdd(ctx, { error: '邮箱已被注册' }, 401);
    return;
  } catch (err) {}
  try {
    await publicFn_node.mailCaptcha(ctx, `${info.mail}-mail-register`, '285985285@qq.com', '注册Bagazhu', '注册');
  } catch (err) {
    ctx.status = 403;
    publicFn_node.errAdd(ctx, { error: '邮件发送失败，请联系管理员' });
    return;
  }
  ctx.body = {
    message: '邮件发送成功',
  };
});
