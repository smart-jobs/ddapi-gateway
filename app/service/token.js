'use strict';

const assert = require('assert');
const querystring = require('querystring');
const url = require('url');
const Service = require('egg').Service;
const _ = require('lodash');
const isChinese = require('is-chinese');
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
  /** 调用带token的api，token信息自动添加 */
  async tokenApi({ api, method = 'GET', params = {}, data, errText }) {
    assert(api, 'api参数不能为空');

    // TODO: 构建带AccessToken的完整请求URL
    const access_token = await this.getToken();
    const query = { access_token, ...params };
    let uri = url.resolve('https://oapi.dingtalk.com/', api);
    uri += '?' + querystring.stringify(query);

    const res = await this.ctx.curl(uri, { method, data, dataType: 'json' });
    if (res.status !== 200) {
      throw new BusinessError(ErrorCode.NETWORK, `Http Code: ${res.status}`, res.data);
    }

    const { errcode, errmsg } = res.data;
    if (errcode) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, (isChinese(errmsg) && errmsg) || errText || '调用接口失败', `${errcode} - ${errmsg}`);
    }

    return _.omit(res.data, 'errcode', 'errmsg');
  }

  apiGet(api, params = {}, errText) {
    return this.tokenApi({ api, method: 'GET', params, errText });
  }

  apiPost(api, params = {}, data, errText) {
    return this.tokenApi({ api, method: 'POST', params, data, errText });
  }

  async getCache(name) {
    const key = `dd:cache:${name}`;
    const val = await this.app.redis.get(key);
    try {
      if (val) return JSON.parse(val);
    } catch (e) { this.logger.warn('parse cache fail', e); }
    return val;
  }

  async setCache(name, val, expires_in) {
    if (!expires_in) {
      expires_in = _.get(this.app.config, 'ddapi.expiresIn');
    }
    if (val && _.isObject(val)) val = JSON.stringify(val);
    const key = `dd:cache:${name}`;
    await this.app.redis.set(key, val, 'EX', expires_in || 300);
  }
}

module.exports = TokenService;
