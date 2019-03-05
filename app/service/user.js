'use strict';

const _ = require('lodash');
const TokenService = require('./token');
const { BusinessError, ErrorCode } = require('naf-core').Error;

class UserService extends TokenService {
  async userinfo({ code }) {
    // TODO: 获取用户信息
    const { userid } = await this.apiGet('/user/getuserinfo', { code }, '获取用户信息失败');

    const key = `userinfo:${userid}`;
    const cached = await this.getCache(key);
    if (cached) return cached;

    // TODO: 获取用户详细信息
    let userinfo = await this.apiGet('/user/get', { userid }, '获取用户详情失败');

    // TODO: 获得部门名称
    const dept_names = await this.list_parent_names({ userid });

    // TODO: 整理角色名称
    const { roles = [] } = userinfo;
    const role_names = roles.map(r => `${r.groupName}.${r.name}`);

    // TODO: 查询用户单位信息
    let unit = await this.user_unit({ userid });
    unit = unit && _.pick(unit, 'name', 'code');

    const { name, mobile, isAdmin, email, tel } = userinfo;
    userinfo = { userid, name, mobile, isAdmin, email, tel, depts: dept_names, roles: role_names, unit };
    await this.setCache(key, userinfo);
    return userinfo;
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

}

module.exports = UserService;
