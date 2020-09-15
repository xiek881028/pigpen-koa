<template lang="pug">
Modal(
  title="修改密码"
  v-model:visible="isShow"
  :confirmLoading="modalSubmitLoading"
  :destroyOnClose="true"
  @ok="modalSubmit"
  @cancel="modalClose"
  :afterClose="modalCancel"
  :closable="!first"
  :maskClosable="!first"
  :keyboard="!first"
  :cancelButtonProps="{props: {disabled: first}}"
)
  Alert.alert(show-icon type="warning" message="初次登录，为了您的账号安全，请先修改密码。否则平台页面不可用。" v-if="first")
  Form.form-model(:labelCol="{span: 4, offset: 1}" :wrapperCol="{span: 14, offset: 1}" :model="confirmForm" :rules="rules" ref="modelForm")
    FormItem(label="密码" :colon="false" name="password")
      Password(v-model:value="confirmForm.password" @change="inputPwd")
    input.ghost(tabindex="-1")
    input.ghost(type="password" tabindex="-1")
    FormItem(label="确认密码" :colon="false" name="repassword")
      Password(v-model:value="confirmForm.repassword")
</template>

<script>
import { Modal, Form, Input, Icon, Alert } from "ant-design-vue";
const { Password } = Input;
const { Item: FormItem } = Form;
import { mapState } from "vuex";

export default {
  components: {
    Modal,
    Form,
    FormItem,
    Input,
    Icon,
    Password,
    Alert,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    first: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const isNumber = (rule, value) => {
      if (/^[\d]+$/.test(value)) {
        return Promise.reject("密码不能为纯数字");
      } else {
        return Promise.resolve();
      }
    };
    const repwd = (rule, value) => {
      if (this.confirmForm.password != value) {
        return Promise.reject("两次密码不一致");
      } else {
        return Promise.resolve();
      }
    };
    return {
      confirmForm: {
        password: "",
        repassword: "",
      },
      rules: {
        password: [
          { required: true, message: "密码不能为空" },
          { max: 18, min: 8, message: "密码长度为8~18位" },
          { validator: isNumber, message: "密码不能为纯数字" },
        ],
        repassword: [
          { required: true, message: "密码不能为空" },
          { max: 18, min: 8, message: "密码长度为8~18位" },
          { validator: isNumber, message: "密码不能为纯数字" },
          { validator: repwd, message: "两次密码不一致" },
        ],
      },
      modalSubmitLoading: false,
      isSubmit: false,
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
  },
  methods: {
    inputPwd() {
      const { password, repassword } = this.confirmForm;
      if (password && repassword) {
        this.$refs.modelForm.validateField("repassword");
      }
    },
    modalSubmit() {
      this.$refs.modelForm.validate().then(async () => {
        try {
          this.modalSubmitLoading = true;
          const { password } = this.confirmForm;
          await this.$store.dispatch("user/editPwd", {
            password,
          });
          this.$message.success("密码修改成功，请重新登录。", 5);
          localStorage.removeItem("token");
          this.isSubmit = true;
          this.modalClose();
        } catch (error) {
          this.$message.error(error);
          this.modalSubmitLoading = false;
        }
      });
    },
    modalClose() {
      this.$emit("update:isShow", false);
      this.$refs.modelForm.resetFields();
    },
    modalCancel() {
      this.modalSubmitLoading = false;
      this.isSubmit && this.$router.push("/login");
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
.ghost {
  opacity: 0;
  position: fixed;
  top: -99999px;
  left: -99999px;
}
.alert {
  margin: 0 15px 20px;
}
.form-model {
  .upload-wrap {
    padding: 16px 0;
    .upload-icon {
      font-size: 36px;
      color: #999;
      margin-bottom: 10px;
    }
  }
  .preview {
    position: relative;
    img {
      display: block;
      width: 100%;
    }
    .del-wrap {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.3);
      .del {
        font-size: 20px;
        color: #fff;
      }
    }
  }
}
</style>
