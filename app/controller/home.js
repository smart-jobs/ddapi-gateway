'use strict';

const querystring = require('querystring');
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  async ddapi() {
    const { ctx } = this;
    const access_token = await this.service.token.getToken();
    const queryStr = querystring.stringify({ ...this.ctx.query, access_token });
    const url = `https://oapi.dingtalk.com/${ctx.params[0]}?${queryStr}`;
    const result = await ctx.curl(url, {
      data: this.ctx.request.body,
      dataType: 'json',
      contentType: 'json',
    });
    // ctx.set(result.header);
    ctx.status = result.status;
    ctx.body = result.data;
  }
  async test() {
    const token = await this.service.token.reqToken();
    this.ctx.body = `access token:${token}`;
  }

}

module.exports = HomeController;
