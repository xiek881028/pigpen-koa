/*!
 * common
 * create: 2017/11/30
 * since: 0.0.1
 */
'use strict';

// Css
import '@src/css/reset.less';
import '@src/css/theme.less';
import '@src/css/common.less';

import Vue from 'vue';
import { message } from 'ant-design-vue';
import pages from '../pages';
import BaseTransitionBox from '../pages/components/BaseTransitionBox.vue';
import store from '@src/js/store';
// import { hasPermission, hasPermissionSync } from './permission.js';

// init(在 vue 根节点生成之前获取，保证有用户信息以及权限信息)
(async () => {
  if (localStorage.token) {
    try {
      await store.dispatch('user/userinfo');
      await store.dispatch('user/permission');
    } catch (error) {
    }
  }
})();


// Message.config({
//   duration: 2,
//   top: 30,
// });
Vue.prototype.$message = message;

// 自定义指令权限控制(只能控制显示隐藏，无法阻止组件渲染以及中止生命周期)
// Vue.directive('p', {
//   bind: async (el, binding, vnode) => {
//     const { value, arg } = binding;
//     const prev = el.style.display;
//     const permissionMode = arg || '|';
//     el.style.display = "none";
//     const res = await hasPermission(value, {
//       permissionMode,
//     });
//     if (res) {
//       el.style.display = prev;
//     } else {
//       if (vnode.elm && vnode.elm.parentElement) {
//         vnode.elm.parentElement.removeChild(vnode.elm);
//       }
//     }
//   },
// });

new Vue({
  el: '#app',
  store,
  router: pages,
  components: {
    BaseTransitionBox
  },
});
