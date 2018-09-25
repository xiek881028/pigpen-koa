import axios from './axios';
export default {
  // 注册
  register: params => axios.post('/api/user/register', params),
  // 登录
  login: params => axios.post('/api/user/login', params),
  // 注销
  logout: () => axios.post('/api/user/logout'),
  // 文件上传
  fileupload: params => axios.post('/api/file', params),
  // 根据id获取文件地址
  filedownload: id => axios.get(`/api/file/${id}?download=1`),
  // 获取用户信息
  userinfo: () => axios.get('/api/user/info'),
  // 头像上传
  uploadAvatar: (params, cfg) => axios.post('/api/file/avatar', params, cfg),
  // 获取注册邮箱验证码
  captchaRegister: params => axios.post('/api/captcha/register', params),
  // 判断邮箱是否已经被注册
  mailIsRegister: params => axios.get('/api/user/mailIsRegister', {params}),
};
