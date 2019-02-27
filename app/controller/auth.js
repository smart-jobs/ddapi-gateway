'use strict';

const Controller = require('egg').Controller;

class AuthController extends Controller {
  async index() {
    // 判断客户端浏览器
    const agent = this.ctx.get('user-agent');
    const dingtalk = /DingTalk/i.test(agent);
    const win = /dingtalk-win/i.test(agent);

    if (!dingtalk) {
      await this.ctx.render('error.njk', { message: '请在钉钉中打开应用页面' });
    } else if (win) {
      await this.ctx.render('auth_pc.njk', { title: 'DingTalk', message: 'PC版' });
    } else {
      await this.ctx.render('info.njk', { title: 'DingTalk', message: '请在钉钉中打开应用页面' });
    }
  }
  async test() {
    // 判断客户端浏览器
    const agent = this.ctx.get('user-agent');
    const dingtalk = /DingTalk/i.test(agent);
    const win = /dingtalk-win/i.test(agent);
    const { corpId } = this.config;
    console.log('corpId:', corpId);

    if (!dingtalk) {
      await this.ctx.render('info.njk', { title: '浏览器', message: agent });
    } else if (win) {
      await this.ctx.render('auth_pc.njk', { title: 'DingTalk', message: 'PC版', corpId });
    } else {
      await this.ctx.render('info.njk', { title: 'DingTalk', message: '手机版', corpId });
    }
  }

}

module.exports = AuthController;
