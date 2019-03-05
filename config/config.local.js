'use strict';

module.exports = () => {
  const config = exports = {};

  // redis config
  config.redis = {
    client: {
      host: '192.168.18.100', // Redis host
      // host: '192.168.1.170', // Redis host
    },
  };

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  config.unit = {
    apiUrl: 'http://smart.chinahuian.cn/www/api/naf/unit/list',
  };

  return config;
};
