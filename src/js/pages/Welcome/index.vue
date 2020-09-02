/*!
* home
* create: 2017-12-05
* since: 0.0.1
*/

<template lang="pug">
  .welcome-wrap
    .icon-wrap
      IconFont.font(type="iconhuanyingyeicon")
    h1 欢迎使用八嘎猪系统~
</template>

<script>
import IconFont from '../components/BaseIcon.vue';
export default {
  components: {
    IconFont,
  },
}
</script>

<style lang="less" scoped>
@import '~@src/css/common.less';
.welcome-wrap{
  color: #1f2f3d;
  .icon-wrap{
    display: flex;
    align-items: center;
    justify-content: center;
    .font{
      font-size: 500px;
    }
  }
  h1 {
    font-size: 24px;
    font-weight: 400;
    margin-top: 25px;
    text-align: center;
  }
}
</style>
