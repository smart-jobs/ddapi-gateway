'use strict';

const assert = require('assert');
const Controller = require('egg').Controller;

/**
 * 扩展API
 */
class ApiController extends Controller {
  async unit_users() {
    const { ctx } = this;
    const { unit } = ctx.query;
    assert(unit, 'unit不能为空');
    const userIds = await this.service.user.unit_users({ unit });
    ctx.ok({ data: userIds });
  }
}

module.exports = ApiController;
