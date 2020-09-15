<template lang="pug">
Modal(
  title="绑定角色"
  v-model:visible="isShow"
  :confirmLoading="modalSubmitLoading"
  :destroyOnClose="true"
  @ok="modalSubmit"
  @cancel="modalClose"
  :afterClose="modalCancel"
  :width="640"
)
  Transfer.transfer(
    :dataSource="dataSource"
    :targetKeys="targetKeys"
    :listStyle="listStyle"
    :render="item => item.title"
    :titles="['剩余角色', '拥有角色']"
    @change="handleChange"
    :showSelectAll="false"
  )
</template>

<script>
import { Modal, Transfer } from "ant-design-vue";
import { mapState } from "vuex";
import { mathArr } from "@root/helper";

export default {
  components: {
    Modal,
    Transfer,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    id: String,
  },
  data() {
    return {
      modalSubmitLoading: false,
      dataSource: [],
      targetKeys: [],
      originalTargetKeys: [],
      listStyle: {
        width: "250px",
        height: "300px",
      },
    };
  },
  watch: {
    async isShow(val) {
      const allData = [];
      const targetData = [];
      if (val && this.id) {
        try {
          const { role, list } = await this.$store.dispatch(
            "systemUser/bindRoleData",
            {
              id: this.id,
            }
          );
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            allData.push({
              key: item.id,
              title: item.name,
            });
          }
          for (let i = 0; i < role.length; i++) {
            const item = role[i];
            targetData.push(item.id);
          }
          this.originalTargetKeys = [].concat(targetData);
          this.targetKeys = [].concat(targetData);
          this.dataSource = [].concat(allData);
        } catch (error) {
          this.$message.error(error);
        }
      }
    },
  },
  async mounted() {},
  methods: {
    handleChange(nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys;
    },
    async modalSubmit() {
      try {
        const role = mathArr(this.targetKeys, this.originalTargetKeys);
        if (role.length) {
          this.modalSubmitLoading = true;
          await this.$store.dispatch("systemUser/editRole", {
            id: this.id,
            role: this.targetKeys,
          });
          this.$message.success("用户角色绑定成功");
          this.$emit("submit");
          this.modalClose();
        }
      } catch (error) {
        this.$message.error(error);
        this.modalSubmitLoading = false;
      }
    },
    modalClose() {
      this.$emit('update:isShow', false);
    },
    modalCancel() {
      this.modalSubmitLoading = false;
      this.dataSource = [];
      this.targetKeys = [];
      this.originalTargetKeys = [];
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@src/css/common.less";
.transfer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
