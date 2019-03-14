'use strict';

module.exports = () => {
  const config = exports = {};

  config.logger = {
    consoleLevel: 'INFO',
  };

  config.unit = {
    apiUrl: 'http://smart.jilinjobswx.cn/www/api/naf/unit/list',
    expiresIn: 3000,
    dept_name: '省内高校',
  };

  return config;
};
