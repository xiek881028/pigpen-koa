/*!
 * File
 * create: 2018/07/25
 * since: 0.0.1
 */
'use strict';

const multer = require('koa-multer');
const Router = require('koa-router');

const User = require('../models/user');
const router = module.exports = new Router();

const authenticate = require('../public/authenticate');

router.prefix('/file');

// POST /file
router.post('POST_file', '/avatar',
  authenticate.vail(),
  multer({ dest: './tmp' }).single('avatar'),
  async (ctx, next) => {
    let file;
    try {
      file = await ctx.fileWrite(ctx.req.file);
      let user = new User({ _id: ctx.user._id, avatar: file._id });
      await user.addAvatar();
    } catch (error) {
      ctx.status = 403;
      ctx.body = error;
      return;
    }
    ctx.body = {
      id: file._id,
    };
  });

// GET /file/:id
router.get('GET_file_id', '/:id', async (ctx, next) => {
  let file = ctx.fileRead(ctx.params.id);
  let fileInfo;
  try {
    fileInfo = await ctx.fileFindById(ctx.params.id, 'filename contentType md5 uploadDate');
  } catch (error) {
    ctx.status = 403;
    ctx.body = error;
    return;
  }

  ctx.etag = fileInfo.md5;
  ctx.lastModified = fileInfo.uploadDate;
  ctx.status = 200;
  if (ctx.fresh) {
    return ctx.status = 304;
  }

  ctx.type = fileInfo.contentType;
  (ctx.query.download || !/^image\/.*$/.test(ctx.type)) && ctx.attachment(fileInfo.filename);
  ctx.body = file;
});
