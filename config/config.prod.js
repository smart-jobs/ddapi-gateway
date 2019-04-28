'use strict';

const { prod } = require('./config.secret');

module.exports = () => {
  const config = exports = {};

  // for jilinjobs
  config.corpId = prod.corpId;
  config.appId = prod.appId;
  config.appKey = prod.appKey;
  config.appSecret = prod.appSecret;

  config.logger = {
    consoleLevel: 'INFO',
  };

  return config;
};
