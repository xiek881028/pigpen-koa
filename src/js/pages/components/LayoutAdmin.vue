<template lang="pug">
Spin(:spinning="webSpin")
  Layout.wrap
    Sider.sider(collapsible collapsedWidth="0")
      .scroll-wrap
        .logo
        Menu(mode="inline" :selectedKeys="activeKey" :defaultOpenKeys="activePKey")
          template(v-for="item in roleMenuList")
            MenuItem(:key='item.key' v-if="item.url")
              router-link(:to="item.url")
                component(:is='item.icon')
                span {{item.name}}
            SubMenu(v-else :key="item.key")
              template(v-slot:title)
                span
                  component(:is='item.icon')
                  | {{item.name}}
              MenuItem(v-for="child in item.children" :key='`${item.key}-${child.key}`')
                router-link(:to="child.url") {{child.name}}
    Layout.content-wrap
      Header.header
        .avatar-wrap
          Avatar.avatar
            template(v-slot:icon)
              UserOutlined
          | {{userinfo.username}}
        Dropdown.dropdown-wrap(:trigger="['click']")
          span 个人设置
          template(v-slot:overlay)
            Menu(@click="clickOps")
              MenuItem(key="changePwd") 修改密码
              MenuItem(key="logout") 登出
      Spin(:spinning="contentSpin")
        Content.router-wrap(v-is="'BaseTransitionBox'" enterClass="zoomIn fast" leaveClass="zoomOut fast" ref="router")
    ModalEditPwd(v-model:isShow="modalIsShow" :first="first")
        //- router-view
</template>

<script>
import { mapState } from "vuex";
import api from "@src/js/common/api.js";
import { hasPermissionSync } from "@src/js/common/permission.js";
import BaseTransitionBox from "./BaseTransitionBox.vue";
import ModalEditPwd from "./ModalEditPwd.vue";
import { menu } from "../router";
import { Layout, Menu, Avatar, Dropdown, Spin } from "ant-design-vue";
const { Sider, Header, Content } = Layout;
const { Item: MenuItem, SubMenu } = Menu;
import { UserOutlined } from '@ant-design/icons-vue';

export default {
  components: {
    BaseTransitionBox,
    Layout,
    Sider,
    Header,
    Content,
    Menu,
    MenuItem,
    SubMenu,
    Avatar,
    Dropdown,
    Spin,
    UserOutlined,
    ModalEditPwd,
  },
  data() {
    return {
      menuList: menu,
      routerJson: {},
      activeKey: [],
      activePKey: [],
      // spinning: false,
      modalIsShow: false,
      first: false,
    };
  },
  computed: {
    ...mapState({
      userinfo: state => state.user.userinfo,
      webSpin: state => state.fcg.webSpin,
      contentSpin: state => state.fcg.contentSpin,
    }),
    // 侧边栏菜单权限展示逻辑
    roleMenuList() {
      let out = [];
      this.menuList.map((item) => {
        const { name, key, icon, url } = item;
        let pJson = { name, key, icon, url };
        if (item.children && item.children.length) {
          item.children.map((child) => {
            if (hasPermissionSync(child.permission)) {
              if (!pJson.children) {
                pJson.children = [];
              }
              pJson.children.push(child);
            }
            // if (!pJson.children) {
            //   pJson.children = [];
            // }
            // pJson.children.push(child);
          });
          pJson.children && out.push(pJson);
        } else {
          if(item.permission === undefined || hasPermissionSync(item.permission)) {
            out.push(pJson);
          }
        }
      });
      return out;
    },
  },
  beforeMount() {
    this.initRouter();
    this.findActiveRouter();
    this.modalIsShow = this.userinfo.first;
    this.first = this.userinfo.first;
  },
  watch: {
    $route: "findActiveRouter",
  },
  mounted() {
  },
  methods: {
    clickOps(item) {
      const { key } = item;
      switch (key) {
        case "changePwd":
          this.modalIsShow = true;
          break;
        case "logout":
          this.logout();
          break;
      }
    },
    // 初始化拍平路由树，方便匹配
    initRouter() {
      this.menuList.map((item) => {
        if (item.url) {
          this.routerJson[item.url] = {
            ...item,
            activeKey: item.key,
            activePKey: item.key,
          };
        }
        if (item.children && item.children.length) {
          item.children.map((child) => {
            if (child.url) {
              this.routerJson[child.url] = {
                ...child,
                activeKey: `${item.key}-${child.key}`,
                activePKey: item.key,
              };
            }
          });
        }
      });
    },
    // 匹配路由树，找到需要高亮的key
    findActiveRouter() {
      // 路由切换时，如果未修改密码，都弹修改窗
      this.modalIsShow = this.userinfo.first;
      this.first = this.userinfo.first;
      const { path } = this.$route;
      if (this.routerJson[path]) {
        const { activePKey, activeKey } = this.routerJson[path];
        this.activeKey = [activeKey];
        this.activePKey = [activePKey];
      } else {
        this.activeKey = [];
        this.activePKey = [];
      }
    },
    // 登出
    async logout() {
      try {
        this.$store.dispatch('fcg/setWebSpin', true);
        await this.$store.dispatch("user/logout");
        this.$router.push("/login");
        this.$store.dispatch('fcg/setWebSpin', false);
      } catch (error) {
        this.$message.error(error);
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
@import "~nprogress/nprogress.css";
.wrap {
  .sider {
    .scroll-wrap {
      height: 100vh;
      overflow: auto;
      .logo {
        height: 68px;
        margin: 12px;
        background: url("~@src/assets/images/logo.png") center no-repeat;
        background-size: cover;
      }
    }
  }
  .content-wrap {
    .header {
      background: #fff;
      padding: 0 16px;
      display: flex;
      justify-content: flex-end;
      .avatar-wrap {
        margin-right: 20px;
        .avatar {
          background: @primary-color;
          margin-right: 5px;
        }
      }
      .dropdown-wrap {
        cursor: pointer;
      }
    }
    .router-wrap {
      margin: 30px 30px 30px 50px;
      background-color: #fff;
      flex: 1;
      padding: 16px 24px;
      overflow: auto;
    }
  }
}
</style>

<style lang="less">
@import "~@src/css/common.less";
#nprogress {
  .bar {
    height: 3px;
    background: @primary-color;
  }
  .spinner {
    left: 15px;
    right: auto;
  }
  .peg {
    box-shadow: 0 0 10px @primary-color, 0 0 5px @primary-color;
  }
  .spinner-icon {
    border-top-color: @primary-color;
    border-left-color: @primary-color;
  }
}
</style>
