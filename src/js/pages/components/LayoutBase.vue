/*!
* BaseLayout
* create: 2017-12-06
* since: 0.0.1
*/

<template lang="pug">
  .RootBox
    .webBox
      .header
        h1
          router-link(to="/") bagazhu.com
        .userInfo(v-if="userinfo.mail")
          .avatar(@click="modalIsShow = true")
            img(:src="`/api/file/${userinfo.avatar}`" v-if="userinfo.avatar")
            BaseIcon.avatarIcon(type="icon-iconzhucetouxiang" v-else)
          .welcome {{userinfo.mail}}
            Drawer(title="菜单导航" v-model="drawerFlag" :closable="true" :styles="{padding: 0}")
              CellGroup(@on-click="clickCell")
                Cell(title="注销" name="logout")
          Button.userCenter( type="default" ghost @click="drawerFlag = true") 个人中心
        router-link.login(to="/user/login" v-else) 去登陆
      .content
        slot
      .footer 桂ICP备16001781号
    UploadAvatar(v-model="modalIsShow" @avatar-ok="avatarOk")
</template>

<script>
import {
  Drawer,
  CellGroup,
  Cell,
  Button,
} from 'iview';
import BaseIcon from './BaseIcon.vue';
import api from '@/js/common/api.js';
import publicFn from '@root/public/index';
import Cropper from 'cropperjs';
import UploadAvatar from './BaseUploadAvatar.vue';
export default{
  components: {
    BaseIcon,
    Drawer,
    CellGroup,
    Cell,
    Button,
    UploadAvatar,
  },
  data() {
    return {
      userinfo: {},
      drawerFlag: false,
      modalIsShow: false,
    };
  },
  mounted() {
    let userinfo = localStorage.userinfo;
    if(userinfo && publicFn.isObject(JSON.parse(userinfo))){
      this.userinfo = JSON.parse(userinfo);
    }
  },
  methods: {
    clickCell(name) {
      switch (name) {
        case 'logout':
          api
            .logout()
            .then(res => {
              this.$Message.success('登出成功');
              this.$router.push('/user/login');
            })
            .catch(err => {
              this.$Message.error(err.error);
            })
            ;
          break;
        default:
          break;
      }
    },
    avatarOk(id) {
      this.$set(this.userinfo, 'avatar', id);
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/css/_common.scss';
.RootBox{
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: #FDFBFB;
  background-image: linear-gradient( 135deg, #FDFBFB 10%, #EBEDEE 70%);
  overflow: auto;
  display: flex;
  .webBox{
    min-width: 360px;
    display: flex;
    flex-direction: column;
    flex: 1;
    .header{
      padding: 0 18px;
      height: 50px;
      line-height: 50px;
      background-color: $primary-color;
      flex: none;
      color: $white;
      display: flex;
      justify-content: space-between;
      h1{
        font-size: $font-size-large;
        font-weight: 400;
        a{
          color: $white;
        }
      }
      .userInfo{
        display: flex;
        align-items: center;
        .avatar{
          display: flex;
          background-color: #ccc;
          color: #fff;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          width: 32px;
          height: 32px;
          border-radius: 16px;
          margin-right: 10px;
          cursor: pointer;
          .avatarIcon{
            font-size: 18px;
          }
          img{
            width: 100%;
            height: 100%;
          }
        }
        .welcome{
          margin-right: 20px;
        }
        .userCenter{
          &:hover{
            color: mix($white, $primary-color, 80%);
            border-color: mix($white, $primary-color, 80%);
            background-color: mix($white, $primary-color, 15%);
          }
        }
      }
      .login{
        color: $white;
      }
    }
    .content{
      flex: auto;
    }
    .footer{
      background-color: #f5f7f9;
      padding: 16px 30px;
      flex: none;
      text-align: center;
      font-size: 12px;
    }
  }
}
</style>
