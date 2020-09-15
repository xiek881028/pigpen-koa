<template lang="pug">
//- 外层如果有is，需要一个实体dom节点接受is上的class，故div不能省
div#nprogressWrap
	ConfigProvider(:locale="zh_CN")
		transition(
			appear
			:enter-active-class="`animated ${enterClass}`"
			:leave-active-class="`animated ${leaveClass}`"
			@after-enter="afterEnter"
			@before-leave="beforeLeave"
			mode="out-in"
		)
			//- router-view(:pageSwitched='pageSwitched')
			router-view
</template>

<script>
// 国际化
import { ConfigProvider } from "ant-design-vue";
import zh_CN from "ant-design-vue/lib/locale-provider/zh_CN";
import NProgress from "nprogress";
NProgress.configure({ parent: "#nprogressWrap" });

export default {
  data: () => {
    return {
      // pageSwitched: false
      zh_CN,
    };
  },
  components: {
    ConfigProvider,
  },
  props: {
    enterClass: String,
    leaveClass: String,
  },
  mounted() {
    this.$router.beforeEach((to, from, next) => {
      NProgress.start();
      next();
    });
    this.$router.beforeResolve((to, from, next) => {
      NProgress.done();
      next();
    });
  },
  methods: {
    afterEnter: function () {},
    beforeLeave: function () {},
  },
};
</script>

<style lang="less" scoped></style>
