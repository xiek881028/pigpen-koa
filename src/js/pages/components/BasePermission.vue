<template lang="pug">
slot(v-if="pShow")
slot(name="fail" v-else-if="pShow === false")
</template>

<script>
import { mapState } from "vuex";
import { hasPermission, hasPermissionSync } from "../../common/permission.js";
export default {
  components: {},
  props: {
    permission: {
      type: [String, Array],
      default: "",
    },
    permissionMode: {
      type: String,
      default: "|",
    },
  },

  data() {
    return {
      pShow: hasPermissionSync(this.permission, {
        permissionMode: this.permissionMode,
      }),
    };
  },
  computed: {
    ...mapState("user", {
      _permission: (state) => state.permission,
    }),
  },
  watch: {
    // 权限改变时
    async _permission() {
      this.pShow = hasPermissionSync(this.permission, {
        permissionMode: this.permissionMode,
      });
    },
  },
  mounted() {
  },
  methods: {},
};
</script>

<style lang="less" scoped></style>
