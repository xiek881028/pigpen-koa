<template lang="pug">
Modal(
  v-model:visible="isShow"
  :destroyOnClose="true"
  :maskClosable="false"
  :closable="false"
  :width="420"
  :footer="null"
)
  .title-wrap
    CheckCircleOutlined.icon
    p 密码重置成功！
  Row(type="flex" justify="space-around" align="middle" :gutter="10")
    Col(:span="6")
      p.label 新密码:
    Col(:span="12")
      Input(readOnly :defaultValue="pwd")
    Col(:span="6")
      Button(size="small" type="primary" ghost @click="copy") 复制
  Row.btn-wrap(type="flex" justify="center" align="middle")
    Col(:span="6")
      Button(type="primary" @click="close") 知道了
</template>

<script>
import { Modal, Input, Icon, Button, Row, Col } from "ant-design-vue";
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { mapState } from "vuex";

export default {
  components: {
    Modal,
    Input,
    Icon,
    Button,
    Row,
    Col,
    CheckCircleOutlined,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    pwd: String,
  },
  data() {
    return {
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
  },
  methods: {
    copy() {
      let tempInput = document.createElement("input");
      tempInput.setAttribute("value", this.pwd);
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      this.$message.success('密码已复制到剪贴板');
    },
    close() {
      this.$emit('update:isShow', false);
      this.$emit("close");
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
.title-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 20px;
  .icon {
    font-size: 22px;
    color: #52c41a;
    margin-right: 10px;
  }
}
.label {
  text-align: right;
}
.btn-wrap {
  margin-top: 20px;
}
</style>
