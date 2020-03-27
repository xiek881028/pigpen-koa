/*!
* BaseLayout
* create: 2017-12-06
* since: 0.0.1
*/

<template lang="pug">
  .RootBox
    slot
</template>

<script>
import api from '@src/js/common/api.js';
export default{
  components: {
  },
  data() {
    return {};
  },
  mounted() {
  },
  methods: {
  },
}
</script>

<style lang="scss" scoped>
@import '~@src/css/_common.scss';
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
