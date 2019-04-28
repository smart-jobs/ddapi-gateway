'use strict';

module.exports = () => {
  const config = (exports = {});

  // redis config
  config.redis = {
    client: {
      host: '192.168.18.100', // Redis host
      // host: '192.168.1.170', // Redis host
    },
  };

  config.corpId = 'ding51e6fd2fdf22013a35c2f4657eb6378f';
  config.appId = 213726900;
  config.appKey = 'dingxqg4sgidsp6wvnz5';
  config.appSecret = 'ew88Dcj5TGCeIzRaOR0camvOnBxEB00ex8GvcBT9Bn20idjRSE8l82qUfywQGo02';

  config.jwt = {
    secret: 'Ziyouyanfa!@#',
  };

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  config.unit = {
    apiUrl: 'http://smart.chinahuian.cn/www/api/naf/unit/list',
  };

  return config;
};
