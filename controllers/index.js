'use strict';

const Router = require('koa-router');
// const pkg = require('../package.json');

const router = new Router();

[
  require('./file'),
  require('./home'),
  require('./user'),
  require('./captcha'),
].forEach(controller => router.use(controller.routes(), controller.allowedMethods()));

router.prefix('/api');

module.exports = router;
