/*!
 * Role
 * create: 2018/05/07
 * since: 0.0.1
 */
"use strict";

const Router = require("koa-router");
const Role = require("../models/role");
const router = (module.exports = new Router());
const { vail } = require("../middleware/authenticate");
const { errAdd } = require("../helper/node");
const { getPermission } = require('../middleware/permission');

router.prefix("/role");

// GET /role/list
router.get("GET_role_list", "/list",
  vail(),
  getPermission('find_role'),
  async (ctx, next) => {
    try {
      const list = await Role.list();
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const role = new Role({ id: item.id });
        let itemList = await role.findPermission(
          {},
          {
            tree: false,
          }
        );
        item.permission = itemList;
      }
      ctx.body = {
        flag: true,
        message: "查询成功",
        data: list,
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// POST /role/add
router.post("POST_add_role", "/add",
  vail(),
  getPermission('add_role'),
  async (ctx, next) => {
    try {
      const { name, permission } = ctx.request.permit(["name", "permission"]);
      const role = new Role({ name, permission });
      await role.add();
      if (permission) {
        try {
          await role.editPermission({ id: role._id });
        } catch (err) {
          // 如果权限绑定失败，删除创建的角色
          role.del({ id: role._id });
          return errAdd(ctx, err);
        }
      }
      ctx.body = {
        flag: true,
        message: "角色新增成功",
        data: {
          id: role._id,
        },
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 角色下所有用户
router.post("POST_role_user", "/user",
  vail(),
  getPermission('find_role'),
  async (ctx, next) => {
    try {
      const { roleid: id } = ctx.request.permit(["roleid"]);
      const role = new Role({ id });
      const list = await role.findUser();
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

// 角色下所有权限
router.post("POST_role_permission", "/permission",
  vail(),
  getPermission('find_role'),
  async (ctx, next) => {
    try {
      const { roleid: id, tree } = ctx.request.permit(["roleid", "tree"]);
      const role = new Role({ id });
      const list = await role.findPermission(
        {},
        {
          tree,
        }
      );
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

// POST /role/del
// 物理删除角色
router.post("POST_del_role", "/del",
  vail(),
  getPermission('del_role'),
  async (ctx, next) => {
    try {
      const role = new Role(ctx.request.permit(["id"]));
      await role.del();
      ctx.body = {
        flag: true,
        message: "角色删除成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  });

// 修改角色
router.post("POST_edit_role", "/edit",
  vail(),
  getPermission('edit_role'),
  async (ctx, next) => {
    try {
      const role = new Role(ctx.request.permit(["id", "name", "permission"]));
      await role.edit();
      await role.editPermission();
      ctx.body = {
        flag: true,
        message: "角色编辑成功",
      };
    } catch (err) {
      return errAdd(ctx, err);
    }
  }
);

// 角色编辑权限
// router.post(
//   "POST_edit_permission",
//   "/editPermission",
//   vail(),
//   async (ctx, next) => {
//     try {
//       const role = new Role(ctx.request.permit(["id", "permission"]));
//       await role.editPermission();
//       ctx.body = {
//         flag: true,
//         message: "角色修改权限成功",
//       };
//     } catch (err) {
//       return errAdd(ctx, err);
//     }
//   }
// );
