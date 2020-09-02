import axios from "@src/js/common/axios";

export default {
  namespaced: true,
  state: {
    userinfo: {
    },
    permission: null,
  },
  mutations: {
    setInfo(state, data) {
      state.userinfo = data;
    },
    setPermission(state, data) {
      state.permission = data;
    },
  },
  actions: {
    // 登录
    login(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/login`, params)
          .then(async (res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              localStorage.setItem('token', data.token);
              context.commit('setInfo', data.userinfo);
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取用户信息
    userinfo(context) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/user/info`)
          .then((res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              context.commit('setInfo', data);
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取权限
    permission(context) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/user/permission`)
          .then((res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              context.commit('setPermission', data);
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 修改密码
    editPwd(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/editPwd`, params)
          .then((res) => {
            const { flag, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(message);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 登出
    logout(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/logout`, params)
          .then((res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              localStorage.removeItem('token');
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
  },
  getters: {},
};
