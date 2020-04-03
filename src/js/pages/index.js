import api from '@src/js/common/api.js';
// import {
//   LoadingBar,
// } from 'iview';

const HomeIndex = () => import('./HomeIndex.vue');
// const UserLogin = () => import('./UserLogin.vue');
// const UserRegister = () => import('./UserRegister.vue');
const BaseNotFound = () => import('./BaseNotFound.vue');

const Title = '八嘎猪';

const routes = [
	{path: '/', component: HomeIndex, meta: {title: `首页 - ${Title}`, permission: 'all'}},
	// {path: '/user/login', component: UserLogin, meta: {title: `登录页 - ${Title}`, permission: 'notLogin'}},
	// {path: '/user/register', component: UserRegister, meta: {title: `注册页 - ${Title}`, permission: 'notLogin'}},
	{path: '*', component: BaseNotFound, meta: {title: `404 - ${Title}`, permission: 'all'}},
];

const router = new VueRouter({
  mode: 'history',
	routes,
});

// LoadingBar.config({
//   color: '#19b076',
//   height: 3,
// });

function getUserinfo() {
  return new Promise((resolve, reject) => {
    api
      .userinfo()
      .then(res => {
        localStorage.userinfo = JSON.stringify(res.data.info);
        resolve(res);
      })
      .catch(err => {
        localStorage.removeItem('userinfo');
        reject(err);
      })
      ;
  });
}

router.beforeEach((to, from, next) => {
  // LoadingBar.start();
  // 所有非登陆才能访问页面
  if(to.meta.permission != 'notLogin'){
    if(!localStorage.token){
      // 没有token且页面必须登陆才能访问，跳去登录页
      if(to.meta.permission == 'login'){
        router.push('/user/login');
        return;
      }
      next();
    }else{
      getUserinfo()
        .then(res => {
          next();
        })
        .catch(err => {
          if(to.meta.permission == 'login'){
            router.push('/user/login');
            return;
          }
          next();
        });
    }
  }else{// 不登陆才能访问的页面
    if(localStorage.token){
      getUserinfo()
        .then(res => {
          router.push('/');
          return;
        })
        .catch(err => {
          next();
        });
    }else{
      next();
    }
  }
});

router.afterEach(route => {
  // LoadingBar.finish();
});

router.beforeResolve((to, from, next) => {
	//单页应用重置title(据说IOS的微信有bug，选择性无视)
	if(to.meta.title){
		document.title = to.meta.title;
  }
  next();
});

export default router;
