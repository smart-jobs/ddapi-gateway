'use strict';

// had enabled by egg
// exports.static = true;
exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};

exports.mongoose = {
  enable: false,
  package: 'egg-mongoose',
};
