import axios from './axios';
// 文件上传
export const fileupload = params => axios.post('/api/file', params);
// 根据id获取文件地址
export const filedownload = id => axios.get(`/api/file/${id}?download=1`);

export default {
  fileupload,
  filedownload,
};
