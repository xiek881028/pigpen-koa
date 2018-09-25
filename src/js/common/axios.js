/*!
 * Common
 * create: 2018/07/25
 * since: 0.0.1
 */
'use strict';

// js
import axios from 'axios';
import publicFn from '@root/public/index';

// import 'core-js/fn/promise/finally';
// import 'core-js/modules/es6.object.assign';
// import 'core-js/shim';
// import 'regenerator-runtime/runtime';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Axios
// 请求拦截器
axios.interceptors.request.use(config => {
  let token = localStorage.token;
  if(token){
    config.headers.Authorization = token;
  }
  return config;
});
// 响应拦截器
axios.interceptors.response.use(config => config, err => {
  let error = err.response;
  console.log(error);
  if(publicFn.isObject(error.data)){
    error.error = error.data[Object.keys(error.data)[0]];
  }else{
    error.error = error.data;
  }
  if(error.status === 401){
    localStorage.removeItem('token');
  }
  return Promise.reject(error);
});
export default axios;
