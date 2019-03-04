'use strict';

const _ = require('lodash');
const TokenService = require('./token');

class UserService extends TokenService {
  async userinfo({ code }) {
    // TODO: 获取用户信息
    const { userid } = await this.apiGet('/user/getuserinfo', { code }, '获取用户信息失败');

    // TODO: 获取用户详细信息
    const userinfo = await this.apiGet('/user/get', { userid }, '获取用户详情失败');

    // TODO: 获得部门名称
    const dept_names = await this.list_parent_names({ userid });

    // TODO: 整理角色名称
    const { roles = [] } = userinfo;
    const role_names = roles.map(r => `${r.groupName}.${r.name}`);
    return _.merge(userinfo, { dept_names, role_names });
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
    const cached = await this.getCache('deptartment_list');
    if (cached) return cached;
    const { department } = await this.apiGet('/department/list', {}, '获取部门列表失败');
    return department;
  }

}

module.exports = UserService;
