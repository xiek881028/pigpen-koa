/*!
* home
* create: 2017-12-05
* since: 0.0.1
*/

<template lang="pug">
  .homeBox(is="LayoutBase")
    h1 hello world!
    .linkList
      router-link(to="/user/login") 点我去登录页
      router-link(to="/user/register") 点我去注册页
      router-link(to="/404") 点我去404页
</template>

<script>
import LayoutBase from './components/LayoutBase.vue';
export default{
  components: {
    LayoutBase,
  },
}
</script>

<style lang="scss" scoped>
@import '~@/css/_common.scss';
.homeBox{
  color: #1f2f3d;
  h1 {
    font-size: 24px;
    font-weight: 400;
    margin: 55px 0 20px;
    text-align: center;
  }
  .linkList{
    display: flex;
    flex-direction: column;
    align-items: center;
    a {
      font-size: 14px;
      color: #1f2f3d;
      margin: 10px 0;
    }
  }
}
</style>
