const mongoose = require('mongoose');
const process = require('process');
const permissionData = require('../data/permission.js').default;
const UserModal = require('../models/user.js');
const PermissionGroup = require('../models/permissionGroup.js');
const Permission = require('../models/permission.js');
const Role = require('../models/role.js');

const data = {
  user: {
    username: 'bagazhu',
    password: 'a12345678',
  },
  mongodb: 'mongodb://127.0.0.1:20041/app',
};

(async () => {
  try {
    console.log(`初始化开始`);
    const db = await mongoose.connect(data.mongodb, {
      useFindAndModify: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`数据库连接成功`);
    const userModal = new UserModal();
    try {
      // 创建用户
      await userModal.addUser(data.user);
      console.log(`用户 ${data.user.username} 创建完成`);
    } catch (error) {
      // 已存在不报错，继续执行
    }
    // 启用用户
    await userModal.editUsing({
      using: true,
    }, {
      saveToRedis: false,
    });
    console.log(`帐号已启用`);
    let allPermission = [];
    for (const item in permissionData) {
      const permissionGroup = new PermissionGroup();
      try {
        await permissionGroup.add({
          name: item,
        });
      } catch (error) {
        // 已存在不报错，继续执行
      }
      const group = await permissionGroup.findByName({ name: item });
      const child = permissionData[item];
      for (const key in child) {
        const permission = new Permission();
        try {
          await permission.add({
            name: child[key],
            code: key,
            groupid: group._id,
          });
        } catch (error) {
          // 已存在不报错，继续执行
        }
        const pd = await permission.findByCode(key);
        allPermission.push(pd._id);
      }
    }
    console.log(`权限添加完成`);
    const role = new Role({
      name: '超级管理员',
      permission: allPermission,
    });
    try {
      await role.add();
      await role.editPermission({ id: role._id });
    } catch (error) {
      // 已存在不报错，继续执行
    }
    console.log(`角色添加完成`);
    await userModal.editRole({
      role: [role._id],
    });
    console.log(`用户绑定角色完成`);
    db.disconnect();
    console.log(`初始化结束`);
  } catch (error) {
    console.log('error: ', error);
    process.exit();
  }
})();
