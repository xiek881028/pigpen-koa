const LayoutAdmin = () => import('./components/LayoutAdmin.vue'); // 后台layout
const Welcome = () => import('./Welcome/index.vue'); // 欢迎页
const UserLogin = () => import('./Login/index.vue'); // 登录页
const Demo = () => import('./Demo/index.vue'); // 样例页
const BaseNotFound = () => import('./NotFound/index.vue'); // 404页
const SystemMgrUser = () => import('./SystemMgr/user.vue'); // 用户配置页
const SystemMgrRole = () => import('./SystemMgr/role.vue'); // 角色配置页
const SystemMgrPermission = () => import('./SystemMgr/permission.vue'); // 权限配置页

import { SettingOutlined } from '@ant-design/icons-vue';

const Title = '八嘎猪';

export const routes = [
  {
    path: '/',
    component: LayoutAdmin,
    children: [
      {
        path: '',
        component: Welcome,
        meta: { title: `首页 - ${Title}`, permission: 'login' },
      },
      {
        path: 'demo',
        component: Demo,
        meta: { title: `样例 - ${Title}`, permission: 'login' },
      },
      {
        path: 'systemMgr/user',
        component: SystemMgrUser,
        meta: { title: `用户配置 - ${Title}`, permission: 'login' },
      },
      {
        path: 'systemMgr/role',
        component: SystemMgrRole,
        meta: { title: `角色配置 - ${Title}`, permission: 'login' },
      },
      {
        path: 'systemMgr/permission',
        component: SystemMgrPermission,
        meta: { title: `权限配置 - ${Title}`, permission: 'login' },
      },
    ],
  },
  { path: '/login', component: UserLogin, meta: { title: `登录页 - ${Title}`, permission: 'notLogin' } },
  { path: '/:catchAll(.*)', component: BaseNotFound, meta: { title: `404 - ${Title}`, permission: 'all' } },
];

export const menu = [
  {
    name: "样例",
    key: "1",
    icon: SettingOutlined,
    permission: "find_demo",
    url: "/demo"
  },
  {
    name: "平台配置",
    key: "2",
    icon: SettingOutlined,
    children: [
      {
        name: "用户配置",
        key: "1",
        permission: "find_user",
        url: "/systemMgr/user"
      },
      {
        name: "角色配置",
        key: "2",
        permission: "find_role",
        url: "/systemMgr/role"
      },
      {
        name: "权限配置",
        key: "3",
        permission: "find_permission",
        url: "/systemMgr/permission"
      },
    ]
  }
];
