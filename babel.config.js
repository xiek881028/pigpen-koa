module.exports = function (api) {
  api.cache(true);
  const presets = [
    [
      "@babel/env",
      {
        modules: false,
        useBuiltIns: "usage",
        corejs: { version: 3, proposals: true },
      },
    ],
  ];
  const plugins = [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-runtime",
    // [
    //   "import",
    //   { libraryName: "ant-design-vue", libraryDirectory: "es", style: "css" },
    // ],
  ];
  const ignore = [
    (filename) => {
      return !/^(((?!node_modules).)*(js|vue))|(.*(node_modules).*(crypto-random-string|asn1\.js).*(\.js))$/.test(
        filename
      );
    },
  ];

  return {
    presets,
    plugins,
    ignore,
    // 让babel和webpack一样严格区分commonJS文件和ES6文件
    sourceType: "unambiguous",
  };
};
