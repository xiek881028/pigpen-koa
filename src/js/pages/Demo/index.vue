<template lang="pug">
.wrap
  Breadcrumb
    BreadcrumbItem 样例页面
  PageHeader.pageHeader(title="样例页面" subTitle="展示一些集成的功能。")
    .tags
      Tag(color="red") 展示操作提示
    template(v-slot:extra)
      BasePermission(permission="find_demo")
        Button(type="primary" @click="demoClick") 展示按钮
  BasePermission(permission="find_demo")
    template(v-slot:fail)
      Result(status="403" title="403" sub-title="对不起，您没有权限查看。")
    .baseinfo-wrap
      Spin(:spinning="isLoading || isSubmit")
        Form.form-model(
          :labelCol="{span: 4, offset: 1}"
          :wrapperCol="{span: 14, offset: 1}"
          :model="confirmForm"
          :rules="rules"
          ref="modelForm"
          @finish="finish"
        )
          FormItem(label="富文本" :colon="false" name="textArea")
            span Editor暂不支持vue 3.0
            //- Editor(:init="editorCfg" v-model="confirmForm.textArea")
</template>

<script>
import {
  PageHeader,
  Breadcrumb,
  Button,
  Tag,
  Form,
  Result,
  Spin,
} from "ant-design-vue";
const { Item: BreadcrumbItem } = Breadcrumb;
const { Item: FormItem } = Form;
// import { mapState } from "vuex";
import BasePermission from "../components/BasePermission.vue";
import { hasPermission } from "@src/js/common/permission.js";
// import "@src/assets/tinymce/tinymce.min.js";
// import "@src/assets/tinymce/themes/silver/theme.min.js";
// import "@src/assets/tinymce/langs/zh_CN.js";
// import "@src/assets/tinymce/icons/default/icons.min.js";
// import Editor from "@tinymce/tinymce-vue";

export default {
  components: {
    PageHeader,
    Breadcrumb,
    BreadcrumbItem,
    FormItem,
    Button,
    Tag,
    Form,
    Result,
    BasePermission,
    // Editor,
    Spin,
  },
  data() {
    return {
      isLoading: true,
      isSubmit: false,
      confirmForm: {
        textArea: "",
      },
      rules: {
        textArea: [
          { required: true, message: "关于我们描述不能为空" },
        ],
      },
      // editorCfg: {
      //   // language_url: "/lib/js/zh_CN.js",
      //   language: "zh_CN",
      //   height: 430,
      //   base_url: "/assets/tinymce",
      //   suffix: ".min",
      //   plugins: "autoresize searchreplace lists wordcount hr help",
      //   menubar: false,
      //   toolbar:
      //     "undo redo | bold italic underline strikethrough | fontsizeselect | forecolor backcolor | hr | numlist bullist | alignleft aligncenter alignright alignjustify | searchreplace wordcount | help",
      //   branding: false,
      //   elementpath: false,
      //   statusbar: false,
      //   max_height: 800,
      //   min_height: 300,
      //   custom_undo_redo_levels: 50,
      //   placeholder: "请输入关于我们的描述，最多不能超过5000字",
      //   autosave_interval: "10s",
      //   fontsize_formats: "12px 14px 16px 18px 24px 28px 32px 48px 56px 64px",
      //   toolbar_mode: "wrap",
      // },
    };
  },
  async mounted() {
    if (await hasPermission("find_demo")) {
      // if (window.tinymce) {
      //   window.tinymce.activeEditor;
      // } else {
      //   this.$message.error("富文本编辑器初始化失败，请刷新页面重试。");
      // }
      this.isLoading = false;
    }
  },
  methods: {
    async demoClick() {
    },
    finish() {},
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
@import "~@src/assets/tinymce/skins/ui/oxide/skin.min.css";
.wrap {
  .pageHeader {
    padding: 8px 0 16px;
  }
}
</style>
