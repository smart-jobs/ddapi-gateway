'use strict';

const { jwt } = require('./config.secret');

module.exports = appInfo => {
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1546545216848_3374';

  // server config
  config.cluster = {
    listen: {
      port: 8008,
    },
  };

  // add your config here
  config.middleware = [];

  // 安全配置
  config.security = {
    csrf: {
      // ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false,
    },
  };

  // redis config
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: null,
      db: 0,
    },
  };

  // for dev
  config.corpId = 'ding51e6fd2fdf22013a35c2f4657eb6378f';
  config.appId = 213726900;
  config.appKey = 'dingxqg4sgidsp6wvnz5';
  config.appSecret = 'ew88Dcj5TGCeIzRaOR0camvOnBxEB00ex8GvcBT9Bn20idjRSE8l82qUfywQGo02';

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.njk': 'nunjucks',
    },
  };

  config.unit = {
    apiUrl: 'http://localhost:8083/www/api/naf/unit/list',
    expiresIn: 3000,
    dept_name: '省内高校',
  };

  config.ddapi = {
    baseUrl: 'https://oapi.dingtalk.com/',
    expiresIn: 300,
  };

  config.jwt = {
    ...jwt,
    expiresIn: '2h',
    issuer: 'platform',
  };

  // for test only
  config.test = {
    enable: true,
  };

  return config;
};
