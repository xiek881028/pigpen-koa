<template lang="pug">
Modal(
  title="添加账号"
  v-model:visible="isShow"
  :confirmLoading="modalSubmitLoading"
  :destroyOnClose="true"
  @ok="modalSubmit"
  @cancel="modalClose"
  :afterClose="modalCancel"
  :width="640"
)
  Form.form-model(:labelCol="{span: 4, offset: 1}" :wrapperCol="{span: 14, offset: 1}" :model="confirmForm" :rules="rules" ref="modelForm")
    input.ghost(tabindex="-1" name="username")
    FormItem(label="账号" :colon="false" name="username")
      Input(v-model:value="confirmForm.username")
    input.ghost(type="password" tabindex="-1" name="password")
    FormItem(label="密码" :colon="false" name="password")
      Password(v-model:value="confirmForm.password")
</template>

<script>
import { Modal, Form, Input } from "ant-design-vue";
const { Password } = Input;
const { Item: FormItem } = Form;
import { mapState } from "vuex";

export default {
  components: {
    Modal,
    Form,
    FormItem,
    Input,
    Password,
  },
  props: {
    isShow: {
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
    return {
      confirmForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "账号不能为空" },
          { max: 18, min: 1, message: "账号长度为1~18位" },
        ],
        password: [
          { required: true, message: "密码不能为空" },
          { max: 18, min: 8, message: "密码长度为8~18位" },
          { validator: isNumber, message: "密码不能为纯数字" },
        ],
      },
      modalSubmitLoading: false,
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
  },
  methods: {
    modalSubmit() {
      this.$refs.modelForm.validate().then(async () => {
        try {
          this.modalSubmitLoading = true;
          const { username, password } = this.confirmForm;
          await this.$store.dispatch("systemUser/add", {
            username,
            password,
          });
          this.$message.success("新增账号成功");
          this.$emit("submit");
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
