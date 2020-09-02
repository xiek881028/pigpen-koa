<template lang="pug">
  Modal(
    title="添加账号"
    v-model="modalIsShow"
    :confirmLoading="modalSubmitLoading"
    :destroyOnClose="true"
    @ok="modalSubmit"
    @cancel="modalClose"
    :afterClose="modalCancel"
    :width="640"
  )
    FormModel.form-model(:labelCol="{span: 4, offset: 1}" :wrapperCol="{span: 14, offset: 1}" :model="confirmForm" :rules="rules" ref="modelForm")
      FormModelItem(label="账号" :colon="false" prop="username")
        Input(v-model="confirmForm.username")
      input.ghost(tabindex="-1")
      input.ghost(type="password" tabindex="-1")
      FormModelItem(label="密码" :colon="false" prop="password")
        Password(v-model="confirmForm.password")
</template>

<script>
import { Modal, FormModel, Input, Icon } from "ant-design-vue";
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
  },
  data() {
    const isNumber = (rule, value, callback) => {
      if (/^[\d]+$/.test(value)) {
        callback(new Error("密码不能为纯数字"));
      } else {
        callback();
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
      modalIsShow: !!this.isShow,
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
    modalSubmit() {
      this.$refs.modelForm.validate(async (valid) => {
        if (valid) {
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
        }
      });
    },
    modalClose() {
      this.$emit("change", false);
    },
    modalCancel() {
      this.modalSubmitLoading = false;
      this.$refs.modelForm.resetFields();
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
