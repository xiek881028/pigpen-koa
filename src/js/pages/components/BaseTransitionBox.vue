/*! * BaseTransitionBox * create: 2017-12-06 * since: 0.0.1 */

<template lang="pug">
	div
		transition(
			appear
			:enter-active-class="`animated ${enterClass}`"
			:leave-active-class="`animated ${leaveClass}`"
			@after-enter="afterEnter"
			@before-leave="beforeLeave"
			mode="out-in"
		)
			//- router-view(:pageSwitched='pageSwitched')
			ConfigProvider(:locale="zh_CN")
				router-view
</template>

<script>
// 国际化
import { ConfigProvider } from "ant-design-vue";
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
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
    leaveClass: String
  },
  mounted() {},
  methods: {
    afterEnter: function() {
    },
    beforeLeave: function() {
    }
  }
};
</script>

<style lang="less" scoped></style>
