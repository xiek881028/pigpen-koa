/*!
 * Home
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2017/12/13
 * since: 0.0.1
 */
'use strict';

const Router = require('koa-router');

const router = module.exports = new Router();

router.prefix('/home');

// GET /home/mailer
// Router.api.tags.push({ name: '/home/mailer', description: '邮件发送', externalDocs: { description: '链接', url: '/home/mailer' } });
// router.get( 'GET_home_hello', '/mailer',
//             devise.authenticate(),
//             async (ctx, next) => {
//               ctx.mailer({
//                 to: 'mail_to@domain.com',
//                 subject: 'Test mail',
//                 text: ctx.pug.render('mails/home_mailer.text', ctx.state),
//                 html: ctx.pug.render('mails/home_mailer.html', ctx.state),
//               }, (error, info, nodemailer) => {
//                 if (error) {
//                   return console.log(error);
//                 }

//                 console.log('Message sent: %s', info.messageId);
//                 console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//               });

//               ctx.body = 'Sent!';
//             });
