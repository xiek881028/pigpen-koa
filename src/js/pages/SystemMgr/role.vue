<template lang="pug">
.wrap
  Breadcrumb
    BreadcrumbItem 平台配置
    BreadcrumbItem 角色配置
  PageHeader.pageHeader(title="角色配置" subTitle="配置用户的角色信息。")
    .tags
      Tag(color="orange") 危险操作，疑问请咨询管理员
  BasePermission(permission="find_role")
    template(v-slot:fail)
      Result(status="403" title="403" sub-title="对不起，您没有权限查看。")
    .content-wrap
      .left(@click="clearActive")
        Spin(:spinning="loadingRole")
          .list
            .item(v-for="item in roleList" :class="{ active: activeId == item.id }" @click.stop="activeItem(item)")
              .name {{item.name}}
              .ops
                BasePermission(permission="edit_role")
                  EditOutlined.edit(@click.stop="editRole(item)")
                BasePermission(permission="del_role")
                  Popconfirm(
                    :title="`删除后用户将失去角色，确定要删除角色 ${item.name} 吗？`"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="del(item)"
                  )
                    DeleteOutlined.del
        .btn-wrap
          BasePermission(permission="add_role")
            Button(size="small" @click.stop="add" type="primary")
              template(v-slot:icon)
                PlusCircleOutlined
              | 新增
          Button(size="small" @click.stop="getRoleList")
            template(v-slot:icon)
              RedoOutlined
            | 更新数据
      .right
        Form.form-wrap(:labelCol="{span: 4}" :wrapperCol="{span: 18}" :model="confirmForm" :rules="rules" ref="modelForm" @finish="finish")
          FormItem(label="角色名称" :colon="false" name="name")
            Input(v-model:value="confirmForm.name" :disabled="!canEdit")
          FormItem(label="权限" :colon="false")
            Row(v-for="item in permissionList" :key="item.group")
              Col.label(:span="8") {{item.groupName || '未分类'}}
              Col(:span="16")
                Checkbox.all(@change="checkAll($event, item)" :indeterminate="hasAnyList[item.group]" :checked="checkAllList[item.group]" :disabled="!canEdit") 全部
                CheckBoxGroup(:options="formatCheckbox(item.children)" v-model:value="checkedList[item.group]" @change="changePermission($event, item)" :disabled="!canEdit")
          Row
            Col(:offset="4")
              BasePermission(:permission="['add_role', 'edit_role']")
                Button.submit-btn(type="primary" v-if="canEdit" htmlType="submit" :disabled="isSubmit" :loading="isSubmit") 提交
</template>

<script>
import { emptyFormat, obj2url } from "@src/js/common/helper";
import BasePermission from "../components/BasePermission.vue";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons-vue";
import {
  PageHeader,
  Breadcrumb,
  Button,
  Tag,
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  Spin,
  Result,
  Popconfirm,
} from "ant-design-vue";
const { Item: BreadcrumbItem } = Breadcrumb;
const { Item: FormItem } = Form;
const { Group: CheckBoxGroup } = Checkbox;
import { mapState } from "vuex";
import { hasPermissionSync, hasPermission } from "@src/js/common/permission.js";
export default {
  components: {
    PageHeader,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Tag,
    Form,
    FormItem,
    Input,
    Row,
    Col,
    Checkbox,
    CheckBoxGroup,
    Spin,
    Popconfirm,
    Result,
    BasePermission,
    EditOutlined,
    DeleteOutlined,
    PlusCircleOutlined,
    RedoOutlined,
  },
  data() {
    return {
      canEdit: false,
      saveData: {},
      loadingRole: true,
      roleList: [],
      checkAllList: {},
      hasAnyList: {},
      permissionList: [],
      checkedList: {},
      activeId: "",
      isSubmit: false,
      confirmForm: {
        name: "",
      },
      rules: {
        name: [
          { required: true, message: "角色名称不能为空", whitespace: true },
          { max: 10, message: "角色名长度为1~10位" },
        ],
      },
      mode: "add",
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
  },
  async mounted() {
    if (await hasPermission("find_role")) {
      this.getRoleList();
      this.getPermissionList();
    }
  },
  methods: {
    clearActive() {
      this.activeId = "";
    },
    // 点击左侧编辑按钮
    editRole(params) {
      this.activeItem(params);
      this.canEdit = true;
    },
    // 新增角色
    add() {
      this.reset();
      this.activeId = "";
      this.mode = "add";
      this.canEdit = true;
    },
    // 删除角色
    async del(params) {
      const { id } = params;
      try {
        const res = await this.$store.dispatch("systemUser/delRole", {
          id,
        });
        this.getRoleList();
        this.$message.success("角色删除成功");
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 重置添加表单
    reset() {
      this.$refs.modelForm.resetFields();
      this.checkAllList = {};
      this.hasAnyList = {};
      this.checkedList = {};
    },
    async finish() {
      this.isSubmit = true;
      let permissionArr = [];
      for (const item in this.checkedList) {
        permissionArr = permissionArr.concat(this.checkedList[item]);
      }
      if (this.mode == "edit") {
        try {
          const res = await this.$store.dispatch(
            "systemUser/editRolePermission",
            {
              id: this.activeId,
              name: this.confirmForm.name,
              permission: permissionArr,
            }
          );
          this.$message.success("角色权限修改成功");
          this.saveData[this.activeId] = this.checkedList;
          this.canEdit = false;
        } catch (error) {
          this.$message.error(error);
        }
      } else {
        try {
          const res = await this.$store.dispatch("systemUser/addRole", {
            name: this.confirmForm.name,
            permission: permissionArr,
          });
          this.$message.success("创建角色成功");
          this.saveData[res.id] = this.checkedList;
          this.reset();
        } catch (error) {
          this.$message.error(error);
        }
      }
      this.getRoleList();
      this.isSubmit = false;
    },
    // 点击全选事件
    checkAll(e, item) {
      const isCheck = e.target.checked;
      this.checkedList[item.group] = isCheck
        ? this.formatCheckbox(item.children, true)
        : [];
      this.checkAllList[item.group] = isCheck;
      this.hasAnyList[item.group] = false;
    },
    // 点击权限checkbox
    changePermission(activeList, item) {
      this.hasAnyList[item.group] =
        !!activeList.length && activeList.length < item.children.length;
      this.checkAllList[item.group] =
        activeList.length === item.children.length;
    },
    // 格式化数据满足ant的checkboxGroup格式
    formatCheckbox(data, onlyValue = false) {
      const out = [];
      data.map((item) => {
        const { name: label, id: value } = item;
        out.push(onlyValue ? value : { label, value });
      });
      return out;
    },
    // 获取角色列表
    async getRoleList(data) {
      try {
        this.loadingRole = true;
        const res = await this.$store.dispatch("systemUser/roleList", {
          ...data,
        });
        this.roleList = [].concat(res);
        this.loadingRole = false;
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 获取角色下的权限
    getRolePermission(roleid) {
      return new Promise(async (resolve) => {
        try {
          const res = await this.$store.dispatch("systemUser/rolePermission", {
            roleid,
            tree: true,
          });
          resolve(res.list);
        } catch (error) {
          this.$message.error(error);
        }
      });
    },
    // 获取权限列表
    async getPermissionList() {
      try {
        const res = await this.$store.dispatch("systemUser/permissionList", {
          tree: true,
        });
        this.permissionList = [].concat(res);
        res.map((item) => {
          const flag = item.group || "undefined";
          this.checkedList[flag] = [];
          this.hasAnyList[flag] = false;
        });
        this.checkedList = Object.assign({}, this.checkedList);
        this.hasAnyList = Object.assign({}, this.hasAnyList);
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 点击左侧角色
    async activeItem(params) {
      const { id, name } = params;
      this.canEdit = false;
      this.activeId = id;
      this.mode = "edit";
      let list = {};
      if (this.saveData[id]) {
        list = this.saveData[id];
      } else {
        const data = await this.getRolePermission(id);
        data.map((item) => {
          const flag = item.group || "undefined";
          list[flag] = [];
          if (item.children) {
            item.children.map((permission) => {
              list[flag].push(permission.id);
            });
          }
        });
        this.saveData[id] = list;
      }
      this.setDetails({
        name,
        list,
      });
    },
    // 设置详情数据
    setDetails(data) {
      const { name, list } = data;
      this.confirmForm.name = name;
      this.checkedList = list;
      this.checkAllState();
    },
    // 检查设置全选状态
    checkAllState() {
      this.permissionList.map((item) => {
        const activeList = this.checkedList[item.group] || [];
        this.hasAnyList[item.group] =
          !!activeList.length && activeList.length < item.children.length;
        this.checkAllList[item.group] =
          activeList.length === item.children.length;
      });
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
  .content-wrap {
    display: flex;
    .left {
      display: flex;
      flex-direction: column;
      flex: 0 0 auto;
      border: 1px solid #e8e8e8;
      border-radius: 5px;
      justify-content: space-between;
      .list {
        min-height: 50px;
        width: 300px;
        max-height: 1000px;
        overflow-y: auto;
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          .name {
            line-height: 1.5;
            font-size: 16px;
            flex: 1;
            margin-right: 16px;
          }
          .ops {
            display: none;
            font-size: 16px;
            .edit {
              margin-right: 10px;
              color: #fa8c16;
            }
            .del {
              color: #f5222d;
            }
          }
          &:hover {
            background: #f9f9f9;
          }
          &.active {
            background: #f1f1f1;
            .ops {
              display: flex;
            }
          }
        }
      }
      .btn-wrap {
        border-top: 1px solid #e8e8e8;
        display: flex;
        justify-content: space-around;
        padding: 10px 0;
        margin: 0 10px;
      }
    }
    .right {
      flex: 1;
      .form-wrap {
        // width: 500px;
        min-width: 500px;
        max-width: 800px;
        margin-left: 50px;
        .label {
          text-align: right;
          padding-right: 15px;
          &::after {
            content: "：";
          }
        }
        .all {
          margin-right: 8px;
        }
      }
      .submit-btn {
        display: block;
        margin: 0 auto;
      }
    }
  }
}
</style>
