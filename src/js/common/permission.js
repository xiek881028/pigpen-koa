import store from '@src/js/store';
import { message } from 'ant-design-vue';

let getLoading = false;

const hasFn = (permissionList = [], permission = [], permissionMode = '|') => {
  let flag = false;
  const set = new Set(permissionList);
  let allIndex = 0;
  for (let i = 0; i < permission.length; i++) {
    const el = permission[i];
    if (set.has(el)) {
      if (permissionMode === '|') {
        flag = true;
        break;
      } else {
        allIndex += 1;
      }
    }
  }
  if (permissionMode !== '|' && allIndex === permission.length) {
    flag = true;
  }
  return flag;
};

export const hasPermission = (_permission = [], ops = {}) => {
  const defaultOps = {
    // 多个权限并存时，设置与还是或。&：拥有所有权限时为true，|：拥有其中一个权限为true
    permissionMode: '|',
    // 是否需要立即返回权限校验结果，而不等服务器返回（无结果时返回null，有权限返回true，无权限返回false）
    returnNow: true,
    // 每隔500毫秒查询一次权限是否有返回结果
    time: 500,
    // 最大查询循环次数
    max: 120,
    // 是否分开返回每个传入权限的结果
    sep: false,
  };
  let permission = typeof _permission === 'string' ? [_permission] : _permission;
  const { returnNow, time, sep, max, permissionMode } = { ...defaultOps, ...ops };
  // 因为如果本地没有获取到权限，需要接口请求获取，所以返回一个promise
  return new Promise(async resolve => {
    let permissionList = store.state.user.permission;
    // permission为null表示未初始化，区别于无任何权限的[]
    if (permissionList === null) {
      // 设置开关变量，防止多次请求服务器获取权限数据
      if (!getLoading) {
        getLoading = true;
        try {
          await store.dispatch('user/permission');
        } catch (error) {
          message.error({
            content: '权限获取失败，请刷新页面重试',
            duration: 0,
          });
        }
        // 请求到权限并dispatch到state后，调用自身获取一次判断权限结果并返回
        const _res = await hasPermission(permission, { permissionMode });
        getLoading = false;
        resolve(_res);
      } else {
        // 在请求数据时，每隔500ms询问一次权限返回结果，120次（60秒服务器默认超时504）后仍未返回，权限判断返回false
        if (!returnNow) return resolve(null);
        let index = 0;
        const timer = setInterval(async () => {
          // 设置returnNow，防止死循环
          const res = await hasPermission(permission, { permissionMode, returnNow: false });
          if (index > max || res !== null) {
            clearInterval(timer);
            resolve(res);
          } else {
            index += 1;
          }
        }, time);
      }
    } else {
      if (sep) {
        const out = {};
        for (let i = 0; i < permission.length; i++) {
          const el = permission[i];
          out[el] = hasFn(permissionList, [el], permissionMode);
        }
        resolve(out);
      } else {
        resolve(hasFn(permissionList, permission, permissionMode));
      }
    }
  });
};

export const hasPermissionSync = (_permission = [], ops = {}) => {
  const defaultOps = {
    // 多个权限并存时，设置与还是或。&：拥有所有权限时为true，|：拥有其中一个权限为true
    permissionMode: '|',
    // 是否分开返回每个传入权限的结果
    sep: false,
    // 当权限列表没准备好时，是否返回错误。true返回错误，false根据sep的配置返回对应结果
    returnErr: false,
  };
  let permission = typeof _permission === 'string' ? [_permission] : _permission;
  const { sep, permissionMode, returnErr } = { ...defaultOps, ...ops };
  const permissionList = store.state.user.permission;
  if (permissionList === null) {
    if (returnErr) {
      const msg = 'vuex中permission为null，请先获取数据或使用异步hasPermission方法';
      console.error(msg);
      return new Error(msg);
    } else {
      if (sep) {
        const out = {};
        for (let i = 0; i < permission.length; i++) {
          const el = permission[i];
          out[el] = null;
        }
        return out;
      } else {
        return null;
      }
    }
  } else {
    if (sep) {
      const out = {};
      for (let i = 0; i < permission.length; i++) {
        const el = permission[i];
        out[el] = hasFn(permissionList, [el], permissionMode);
      }
      return out;
    } else {
      return hasFn(permissionList, permission, permissionMode);
    }
  }
}

export default {
  hasPermission,
  hasPermissionSync,
};
