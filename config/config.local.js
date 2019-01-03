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

  return config;
};
