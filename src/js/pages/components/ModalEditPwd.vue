<template lang="pug">
  Modal(
    title="修改密码"
    v-model="modalIsShow"
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
    FormModel.form-model(:labelCol="{span: 4, offset: 1}" :wrapperCol="{span: 14, offset: 1}" :model="confirmForm" :rules="rules" ref="modelForm")
      FormModelItem(label="密码" :colon="false" prop="password")
        Password(v-model="confirmForm.password" @change="inputPwd")
      input.ghost(tabindex="-1")
      input.ghost(type="password" tabindex="-1")
      FormModelItem(label="确认密码" :colon="false" prop="repassword")
        Password(v-model="confirmForm.repassword")
</template>

<script>
import { Modal, FormModel, Input, Icon, Alert } from "ant-design-vue";
const { Password } = Input;
const { Item: FormModelItem } = FormModel;
import { mapState } from "vuex";

export default {
  components: {
    Modal,
    FormModel,
    FormModelItem,
    Input,
    Icon,
    Password,
    Alert,
  },
  model: {
    prop: "isShow",
    event: "change",
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
    const isNumber = (rule, value, callback) => {
      if (/^[\d]+$/.test(value)) {
        callback(new Error("密码不能为纯数字"));
      } else {
        callback();
      }
    };
    const repwd = (rule, value, callback) => {
      if (this.confirmForm.password != value) {
        callback(new Error("两次密码不一致"));
      } else {
        callback();
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
      modalIsShow: !!this.isShow,
      isSubmit: false,
    };
  },
  watch: {
    async isShow(val) {
      this.modalIsShow = val;
    },
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
      this.$refs.modelForm.validate(async (valid) => {
        if (valid) {
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
        }
      });
    },
    modalClose() {
      this.$emit("change", false);
    },
    modalCancel() {
      this.modalSubmitLoading = false;
      this.$refs.modelForm.resetFields();
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
