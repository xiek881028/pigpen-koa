<template lang="pug">
.wrap
  Breadcrumb
    BreadcrumbItem 平台配置
    BreadcrumbItem 用户配置
  PageHeader.pageHeader(title="用户配置" subTitle="配置平台用户信息。")
    .tags
      Tag(color="red") 新建用户默认无权限（无法登陆）
      Tag(color="cyan") 用户停用后直接禁止登录
      Tag(color="orange") 危险操作，疑问请咨询管理员
    template(v-slot:extra)
      BasePermission(permission="add_user")
        Button(type="primary" @click="add")
          template(v-slot:icon)
            PlusOutlined
          | 新增
  BasePermission(permission="find_user")
    template(v-slot:fail)
      Result(status="403" title="403" sub-title="对不起，您没有权限查看。")
    .user-wrap
      Table.table(
        size="middle"
        :columns="columns"
        :dataSource="tabData"
        :loading="isLoading"
        rowKey="username"
        :pagination="false"
      )
        template(v-slot:role="{text, record}")
          Tag(v-for="item in record.role" color="#87d068" :key="item.name") {{item.name}}
        template(v-slot:state="{text, record}")
          span.state(:class="{success: record.using}") {{record.using ? '启用' : '停用'}}
        template(v-slot:action="{text, record}")
          .btn-wrap
            BasePermission(permission="reset_user_pwd")
              Popconfirm(
                :title="`重置后将生成随机密码，确定重置密码吗？`"
                ok-text="确认"
                cancel-text="取消"
                @confirm="resetPwd(record.id)"
              )
                Button.btn(size="small") 重置密码
            BasePermission(permission="edit_user_role")
              Button(type="primary" size="small" @click="addRole(record.id)") 绑定角色
            BasePermission(permission="edit_user_using")
              Popconfirm(
                :title="`${record.using ? '停用后账号将无法登录！' : ''}确定${usingText(record.using)}选中的用户吗？`"
                ok-text="确认"
                cancel-text="取消"
                @confirm="using({id: record.id, using: !record.using})"
              )
                Button.btn(size="small" type="danger" ghost) {{usingText(record.using)}}
            BasePermission(permission="del_user")
              Popconfirm(
                title="一经删除，用户将无法找回。确定删除选中的用户吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="del(record.id)"
              )
                Button.btn(size="small" type="danger") 删除
      AddModal(v-model:isShow="modalIsShow" @submit="getList")
      ResetPwdModal(v-model:isShow="resetModalIsShow" :pwd="randomPwd" @close="resetPwdCb")
      ModalAddRole(v-model:isShow="roleModalIsShow" @submit="getList" :id="userId")
</template>

<script>
import { emptyFormat } from "@src/js/common/helper";
import {
  PageHeader,
  Breadcrumb,
  Button,
  Tag,
  Table,
  Popconfirm,
  Result,
} from "ant-design-vue";
const { Item: BreadcrumbItem } = Breadcrumb;
import { mapState } from "vuex";
import AddModal from "./components/ModalAddUser.vue";
import ResetPwdModal from "./components/ModalResetPwd.vue";
import ModalAddRole from "./components/ModalAddRole.vue";
import cryptoRandomString from "crypto-random-string";
import BasePermission from "../components/BasePermission.vue";
import { hasPermission } from "@src/js/common/permission.js";
import { PlusOutlined } from '@ant-design/icons-vue';
export default {
  components: {
    PageHeader,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Tag,
    Table,
    Popconfirm,
    AddModal,
    ResetPwdModal,
    ModalAddRole,
    BasePermission,
    PlusOutlined,
    Result,
  },
  data() {
    return {
      isLoading: true,
      columns: [
        {
          title: "序号",
          width: 60,
          align: "center",
          customRender: ({ text, record, index }) => {
            return index + 1;
          },
        },
        { title: "账号", dataIndex: "username", width: 200, align: "center" },
        {
          title: "角色",
          align: "center",
          slots: { customRender: "role" },
        },
        {
          title: "状态",
          align: "center",
          slots: { customRender: "state" },
        },
        {
          title: "操作",
          width: 100,
          align: "center",
          slots: { customRender: "action" },
        },
      ],
      tabData: [],
      modalIsShow: false,
      resetModalIsShow: false,
      roleModalIsShow: false,
      randomPwd: "",
      userId: "",
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
  },
  async mounted() {
    if (await hasPermission("find_user")) {
      this.getList();
    }
  },
  methods: {
    resetPwdCb() {
      this.randomPwd = "";
    },
    // 显示停启用文案
    usingText(val) {
      return val ? "停用" : "启用";
    },
    // 获取列表
    async getList(data) {
      try {
        this.isLoading = true;
        // this.tabData = [];
        const res = await this.$store.dispatch("systemUser/list", {
          ...data,
        });
        this.tabData = emptyFormat(res, {
          ignore: ["using", "role"],
        }).concat([]);
        this.isLoading = false;
      } catch (error) {
        this.$message.error(error);
      }
    },
    add() {
      this.modalIsShow = true;
    },
    addRole(id) {
      this.userId = id;
      this.roleModalIsShow = true;
    },
    async resetPwd(id) {
      try {
        this.isLoading = true;
        this.randomPwd = cryptoRandomString({
          length: 15,
          type: "url-safe",
        });
        this.resetModalIsShow = true;
        await this.$store.dispatch("systemUser/resetPwd", {
          id,
          password: this.randomPwd,
        });
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    // 停启用
    async using(params) {
      try {
        this.isLoading = true;
        const msg = await this.$store.dispatch("systemUser/using", params);
        this.getList();
        this.$message.success(msg);
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    // 删除
    async del(id) {
      try {
        this.isLoading = true;
        const msg = await this.$store.dispatch("systemUser/del", { id });
        this.getList();
        this.$message.success(msg);
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
.wrap {
  .pageHeader {
    padding: 8px 0 16px;
  }
  .table {
    .btn-wrap {
      display: flex;
      justify-content: center;
      button {
        margin: 0 3px;
      }
    }
    .state {
      color: #f5222d;
      &.success {
        color: #52c41a;
      }
    }
  }
}
</style>
