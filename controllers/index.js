'use strict';

const Router = require('koa-router');
// const pkg = require('../package.json');
// const fs = require('fs-extra');
// const path = require('path');

const router = new Router();

[
  require('./file'), // 文件相关
  // require('./home'),
  // require('./captcha'),
  require('./user'), // 后台用户模块
  require('./role'), // 角色模块
  require('./permission'), // 权限模块
].forEach(controller => router.use(controller.routes(), controller.allowedMethods()));

router.prefix('/api');

module.exports = router;
