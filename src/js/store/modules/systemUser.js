import axios from "@src/js/common/axios";

export default {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    // 列表
    list(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/user/list`, { params })
          .then((res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 添加
    add(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/add`, params)
          .then((res) => {
            const { flag, data, message } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 删除
    del(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/del`, params)
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
    // 启用/停用
    using(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/using`, params)
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
    // 重置密码
    resetPwd(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/resetPwd`, params)
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
    // 获取绑定角色弹窗所需数据
    bindRoleData(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/user/bindRoleData`, { params })
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 用户绑定角色
    editRole(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/user/editRole`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取角色列表
    roleList(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/role/list`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取权限列表
    permissionList(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/permission/list`, { params })
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取角色下的权限
    rolePermission(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/role/permission`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 提交编辑角色
    editRolePermission(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/role/edit`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 提交新增角色
    addRole(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/role/add`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 删除角色权限
    delRole(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/role/del`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 获取权限组列表
    getGroupList(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .get(`/api/permission/groupList`, { params })
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 添加权限组
    addGroup(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/addGroup`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 编辑权限组
    editGroup(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/editGroup`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 添加权限
    addPermission(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/add`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 添加权限
    editPermission(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/edit`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 删除权限组
    delGroup(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/delGroup`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // 删除权限
    delPermission(context, params) {
      return new Promise((resolve, reject) => {
        axios
          .post(`/api/permission/del`, params)
          .then((res) => {
            const { flag, message, data } = res.data;
            if (!flag) {
              reject(message);
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    // // 获取详情
    // getDetails(context, id) {
    //   return new Promise((resolve, reject) => {
    //     axios
    //       .get(`/api/user/details/${id}`)
    //       .then((res) => {
    //         const { flag, data, message } = res.data;
    //         if (!flag) {
    //           reject(message);
    //         } else {
    //           resolve(data);
    //         }
    //       })
    //       .catch((err) => {
    //         reject(err.message);
    //       });
    //   });
    // },
  },
  getters: {},
};
