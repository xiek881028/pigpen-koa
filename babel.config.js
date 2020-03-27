module.exports = function (api) {
  api.cache(true);
  const presets = [
    ['@babel/env', {
      modules: false,
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: true }
    }]
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
  ];
  return {
    presets,
    plugins,
    // 让babel和webpack一样严格区分commonJS文件和ES6文件
    sourceType: 'unambiguous',
  };
};
