import qs from 'qs';
import { isArray } from '@root/helper';

// 空字段加短横杠
export const emptyFormat = (arr = [], ops = {}) => {
  const defaultOps = {
    ignore: [],
  };
  const { ignore } = { ...defaultOps, ...ops };
  if (isArray(arr)) {
    arr.map(item => {
      Object.keys(item).map(filed => {
        if (ignore.indexOf(filed) !== -1) return;
        if (item[filed] == '' || item[filed] == undefined || item[filed] == null) {
          item[filed] = '-';
        }
      });
    });
    return arr;
  } else {
    Object.keys(arr).map(item => {
      if (ignore.indexOf(item) !== -1) return;
      if (arr[item] == '' || arr[item] == undefined || arr[item] == null) {
        arr[item] = '-';
      }
    });
    return arr;
  }
};

// 将json转为url
export const obj2url = (data = {}, replace = false) => {
  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  let url = `${location.pathname}?${qs.stringify({
    ...query,
    ...data,
  })}`;
  history[replace ? 'replaceState' : 'pushState']({
    url
  }, '', url);
};

// 图片转base64
export const img2base64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
};

const addScriptFn = (src) => {
  const script = document.createElement("script");
  script.type = 'text/javascript';
  script.src = src;
  document.getElementsByTagName('body')[0].appendChild(script);
};

// 插入script标签
export const addScript = (params = '') => {
  if (typeof params === 'string') {
    if(params === '') {
      throw new Error('入参不能为空');
    }
    addScriptFn(params);
  } else if (isArray(params)) {
    for (let i = 0; i < params.length; i++) {
      const el = params[i];
      addScriptFn(el);
    }
  } else {
    throw new Error('入参只能为字符串或数组');
  }
}

const addLinkFn = (href) => {
  const link = document.createElement("link");
  link.rel = 'stylesheet';
  link.href = href;
  document.getElementsByTagName('body')[0].appendChild(link);
};

// 插入link标签
export const addLink = (params = '') => {
  if (typeof params === 'string') {
    if(params === '') {
      throw new Error('入参不能为空');
    }
    addLinkFn(params);
  } else if (isArray(params)) {
    for (let i = 0; i < params.length; i++) {
      const el = params[i];
      addLinkFn(el);
    }
  } else {
    throw new Error('入参只能为字符串或数组');
  }
}

export default {
  emptyFormat,
  obj2url,
  img2base64,
  addScript,
  addLink,
};
