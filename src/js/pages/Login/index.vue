<template lang="pug">
component(is="LayoutBlank")
  .indexBox
    .infoBox
      .title 八嘎猪管理后台
      Form.form(ref="form" :rules="rules" :model="form" @finish="finishForm")
        FormItem(name="username")
          Input(
            placeholder="用户名"
            v-model:value="form.username"
          )
            template(v-slot:prefix)
              UserOutlined
        FormItem(name="password")
          Input(
            placeholder="密码"
            type="password"
            v-model:value="form.password"
          )
            template(v-slot:prefix)
              LockOutlined
        FormItem
          Button(type="primary" htmlType="submit" block :loading="loading") 登录
    canvas(id="evanyou-canvas")
</template>

<script>
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import LayoutBlank from "../components/LayoutBlank.vue";
import Evanyou from "@src/assets/evanyou.js";
import { Form, Input, Icon, Button } from "ant-design-vue";
import { hasPermission } from "@src/js/common/permission.js";
const { Item: FormItem } = Form;
export default {
  components: {
    LayoutBlank,
    Evanyou,
    Form,
    FormItem,
    Input,
    Icon,
    Button,
    UserOutlined,
    LockOutlined,
  },
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码不能少于6位", trigger: "blur" },
        ],
      },
      loading: false,
    };
  },
  mounted() {
    Evanyou();
  },
  methods: {
    // submitForm(e = event) {
    //   e.preventDefault();
    //   this.$refs.form.validate();
    // },
    async finishForm() {
      if(this.loading) return;
      this.loading = true;
      try {
        await this.$store.dispatch("user/login", this.form);
        await hasPermission([]);
        this.$router.push("/");
        this.loading = false;
      } catch (error) {
        this.$message.error(error);
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
.indexBox {
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1;
    pointer-events: none;
  }
  .infoBox {
    margin-top: 50px;
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #2c3e50;
    background: #fff;
    padding: 20px 35px;
    border-radius: 5px;
    box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.06);
    .title {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .form {
      width: 300px;
    }
    .inputIcon {
      color: rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
