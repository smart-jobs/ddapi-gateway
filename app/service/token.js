'use strict';

const Service = require('egg').Service;
const { BusinessError, ErrorCode } = require('naf-core').Error;

class TokenService extends Service {
  async getToken() {
    const { appId } = this.config;
    const key = `dd:token:${appId}`;
    const token = await this.app.redis.get(key);
    if (token) return token;
    const { access_token, expires_in } = await this.reqToken();
    await this.setToken({ appId, access_token, expires_in });
    return access_token;
  }
  async setToken({ appId, access_token, expires_in }) {
    const key = `dd:token:${appId}`;
    await this.app.redis.set(key, access_token, 'EX', expires_in - 300);
  }
  async reqToken() {
    const { appKey, appSecret } = this.config;
    const url = `https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`;
    const res = await this.ctx.curl(url, { dataType: 'json' });
    if (res.status !== 200) {
      throw new BusinessError(ErrorCode.NETWORK, `Http Code: ${res.status}`, res.data);
    }
    const { errcode, errmsg, access_token, expires_in } = res.data;
    if (errcode) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '请求access_token失败', `${errcode} - ${errmsg}`);
    }

    return { access_token, expires_in };
  }

}

module.exports = TokenService;
