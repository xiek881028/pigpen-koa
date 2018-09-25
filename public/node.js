/*!
 * node
 * xiekai <xk285985285@.qq.com>
 * create: 2018/09/13
 * since: 0.0.1
 */
'use strict';
const fs = require('fs-extra');
const path = require('path');
const redis = require('redis');
const Email = require('email-templates');
const email = new Email({
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.resolve('emails'),
    },
  }
});

module.exports.default = module.exports = {

  // 添加错误
  errAdd(ctx, err = { default: '系统错误' }, status = 403) {
    ctx.status = status;
    ctx.body = err;
  },

  // 循环指定目录，输出目录内所有文件列表的数组
  // file 文件名或文件夹名
  // loop 是否循环遍历所有子目录
  fileTree: function (file, loop = true) {
    let fileList = [];
    function walk(file) {
      //如果入参是文件，直接加入数组返回
      if (!fs.statSync(file).isDirectory()) {
        fileList.push(file);
        return;
      }
      let dirlist = fs.readdirSync(file);
      dirlist.forEach(function (item) {
        let itemPath = path.resolve(file, item);
        if (fs.statSync(itemPath).isDirectory() && loop) {
          walk(itemPath);
        } else {
          fileList.push(itemPath);
        }
      });
    };
    walk(file);
    return fileList;
  },

  // 邮件发送
  mail(ctx, to, subject, pug, attr = {}) {
    return new Promise(async (resolve, reject) => {
      ctx.mailer({
        to,
        subject,
        html: await email.render(pug, attr),
      }, (err, info, nodemailer) => {
        if (err) {
          return reject(err);
        }
        resolve(nodemailer.getTestMessageUrl(info));
      });
    });
  },

  // 发送验证码邮件
  mailCaptcha(ctx, name, to, subject, mode) {
    return new Promise(async (resolve, reject) => {
      let captcha = Math.random().toFixed(6).replace(/^[\s\S](.)/, '');
      try {
        await this.captcha(name, captcha);
        await this.mail(ctx, to, subject, 'html/captcha', {
          name: to,
          mode,
          captcha,
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  // 验证码存redis，默认session过期时间为15分钟
  captcha(name, captcha, timeout_in = 1000 * 60 * 15) {
    return new Promise((resolve, reject) => {
      let client = redis.createClient(process.env.APP_REDIS_MASTER);
      client.hmset(name, {captcha}, (err, res) => {
        if (err) {
          return reject(err);
        }
        client.pexpire(name, timeout_in);
        resolve();
      });
    });
  },
}
