/*!
 * Controllers
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/12/13
 * since: 0.0.1
 */
'use strict';

const Router = require('koa-router');
// const pkg = require('../package.json');

const router = module.exports = new Router();

[
  require('./file'),
  require('./home'),
  require('./user'),
  require('./captcha'),
].forEach(controller => router.use(controller.routes(), controller.allowedMethods()));

router.prefix('/api');
