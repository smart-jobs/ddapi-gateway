'use strict';

const assert = require('assert');
const TokenService = require('./token');
const { BusinessError, ErrorCode } = require('naf-core').Error;

class RoleService extends TokenService {
  async role_list() {
    const key = 'role_list';
    const cached = await this.getCache(key);
    if (cached) return cached;
    const { result: { list } } = await this.apiGet('/topapi/role/list', { size: 200 }, '获取角色列表');
    await this.setCache(key, list);
    return list;
  }

  async role_users({ role_id }) {
    assert(role_id, 'role_id不能为空');

    const key = 'role_users';
    const cached = await this.getCache(key);
    if (cached) return cached;
    const { result: { list } } = await this.apiGet('/topapi/role/simplelist', { role_id, size: 200 }, '获取角色下的员工列表');
    await this.setCache(key, list);
    return list;
  }

  // 名字转ID
  async role_byName({ role_name }) {
    assert(role_name, 'role_name不能为空');

    const key = 'role_tag';
    const cached = await this.getCache(key);
    if (cached) return cached;
    const roles = await this.role_list();
    const tags = role_name.split('.');
    const group = roles.find(p => p.name === tags[0]);
    if (!group) throw new BusinessError(ErrorCode.SERVICE_FAULT, '角色组不存在');
    const role = group.roles.find(p => p.name === tags[1]);
    if (!role) throw new BusinessError(ErrorCode.SERVICE_FAULT, '角色不存在');

    await this.setCache(key, role);
    return role;
  }

  // 根据角色名获得用户列表
  async role_tagusers({ role_name }) {
    const role = await this.role_byName({ role_name });
    const list = await this.role_users({ role_id: role.id });
    return list;
  }

}

module.exports = RoleService;
