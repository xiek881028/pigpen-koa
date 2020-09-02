/*!
 * Permission
 * create: 2020/05/27
 * since: 0.0.1
 */
"use strict";

const Router = require("koa-router");

const Permission = require("../models/permission");
const PermissionGroup = require("../models/permissionGroup");
const router = (module.exports = new Router());
const { vail } = require("../middleware/authenticate");
const { errAdd, permissionTree } = require("../helper/node");
const { getPermission } = require('../middleware/permission');

router.prefix("/permission");

/*
  权限对应业务流程，不应该由使用人员操作
  应该在代码层由开发者梳理流程后进行添加、删除等操作
*/

// 获取权限列表
router.get(
  "GET_permission_list",
  "/list",
  vail(),
  getPermission('find_permission'),
  async (ctx, next) => {
    const { tree, emptyGroup } = ctx.query;
    try {
      const list = await Permission.list();
      const ops = {};
      // emptyGroup属性依赖于tree
      if(tree && emptyGroup) {
        const groupList = await PermissionGroup.list();
        ops.emptyGroup = groupList;
        const sortArr = [].concat(groupList);
        sortArr.unshift({});
        ops.sort = sortArr;
      }
      ctx.body = {
        flag: true,
        message: "查询成功",
        data: tree ? permissionTree(list, ops) : list,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 新增权限
router.post(
  "POST_add_permission",
  "/add",
  vail(),
  getPermission('add_permission'),
  async (ctx, next) => {
    try {
      const permission = new Permission(
        ctx.request.permit(["name", "code", "groupid"])
      );
      await permission.add();
      ctx.body = {
        flag: true,
        message: "权限新增成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 修改权限
router.post(
  "POST_edit_permission",
  "/edit",
  vail(),
  getPermission('edit_permission'),
  async (ctx, next) => {
    try {
      const permission = new Permission(
        ctx.request.permit(["id", "name", "code", "groupid"])
      );
      await permission.edit();
      ctx.body = {
        flag: true,
        message: "权限编辑成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 权限下所有角色
router.post(
  "POST_add_permission",
  "/role",
  vail(),
  getPermission('find_permission'),
  async (ctx, next) => {
    try {
      const { permissionid: id } = ctx.request.permit(["permissionid"]);
      const permission = new Permission({ id });
      const list = await permission.findRole();
      ctx.body = {
        flag: true,
        message: "查询成功",
        data: {
          list,
        },
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// POST /permission/del
// 物理删除权限
router.post(
  "POST_del_permission",
  "/del",
  vail(),
  getPermission('del_permission'),
  async (ctx, next) => {
    try {
      const permission = new Permission(ctx.request.permit(["id"]));
      await permission.del();
      ctx.body = {
        flag: true,
        message: "权限删除成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 获取权限组列表
router.get(
  "POST_permission_group_list",
  "/groupList",
  vail(),
  getPermission('find_permission'),
  async (ctx, next) => {
    try {
      const list = await PermissionGroup.list();
      ctx.body = {
        flag: true,
        message: "查询成功",
        data: list,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 添加权限组
router.post(
  "POST_add_permission_group",
  "/addGroup",
  vail(),
  getPermission('add_permission'),
  async (ctx, next) => {
    try {
      const permissionGroup = new PermissionGroup(ctx.request.permit(["name"]));
      await permissionGroup.add();
      ctx.body = {
        flag: true,
        message: "权限组新增成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 更新权限组
router.post(
  "POST_edit_permission_group",
  "/editGroup",
  vail(),
  getPermission('edit_permission'),
  async (ctx, next) => {
    try {
      const permissionGroup = new PermissionGroup(
        ctx.request.permit(["name", "id"])
      );
      await permissionGroup.edit();
      ctx.body = {
        flag: true,
        message: "权限组编辑成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 删除权限组
router.post(
  "POST_del_permission_group",
  "/delGroup",
  vail(),
  getPermission('del_permission'),
  async (ctx, next) => {
    try {
      const permissionGroup = new PermissionGroup(ctx.request.permit(["id"]));
      await permissionGroup.del();
      ctx.body = {
        flag: true,
        message: "权限组删除成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 添加权限到权限组
router.post(
  "POST_add_permission_2_group",
  "/permission2group",
  vail(),
  getPermission('edit_permission'),
  async (ctx, next) => {
    try {
      await Permission.bindGroup(ctx.request.permit(["ids", "groupid"]));
      ctx.body = {
        flag: true,
        message: "权限关联权限组成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);
