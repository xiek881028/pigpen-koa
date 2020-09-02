'use strict';
import axios from 'axios';
import router from '@src/js/pages';

axios.defaults.headers.post['Content-Type'] = 'application/json';

// 请求拦截器
axios.interceptors.request.use(config => {
  let token = localStorage.getItem('token');
  if (token) {
    config.headers.authorization = token;
  }
  return config;
});
// 响应拦截器
axios.interceptors.response.use(config => config, err => {
  const { data, status } = err.response;
  if (status === 401) {
    localStorage.removeItem('token');
    router.push('/login');
    return Promise.reject({ message: '登录失效，请先登录' });
  } else {
    return Promise.reject(data);
  }
});
export default axios;
