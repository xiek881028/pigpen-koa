/*!
 * File
 * create: 2018/07/25
 * since: 0.0.1
 */
'use strict';

const multer = require('@koa/multer');
const Router = require('koa-router');
const router = module.exports = new Router();
const { vail } = require('../middleware/authenticate');

router.prefix('/file');

// POST /file
// router.post('POST_file', '/avatar',
//   // vail(),
//   multer().single('avatar'),
//   async (ctx, next) => {
//     try {
//       let file = await ctx.fileWrite(ctx.file);
//       ctx.body = {
//         id: file._id,
//       };
//     } catch (error) {
//       ctx.status = 403;
//       ctx.body = error;
//     }
//   });

// GET /file/:id
router.get('GET_file_id', '/:id', async (ctx, next) => {
  try {
    let fileInfo = await ctx.fileFindById(ctx.params.id);
    // 默认接口不走304，单独为图片获取配置
    ctx.etag = fileInfo.md5;
    ctx.lastModified = fileInfo.uploadDate;
    if (ctx.fresh) {
      return ctx.status = 304;
    }
    ctx.type = fileInfo.contentType;
    // 加download为下载文件
    (ctx.query.download || !/^image\/.*$/.test(ctx.type)) && ctx.attachment(fileInfo.filename);
    ctx.body = fileInfo.read();
  } catch (error) {
    ctx.status = 403;
    ctx.body = error;
    return;
  }
});
