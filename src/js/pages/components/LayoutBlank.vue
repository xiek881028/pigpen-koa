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
export default{
  mounted() {
  }
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
}
</style>
