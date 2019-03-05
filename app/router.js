'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/test', controller.home.test);
  router.all(/^\/dd\/(.+)$/, controller.home.ddapi);

  router.get('/auth', controller.auth.index);
  router.get('/auth/test', controller.auth.test);
  router.all('/auth/userinfo', controller.auth.index);
  router.post('/auth/login', controller.auth.login);
};

