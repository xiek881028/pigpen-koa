/*!
* NotFound
* create: 2017-12-14
* since: 0.0.1
*/

<template lang="pug">
  div(is="LayoutBlank")
    .indexBox
      .infoBox
        .title 404
        .info 很抱歉，您访问的页面被小萌萌吃掉惹
        router-link(to="/") 点我返回首页
      canvas(id="evanyou-canvas")
</template>

<script>
import LayoutBlank from './components/LayoutBlank.vue';
import Evanyou from '@src/assets/evanyou.js';
export default {
  components: {
    LayoutBlank,
    Evanyou,
  },
  mounted() {
    Evanyou();
  },
}
</script>

<style lang="scss" scoped>
@import '~@src/css/_common.scss';
.indexBox{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  canvas{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1;
    pointer-events: none;
  }
  .infoBox{
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #2c3e50;
    .title{
      font-size: 6rem;
    }
    .info{
      font-size: 1.2rem;
      padding: 1.5rem 0 2rem;
    }
  }
}
</style>
