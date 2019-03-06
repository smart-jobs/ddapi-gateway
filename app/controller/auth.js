'use strict';

const assert = require('assert');
const _ = require('lodash');
const Controller = require('egg').Controller;

class AuthController extends Controller {
  async index() {
    // 判断客户端浏览器
    const agent = this.ctx.get('user-agent');
    const dingtalk = /DingTalk/i.test(agent);
    const win = /dingtalk-win/i.test(agent);
    const { test } = this.ctx.query;
    const forTest = test && _.get(this.app.config, 'test.enable');

    if (!dingtalk && !forTest) {
      await this.ctx.render('error.njk', { message: '请在钉钉中打开应用页面' });
      return;
    }
    if (!win && !forTest) {
      await this.ctx.render('info.njk', { title: 'DingTalk', message: '请在钉钉中打开应用页面' });
      return;
    }

    const { corpId } = this.config;
    const { redirect_uri } = this.ctx.query;
    if (!redirect_uri) {
      await this.ctx.render('error.njk', { title: '参数错误', message: 'redirect_uri不能为空' });
    } else if (forTest) {
      const { userinfo, token } = await this.service.user.loginJwt({ userid: test });
      await this.ctx.render('auth_test.njk', { userinfo, token, redirect_uri });
    } else {
      await this.ctx.render('auth_pc.njk', { corpId, redirect_uri });
    }
  }
  async test() {
    // 判断客户端浏览器
    const agent = this.ctx.get('user-agent');
    const dingtalk = /DingTalk/i.test(agent);
    const win = /dingtalk-win/i.test(agent);
    const { corpId } = this.config;
    this.logger.debug('corpId:', corpId);

    if (!dingtalk) {
      await this.ctx.render('info.njk', { title: '浏览器', message: agent });
    } else if (win) {
      const { code } = this.ctx.query;
      if (code) {
        const userinfo = await this.service.user.user_get({ code });
        await this.ctx.render('info.njk', { title: 'DingTalk', message: JSON.stringify(userinfo) });
      } else {
        await this.ctx.render('test.njk', { title: 'DingTalk', message: 'PC版', corpId });
      }
    } else {
      await this.ctx.render('info.njk', { title: 'DingTalk', message: '请使用PC版钉钉打开应用', corpId });
    }
  }

  async userinfo() {
    const { ctx } = this;
    const { code } = ctx.query;
    assert(code, 'code不能为空');
    const userinfo = await this.service.user.user_get({ code });
    ctx.ok({ data: userinfo });
  }

  async login() {
    const { code } = this.ctx.requestparam;
    const { userinfo, token } = await this.service.user.loginJwt({ code });
    this.ctx.ok({ userinfo, token });
  }

}

module.exports = AuthController;
