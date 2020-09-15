import { routes } from './router';
const { createRouter, createWebHistory } = VueRouter;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // 页面开始loding动画
  if (to.meta.permission != 'notLogin') {
    // all + login页面
    if (!localStorage.token) {
      // 没有token且页面必须登陆才能访问，跳去登录页
      if (to.meta.permission == 'login') {
        localStorage.removeItem('token');
        if (location.pathname !== '/login') {
          return router.push('/login');
        }
        return;
      }
    }
  } else {// 不登陆才能访问的页面
    if (localStorage.token) {
      if (location.pathname !== '/') {
        return router.push('/');
      }
      return;
    }
  }
  next();
});

router.afterEach(route => {
  // 页面结束loding动画
});

router.beforeResolve((to, from, next) => {
  //单页应用重置title(据说IOS的微信有bug，选择性无视)
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
