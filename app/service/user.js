'use strict';

const _ = require('lodash');
const assert = require('assert');
const TokenService = require('./token');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const jwt = require('jsonwebtoken');

class UserService extends TokenService {
  async user_get({ code }) {
    // TODO: 获取用户信息
    const key = `user_code:${code}`;
    const cached = await this.getCache(key);
    const { userid } = cached || await this.apiGet('/user/getuserinfo', { code }, '获取用户信息失败');
    if (!cached) {
      await this.setCache(key, { userid });
    }

    return await this.user_data({ userid });
  }

  // TODO: 获取用户数据，包括用户基本信息、单位、部门、角色
  async user_data({ userid }) {
    const key = `user_data:${userid}`;
    const cached = await this.getCache(key);
    if (cached) return cached;

    // TODO: 获取用户详细信息
    const userinfo = await this.apiGet('/user/get', { userid }, '获取用户详情失败');

    // TODO: 获得部门名称
    const dept_names = await this.list_parent_names({ userid });

    // TODO: 整理角色名称
    const { roles = [] } = userinfo;
    const role_names = roles.map(r => `${r.groupName}.${r.name}`);

    // TODO: 查询用户单位信息
    let unit = await this.user_unit({ userid });
    unit = unit && _.pick(unit, 'name', 'code');

    const { name, mobile, isAdmin, email, tel } = userinfo;
    const data = { userid, name, mobile, isAdmin, email, tel, depts: dept_names, tags: role_names, unit };
    await this.setCache(key, data);
    return data;
  }

  async list_parent_depts({ userid }) {
    const { department } = await this.apiGet('/department/list_parent_depts', { userId: userid }, '获取用户部门信息失败');
    return department;
  }

  async list_parent_names({ userid }) {
    const depts = await this.deptartment_list();
    const names = depts.reduce((p, c) => { p[c.id] = c.name; return p; }, {});
    const list = await this.list_parent_depts({ userid });
    const rs = list.map(ids => {
      if (ids.length > 1) {
        ids.pop();
        ids.reverse();
      }
      return ids.map(id => names[id]).join('-');
    });
    return rs;
  }

  async deptartment_list() {
    const key = 'deptartment_list';
    const cached = await this.getCache(key);
    if (cached) return cached;
    const { department } = await this.apiGet('/department/list', {}, '获取部门列表失败');
    await this.setCache(key, department);
    return department;
  }

  async unit_list() {
    const key = 'unit_list';
    const cached = await this.getCache(key);
    if (cached) return cached;
    const { apiUrl, expiresIn: expires_in } = this.app.config.unit;
    const { data } = await this.apiGet(apiUrl, {}, '获取单位列表失败');
    await this.setCache(key, data, expires_in);
    return data;
  }

  // 查询学校用户所在单位
  async user_unit({ userid }) {
    const { dept_name = '', expiresIn: expires_in } = this.app.config.unit;
    const key = `user_uinit:${userid}`;
    const cached = await this.getCache(key);
    if (cached) return cached;

    // TODO: 查找dingding部门信息
    const depts = await this.deptartment_list();
    const names = depts.reduce((p, c) => { p[c.id] = c.name; return p; }, {});
    const list = await this.list_parent_depts({ userid });
    const rs = list.map(ids => {
      if (ids.length > 1) {
        ids.pop();
        ids.reverse();
      }
      return ids.map(id => names[id]);
    }).find(p => p[0] === dept_name);
    if (!_.isArray(rs) || rs.length < 2) return; // 非学校人员

    const units = await this.unit_list();
    const unit = units.find(p => p.name === rs[1]);
    if (!unit) throw new BusinessError(ErrorCode.SERVICE_FAULT, '查询用户所在单位信息失败');
    await this.setCache(key, unit, expires_in);
    return unit;
  }

  // 创建指定用户的登录凭证
  async createJwt(userinfo) {
    // TODO:参数检查和默认参数处理
    assert(userinfo, 'userinfo不能为空');

    const { userid, unit } = userinfo;
    const tenant = (unit && unit.code) || 'master';
    const { secret, expiresIn = '1h', issuer = 'dingtalk' } = this.config.jwt;
    const token = await jwt.sign(userinfo, secret, { expiresIn, issuer, subject: `${userid}@${tenant}` });
    return { userinfo, token };
  }

  // 使用认证code登录，生成登录凭证
  async loginJwt({ code, userid }) {
    // TODO:参数检查和默认参数处理
    assert(userid || code, 'code不能为空');

    let userinfo;
    if (userid) {
      userinfo = await this.user_data({ userid });
    } else {
      userinfo = await this.user_get({ code });
    }
    return await this.createJwt(userinfo);
  }
}

module.exports = UserService;
