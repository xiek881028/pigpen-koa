/*!
 * App
 * create: 2017/12/13
 * since: 0.0.1
 */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const log4js = require('log4js');
const stream = require('stream');
// const yaml = require('js-yaml');
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
// const captcha = require('koa-captcha-v2');
// const i18n = require('koa-i18n');
// const locale = require('koa-locale');
// const mailer = require('koa-mailer-v2');
const mongoose = require('mongoose');
const { createModel } = require('mongoose-gridfs');
// const rbac = require('koa-rbac');
const static_middleware = require('koa-static');
// const sass = require('node-sass');
const controllers = require('./controllers');
const pkg = require('./package.json');
const publicFn_node = require('./helper/node');
const app = module.exports = new Koa();
const development = app.env === 'development';
const etag = require('koa-etag');

const port = process.env.APP_PORT || 80;

log4js.configure({
  appenders: {
    console: { type: 'console' },
    dateFile: {
      type: 'dateFile',
      filename: path.join('log', `${app.env}.log`),
      options: { keepFileExt: true },
      pattern: '.yyyyMMdd',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %x{name} %z: %m',
        tokens: {
          name: pkg.name,
        },
      },
    },
  },
  categories: {
    default: { appenders: ['console', 'dateFile'], level: development && 'debug' || 'info' },
  },
  disableClustering: true,
});

app.keys = [process.env.APP_SECRET_KEY_BASE];
app.context.logger = log4js.getLogger();
// 获取用户真实ip
app.proxy = true;

// locale(app);

app
  // 使用304缓存，放在最前面，保证所有的返回资源都可以利用缓存
  .use(async (ctx, next) => {
    await next();
    // 请求协议缓存，返回304
    if (ctx.fresh) {
      ctx.status = 304;
      ctx.body = null;
    }
    // 借鉴egg.js的缓存时间(触发强缓存，优先级高于协议缓存)
    // prod可用 强行使用缓存，开发环境使用会导致文件变化无法更新
    // ctx.res.setHeader('Cache-Control', 'public, max-age=31536000');
    // dev可用 删除强缓存规则，交由浏览器控制
    ctx.res.removeHeader('Cache-Control');
    // api请求不进行缓存，删除缓存规则(测试是否需要)
    if (/^(\/api){1}/.test(ctx.request.url)) {
      ctx.res.removeHeader('ETag');
      ctx.res.removeHeader('Cache-Control');
    }
  })
  .use(etag())
  // 静态文件目录
  .use(static_middleware('dist', {
    // br: true,              // Try to serve the brotli version of a file automatically when brotli is supported by a client and if the requested file with .br extension exists (note, that brotli is only accepted over https)
    // defer: false,          // If true, serves after return next(), allowing any downstream middleware to respond first.
    // extensions: false,     // Try to match extensions from passed array to search for file when no extension is sufficed in URL. First found is served
    // gzip: true,            // Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists
    // hidden: false,         // Allow transfer of hidden files
    // index: 'index.html',   // Default file name
    // maxage: 0,             // Browser cache max-age in milliseconds
    // setHeaders: {},        // Function to set custom headers on response
  }))
  // monogo数据库
  .use(async (ctx, next) => {
    let start = Date.now();
    try {
      await mongoose.connect(process.env.APP_MONGO, {
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
      });
      // ctx.logger.info(`Mongoose connection open to ${process.env.APP_MONGO} - ${Date.now() - start}ms`);
    } catch (error) {
      ctx.logger.info(`Mongoose connection error: ${error} - ${Date.now() - start}ms`);
    }
    await next();
  })
  .use(async (ctx, next) => {
    // 建立model
    let gridfsModel = createModel({
      connection: mongoose.connection
    });
    // 文件写入
    ctx.fileWrite = (file) => {
      // buffer 转 stream
      const _stream = new stream.Duplex();
      _stream.push(file.buffer);
      _stream.push(null);
      return new Promise((resolve, reject) => {
        gridfsModel.write(
          {
            filename: file.originalname,
            contentType: file.mimetype,
          },
          _stream,
          (err, createdFile) => {
            if (err != null) {
              reject(err);
            } else {
              resolve(createdFile);
            }
          }
        );
      });
    }
    // 根据id查找文件 文件正文用attachment.read()获取
    ctx.fileFindById = (objectid) => {
      return new Promise((resolve, reject) => {
        gridfsModel.findById(objectid, (error, attachment) => {
          if (error) {
            reject(error);
          } else {
            resolve(attachment);
          }
        });
      });
    }
    // 根据id删除文件
    ctx.fileUnlinkById = objectid => {
      return new Promise((resolve, reject) => {
        gridfsModel.unlinkById(objectid, (err, unlinkedAttachment) => {
          if (err) {
            reject(err);
          } else {
            resolve(unlinkedAttachment);
          }
        })
      })
    }
    await next();
  })
  // 解析body 放至 ctx.requset.body
  .use(bodyparser({
    // detectJSON: ctx => {},
    // disableBodyParser: false,
    // enableTypes: ['json', 'form'],
    // encode: 'utf-8',
    // extendTypes: [],
    // formLimit: '56kb',
    // jsonLimit: '1mb',
    // onerror: (err, ctx) => {},
    // strict: true,
    // textLimit: '1mb',
  }))
  // 国际化
  // .use(i18n(app, {
  //   directory: 'i18n',
  //   locales: ['zh-CN', 'en'],   // `zh-CN` defualtLocale, must match the locales to the filenames
  //   extension: '.yml',
  //   parse: data => yaml.safeLoad(data),
  //   dump: data => yaml.safeDump(data),
  //   modes: [
  //     'query',            // optional detect querystring - `/?locale=en-US`
  //     // 'subdomain',     // optional detect subdomain   - `zh-CN.koajs.com`
  //     // 'cookie',        // optional detect cookie      - `Cookie: locale=zh-TW`
  //     // 'header',        // optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
  //     // 'url',           // optional detect url         - `/en`
  //     // 'tld',           // optional detect tld(the last domain) - `koajs.cn`
  //     // function () {},  // optional custom function (will be bound to the koa context)
  //   ],
  // }))
  // 邮件服务
  // .use(mailer({
  //   from: process.env.APP_MAILER_FROM,
  //   host: process.env.APP_MAILER_SMTP_ADDRESS,
  //   port: process.env.APP_MAILER_SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.APP_MAILER_SMTP_USERNAME,
  //     pass: process.env.APP_MAILER_SMTP_PASSWORD,
  //   },
  //   logger: false,
  //   debug: false,
  //   test: false,
  //   // test: true,
  // }))
  // 图形验证码
  // .use(captcha({
  //   // background: '#fff',       // Background color, default: white
  //   // background_image: null,   // Background image, default: null
  //   // case_sensitivity: false,  // Case sensitivity, default: false
  //   // char_pool: '0123456789',  // Char pool, like: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789, default: 0123456789
  //   // char_length: 6,           // Char length, default: 6
  //   // color: '#000',            // Color, default: black
  //   // font_family: 'SpicyRice', // Font family, default SpicyRice
  //   // font_size: '30px',        // Font size, default: 30px
  //   // font_style: 'normal',     // Font style, default: normal
  //   // font_weight: 'normal',    // Font weight, default: normal
  //   // fonts: {},                // Custom font files path
  //   // height: 60,               // Height, default: 60
  //   // prefix: 'captcha_',       // Session key prefix, default: `captcha_${key}`
  //   // rotate: 30,               // Rotation amplitude, default: 30, then the angle range is -30 to 30
  //   // timeout_in: 60 * 1000,    // Timeout, default: 1 minute
  //   // type: 'character',        // Captcha type, default: random character
  //   // width: 160,               // Width, default: 160
  // }))
  // 组合requset.body 与已有数据
  .use(async (ctx, next) => {
    ctx.request.permit = (names, defaults = {}) => {
      // 没有request.body或names 直接返回已有数据
      if (!names || !ctx.request.body || !Object.keys(ctx.request.body).length) {
        return defaults;
      }

      let params = {};
      if (names.length) {
        for (let name, param, i = 0, len = names.length; i < len; i++) {
          name = names[i];
          param = ctx.request.body[name];
          if (param === undefined) {
            continue;
          }
          params[name] = param;
        }
        return { ...params, ...defaults };
      } else {
        // names为[]，将所有request.body组合进default
        return { ...ctx.request.body, ...defaults };
      }
    };
    await next();
  })
  .use(controllers.routes(), controllers.allowedMethods())
  .use(async ctx => {
    // 如果访问api不存在，返回接口不存在
    if (/^(\/api){1}((\/).+)/.test(ctx.originalUrl)) {
      ctx.status = 404;
      publicFn_node.errAdd(ctx, '接口不存在', 404);
    } else {// 其他情况返回html文件，路由交由前端控制
      // 单页history模式专用
      const indexHtml = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'binary');
      ctx.body = indexHtml;
    }
  })
  ;

// !module.parent &&
app.listen(port, () => app.context.logger.info(`${pkg.name} is running at ${port}.`));

// Listener
development && [
  'emails/scss',
].forEach(_filename => {
  fs.watch(_filename, { recursive: true }, (eventType, filename) => {
    app.context.logger.info(`${filename}: ${eventType}`);
    // 将emails下的scss文件编译成css文件
    // let result = sass.renderSync({
    //   file: `emails/scss/${filename}`,
    //   outputStyle: 'compressed',
    // });
    // fs.outputFileSync(`emails/css/${path.basename(filename, '.scss')}.css`, result.css);
  });
});
