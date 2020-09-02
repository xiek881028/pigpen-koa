<template lang="pug">
  .wrap
    Breadcrumb
      BreadcrumbItem 平台配置
      BreadcrumbItem 权限配置
    PageHeader.pageHeader(title="权限配置" subTitle="配置角色的权限以及权限组信息。")
      .tags
        Tag(color="orange") 危险操作，疑问请咨询管理员
    BasePermission(permission="find_permission")
      Result(slot="fail" status="403" title="403" sub-title="对不起，您没有权限查看。")
      .permission-wrap
        .left
          Spin(:spinning="loadingTree")
            .btn-group
              Button(size="small" type="primary" @click="allOpen") 全部展开
              Button(size="small" ghost type="primary" @click="allClose") 全部收起
            Tree(showLine showIcon blockNode :expandedKeys="expandedKeys" @expand="onExpand" @select="selectTreeNode")
              TreeNode(v-for="(group, groupIndex) in formatTree" :key="group.key" :selectable="!group.noSelect")
                .tree-node(slot="title" :class="{ active: activeId == group.key }")
                  template(v-if="group.key === '_IS_WARNING_TO_ADD_PERMISSION_GROUP'")
                    Button.add(size="small" type="link") {{group.title}}
                  template(v-else-if="group.key === '_WARNING_GROUP_IS_EMPTY'")
                    .name {{group.title}}
                  template(v-else)
                    .name {{group.title}}
                    .ops
                      BasePermission(permission="edit_permission")
                        Icon.edit(type="edit" @click.stop="edit")
                      BasePermission(permission="del_permission")
                        Icon.del(type="delete" @click.stop="del(group.title, true)")
                TreeNode(v-for="item in group.children" :key="item.key" :selectable="!item.noSelect")
                  .tree-node(slot="title" :class="{ active: activeId == item.key }")
                    template(v-if="item.key === `_IS_WARNING_TO_ADD_PERMISSION_${groupIndex}`")
                      Button.add(size="small" type="link") {{item.title}}
                    template(v-else)
                      .name {{item.title}}
                      .ops
                        BasePermission(permission="edit_permission")
                          Icon.edit(type="edit" @click.stop="edit")
                        BasePermission(permission="del_permission")
                          Icon.del(type="delete" @click.stop="del(item.title)")
        .right
          FormModel.form-wrap(v-show="isGroup === true" :labelCol="{span: 4, offset: 2}" :wrapperCol="{span: 16}" :model="groupForm" :rules="groupRules" ref="groupFormEl" @submit.prevent="submitGroup")
            FormModelItem(label="权限组名称" :colon="false" prop="name")
              Input(v-model="groupForm.name" :disabled="!canEdit")
            FormModelItem(:wrapperCol="{ span: 18, offset: 6 }")
              Button.submit-btn(type="primary" :disabled="!canEdit" htmlType="submit" :loading="isLoading") 提交
          FormModel.form-wrap(v-show="isGroup === false" :labelCol="{span: 4, offset: 2}" :wrapperCol="{span: 16}" :model="permissionForm" :rules="permissionRules" ref="permissionFormEl" @submit.prevent="submitPermission")
            FormModelItem(label="权限名称" :colon="false" prop="name")
              Input(v-model="permissionForm.name" :disabled="!canEdit")
            FormModelItem(label="权限code" :colon="false" prop="code")
              Input(v-model="permissionForm.code" :disabled="!canEdit")
            FormModelItem(label="所属权限组" :colon="false" prop="groupid")
              Select(v-model="permissionForm.groupid" :disabled="!canEdit")
                Option(v-for="item in permissionGroupList" :key="item.id") {{item.name}}
            FormModelItem(:wrapperCol="{ span: 18, offset: 6 }")
              Button.submit-btn(type="primary" :disabled="!canEdit" htmlType="submit" :loading="isLoading") 提交
</template>

<script>
import moment from "moment";
import { emptyFormat, obj2url } from "@src/js/common/helper";
import {
  PageHeader,
  Breadcrumb,
  Button,
  Tag,
  Tree,
  Icon,
  FormModel,
  Input,
  Select,
  Popconfirm,
  Spin,
  Modal,
  Result,
} from "ant-design-vue";
const { Item: BreadcrumbItem } = Breadcrumb;
const { TreeNode } = Tree;
const { Option } = Select;
const { Item: FormModelItem } = FormModel;
const { confirm } = Modal;
import { mapState } from "vuex";
import BasePermission from "../components/BasePermission.vue";
import { hasPermissionSync, hasPermission } from "@src/js/common/permission.js";
export default {
  components: {
    PageHeader,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Tag,
    Tree,
    TreeNode,
    Icon,
    FormModel,
    FormModelItem,
    Input,
    Select,
    Option,
    Popconfirm,
    Spin,
    Result,
    BasePermission,
  },
  data() {
    return {
      permissionList: [],
      permissionGroupList: [],
      expandedKeys: [],
      activeId: "",
      isGroup: null,
      // 用户数据匹配处理的中间层
      isLoading: false,
      searchData: {},
      canEdit: false,
      loadingTree: false,
      groupForm: {
        name: "",
      },
      permissionForm: {
        name: "",
        code: "",
        groupid: undefined,
      },
      groupRules: {
        name: [
          { required: true, message: "权限组名不能为空", whitespace: true },
          { max: 10, message: "权限组名长度为1~10位" },
        ],
      },
      permissionRules: {
        name: [
          { required: true, message: "权限名不能为空", whitespace: true },
          { max: 20, message: "权限名长度为1~20位" },
        ],
        code: [
          { required: true, message: "权限code不能为空", whitespace: true },
          { max: 50, message: "权限code长度为1~50位" },
        ],
        // group: [
        //   { required: true, message: "所属权限组不能为空", trigger: "change" },
        // ],
      },
    };
  },
  computed: {
    // ...mapState("order", {
    // }),
    formatTree() {
      const out = [];
      // const activeKey = [];
      const hasAddPermission = hasPermissionSync("add_permission");
      // 只有权限组没有权限的情况
      if (!this.permissionList.length && this.permissionGroupList.length) {
        this.permissionGroupList.map((group, index) => {
          const data = {};
          data.title = group.name || "未分组";
          data.key = group.id || "_WARNING_GROUP_IS_EMPTY";
          data.noSelect = !group.id;
          // activeKey.push(data.key);
          data.children = [];
          if (hasAddPermission) {
            const addPermissionData = {
              title: "添加权限",
              key: `_IS_WARNING_TO_ADD_PERMISSION_${index + 1}`, // 因为最后unshift加了一个元素，索引从1开始
              groupid: data.key,
            };
            data.children.push(addPermissionData);
            this.searchData[`_IS_WARNING_TO_ADD_PERMISSION_${index + 1}`] = {
              ...addPermissionData,
              isGroup: false,
            };
          }
          out.push(data);
          this.searchData[data.key] = { ...data, isGroup: true };
        });
      } else {
        this.permissionList.map((group, index) => {
          const data = {};
          data.title = group.groupName || "未分组";
          data.key = group.group || "_WARNING_GROUP_IS_EMPTY";
          data.noSelect = !group.group;
          // activeKey.push(data.key);
          data.children = [];
          if (hasAddPermission) {
            const addPermissionData = {
              title: "添加权限",
              key: `_IS_WARNING_TO_ADD_PERMISSION_${index + 1}`, // 因为最后unshift加了一个元素，索引从1开始
              groupid: data.key,
            };
            data.children.push(addPermissionData);
            this.searchData[`_IS_WARNING_TO_ADD_PERMISSION_${index + 1}`] = {
              ...addPermissionData,
              isGroup: false,
            };
          }
          if (group.children && group.children.length) {
            group.children.map((permission) => {
              const { name: title, id: key, code } = permission;
              data.children.push({
                title,
                key,
              });
              this.searchData[key] = {
                title,
                key,
                code,
                groupid: group.group,
                isGroup: false,
              };
            });
          }
          out.push(data);
          this.searchData[data.key] = { ...data, isGroup: true };
        });
      }
      // this.expandedKeys = [].concat(activeKey);
      if (hasAddPermission) {
        const addGroup = {
          title: "添加权限组",
          key: "_IS_WARNING_TO_ADD_PERMISSION_GROUP",
        };
        out.unshift(addGroup);
        this.searchData["_IS_WARNING_TO_ADD_PERMISSION_GROUP"] = {
          ...addGroup,
          isGroup: true,
        };
      }
      return out;
    },
  },
  filters: {},
  async mounted() {
    if (await hasPermission("find_permission")) {
      await this.getPermissionList();
      await this.getPermissionGroupList();
    }
  },
  methods: {
    // 树全部展开
    allOpen() {
      let expandedKeys = [];
      this.permissionGroupList.map(item => expandedKeys.push(item.id));
      this.expandedKeys = expandedKeys;
    },
    // 树全部收起
    allClose() {
      this.expandedKeys = [];
    },
    // 提交修改权限
    submitPermission() {
      this.$refs.permissionFormEl.validate(async (valid) => {
        if (valid) {
          const { name, code, groupid } = this.permissionForm;
          const isAdd = /^(_IS_WARNING_TO_ADD_PERMISSION_){1}[\d]+$/.test(
            this.activeId
          );
          const { groupid: _groupid } = this.searchData[this.activeId];
          try {
            this.canEdit = false;
            this.isLoading = true;
            const data = {
              name,
              code,
              groupid: groupid
                ? groupid
                : _groupid === "_WARNING_GROUP_IS_EMPTY"
                ? undefined
                : _groupid,
            };
            if (!isAdd) data.id = this.activeId;
            const res = await this.$store.dispatch(
              isAdd ? "systemUser/addPermission" : "systemUser/editPermission",
              data
            );
            this.$message.success(`权限${isAdd ? "新增" : "编辑"}成功`);
            this.getPermissionList();
            // activeId影响左侧菜单高亮样式，不要随便删除
            // this.activeId = "";
            if (isAdd) {
              // 新增清空表单
              this.reset();
              this.canEdit = true;
              this.$set(this.permissionForm, "groupid", groupid);
            }
          } catch (error) {
            this.canEdit = true;
            this.$message.error(error);
          }
          this.isLoading = false;
        }
      });
    },
    // 提交修改权限组
    submitGroup() {
      this.$refs.groupFormEl.validate(async (valid) => {
        if (valid) {
          const isAdd = this.activeId === "_IS_WARNING_TO_ADD_PERMISSION_GROUP";
          const { name } = this.groupForm;
          try {
            this.canEdit = false;
            this.isLoading = true;
            const data = { name };
            if (!isAdd) data.id = this.activeId;
            const res = await this.$store.dispatch(
              isAdd ? "systemUser/addGroup" : "systemUser/editGroup",
              data
            );
            this.$message.success(`权限组${isAdd ? "新增" : "编辑"}成功`);
            this.getPermissionList();
            if (isAdd) {
              this.reset();
              this.canEdit = true;
            }
            // 修改权限组后，更新权限select框需要获取新的权限组
            this.getPermissionGroupList();
            // activeId影响左侧菜单高亮样式，不要随便删除
            // this.activeId = "";
          } catch (error) {
            this.canEdit = true;
            this.$message.error(error);
          }
          this.isLoading = false;
        }
      });
    },
    add(isGroup) {
      this.isGroup = isGroup;
      this.reset();
      this.edit();
    },
    edit() {
      this.canEdit = true;
    },
    del(title, isGroup = false) {
      confirm({
        title: `确定删除权限${isGroup ? "组" : ""} ${title} 吗？`,
        content: (h) =>
          h("div", [
            h("span", { style: { color: "#ff4d4f" } }, title),
            ` 一旦被删除将无法恢复，`,
            isGroup
              ? h(
                  "span",
                  { style: { color: "#ff4d4f" } },
                  "组下权限全部转移至未分类组，"
                )
              : "",
            `请谨慎操作！`,
          ]),
        okText: "确定",
        okType: "danger",
        cancelText: "取消",
        onOk: () => {
          return new Promise(async (resolve, reject) => {
            try {
              const res = await this.$store.dispatch(
                isGroup ? "systemUser/delGroup" : "systemUser/delPermission",
                {
                  id: this.activeId,
                }
              );
              this.getPermissionList();
              this.$message.success(`权限${isGroup ? "组" : ""}删除成功`);
              this.activeId = "";
              isGroup && this.getPermissionGroupList();
              this.reset();
              resolve();
            } catch (error) {
              reject();
              this.$message.error(error);
            }
          });
        },
      });
    },
    // 重置表单
    reset() {
      this.$refs.groupFormEl && this.$refs.groupFormEl.resetFields();
      this.$refs.permissionFormEl && this.$refs.permissionFormEl.resetFields();
    },
    // 点击节点
    selectTreeNode(params) {
      this.canEdit = false;
      if (params.length) {
        const _params = params[0];
        const { title, key, groupid, isGroup, code } = this.searchData[_params];
        this.activeId = key;
        if (_params === "_IS_WARNING_TO_ADD_PERMISSION_GROUP") {
          this.add(true);
        } else if (/^(_IS_WARNING_TO_ADD_PERMISSION_){1}[\d]+$/.test(_params)) {
          this.add(false);
          this.$set(
            this.permissionForm,
            "groupid",
            groupid === "_WARNING_GROUP_IS_EMPTY" ? undefined : groupid
          );
        } else {
          this.isGroup = isGroup;
          if (isGroup) {
            this.groupForm = {
              name: title,
            };
          } else {
            this.permissionForm = {
              name: title,
              groupid,
              code,
            };
          }
        }
      } else {
        this.activeId = "";
        this.isGroup = null;
        this.reset();
      }
    },
    // 点击收起展开
    onExpand(keys) {
      this.expandedKeys = keys;
    },
    // 获取权限列表
    async getPermissionList() {
      try {
        this.loadingTree = true;
        const res = await this.$store.dispatch("systemUser/permissionList", {
          tree: true,
          emptyGroup: true,
        });
        this.permissionList = [].concat(res);
      } catch (error) {
        this.$message.error(error);
      }
      this.loadingTree = false;
    },
    // 获取权限组列表
    async getPermissionGroupList() {
      try {
        const res = await this.$store.dispatch("systemUser/getGroupList");
        this.permissionGroupList = [].concat(res);
      } catch (error) {
        this.$message.error(error);
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
  .permission-wrap {
    display: flex;
    .left {
      flex: 0 0 auto;
      width: 300px;
      padding-right: 10px;
      border-right: 1px solid #e8e8e8;
      max-height: 70vh;
      overflow-y: auto;
      .btn-group{
        display: flex;
        align-items: center;
        justify-content: space-evenly;
      }
      .tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .add {
          padding: 0;
        }
        .name {
          flex: 1;
          margin-right: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .ops {
          display: none;
          font-size: 16px;
          flex: 0 0 auto;
          .edit {
            margin-right: 10px;
            color: #fa8c16;
          }
          .del {
            color: #f5222d;
          }
        }
        &.active {
          .ops {
            display: flex;
          }
        }
      }
    }
    .right {
      flex: 1;
    }
  }
}
</style>
