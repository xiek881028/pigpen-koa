<template lang="pug">
  div(is="LayoutBlank")
    .indexBox
      .infoBox
        .title 八嘎猪管理后台
        Form.form(:form="form" @submit="submitForm")
          FormItem
            Input(
              placeholder="用户名"
              v-decorator=['username', {
                rules: [
                  {required: true, message: '请输入用户名'},
                ],
                validateTrigger: 'blur',
              }]
            )
              Icon.inputIcon(slot="prefix" type="user")
          FormItem
            Input(
              placeholder="密码"
              type="password"
              v-decorator=['password', {
                rules: [
                  {required: true, message: '请输入密码'},
                  {min: 6, message: '密码不能少于6位'}
                ],
                validateTrigger: 'blur',
              }]
            )
              Icon.inputIcon(slot="prefix" type="lock")
          FormItem
            Button(type="primary" html-type="submit" block) 登录
      canvas(id="evanyou-canvas")
</template>

<script>
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
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "login_form" });
  },
  mounted() {
    Evanyou();
  },
  methods: {
    submitForm(e = event) {
      e.preventDefault();
      this.form.validateFields(async (err, data) => {
        if (!err) {
          try {
            await this.$store.dispatch("user/login", data);
            await hasPermission([]);
            this.$router.push("/");
          } catch (error) {
            this.$message.error(error);
          }
        }
      });
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
