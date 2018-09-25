/*!
* BaseUploadAvatar
* create: 2017-12-06
* since: 0.0.1
*/

<template lang="pug">
  Modal.modal(
    v-model="modalIsShow"
    title="更换头像"
    :width="600"
    ref="modal"
    @on-cancel="close"
  )
    Upload(
      type="drag"
      action="javascript:;"
      :before-upload="uploadAvatar"
      accept="image/jpg, image/png, image/jpeg"
      v-if="!cropperImgSrc"
    )
      .uploadBox
        Icon.icon(type="md-cloud-upload")
        p 将头像拖到此处，或
          span 点击上传头像
    //- VueCropper(
    //-   v-if="!!cropperSrc"
    //-   :src="cropperSrc"
    //-   :viewMode="2"
    //-   :aspectRatio="1"
    //-   :preview="preview"
    //- )
    .imgBox(v-if="cropperImgSrc")
      .leftBox
        .cropperBox
          img.cropperImg(:src="cropperImgSrc" ref="cropperImg")
        .operation
          ButtonGroup.btnGroup(shape="circle" size="small")
            Button.btn(type="primary" @click="scaleX")
              BaseIcon(type="icon-jiantou-zuoyou")
            Button.btn(type="primary" @click="scaleY")
              BaseIcon(type="icon-jiantou-shangxia")
            Button.btn(type="primary" @click="rotate")
              Icon(type="md-refresh")
      .previewBox
        .previewBlock.previewRect
          .borderBox
            .preview(ref="previewRect")
          p 头像预览
        .previewBlock.previewCircle
          .borderBox
            .preview(ref="previewCircle")
          p 头像预览
    div(slot="footer")
      .btnBox
        .leftBtn
          Button(v-if="cropperImgSrc" @click="resetAvatar") 重新选择
        .rightBtn
          Button(type="text" @click="close") 取消
          Button(type="primary" v-if="cropperImgSrc" @click="submit") 确定
</template>

<script>
import {
  Modal,
  Button,
  ButtonGroup,
  Upload,
  Icon,
} from 'iview';
import BaseIcon from './BaseIcon.vue';
import api from '@/js/common/api.js';
import publicFn from '@root/public/index';
import Cropper from 'cropperjs';
export default{
  components: {
    BaseIcon,
    Modal,
    Button,
    ButtonGroup,
    Upload,
    Icon,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      modalIsShow: this.value,
      cropperImgSrc: '',
      cropper: null,
      nowScaleX: 1,
      nowScaleY: 1,
    };
  },
  watch: {
    value(val) {
      this.modalIsShow = val;
    },
  },
  mounted() {},
  methods: {
    uploadAvatar(file) {
      const format = ['jpg', 'png', 'jpeg'];
      const file_format = file.name.split('.').pop().toLocaleLowerCase();
      if(!format.some(item => item.toLocaleLowerCase() === file_format)){
        this.$Message.error('只能上传 jpg 或 png 格式的文件');
      }else{
        this.cropperImgSrc = URL.createObjectURL(file);
        setTimeout(() => {
          this.cropper = new Cropper(this.$refs.cropperImg, {
            viewMode: 2,
            aspectRatio: 1,
            preview: [this.$refs.previewRect, this.$refs.previewCircle],
            cropend: (event) => {
            },
          });
        }, 0);
      }
      return false;
    },
    scaleX() {
      this.nowScaleX = this.nowScaleX > 0 ? -1 : 1;
      this.cropper.scaleX(this.nowScaleX);
    },
    scaleY() {
      this.nowScaleY = this.nowScaleY > 0 ? -1 : 1;
      this.cropper.scaleY(this.nowScaleY);
    },
    rotate() {
      this.cropper.rotate(45);
    },
    resetAvatar() {
      // 释放URL，保证性能
      URL.revokeObjectURL(this.cropperImgSrc);
      this.cropperImgSrc = '';
    },
    submit() {
      this.cropper.getCroppedCanvas().toBlob(blob => {
        let params = new FormData();
        params.append('avatar', blob);
        api
          .uploadAvatar(params, {
            headers:{'Content-Type':'multipart/form-data'}
          })
          .then(res => {
            this.$Message.success('头像更换成功');
            this.$emit('avatar-ok', res.data.id);
            this.resetAvatar();
            this.close();
          })
          .catch(err => {
            this.$Message.error(err.error);
          })
          ;
      }, 'image/jpeg');
    },
    close() {
      this.modalIsShow = false;
      this.$emit('input', false);
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~cropperjs/dist/cropper.css';
@import '~@/css/_common.scss';

.modal{
  .uploadBox{
    padding: 20px 10px;
    .icon{
      font-size: $font-size-large * 3;
      color: $primary-color;
      margin-bottom: 10px;
    }
    p{
      font-size: $font-size-small;
      span{
        color: $primary-color;
      }
    }
  }
  .imgBox{
    overflow: hidden;
    $box: 240px;
    .leftBox{
      float: left;
      .cropperBox{
        width: $box;
        height: $box;
        .cropperImg{
          max-width: 100%;
        }
      }
      .operation{
        margin-top: 10px;
        display: flex;
        justify-content: center;
        .btnGroup{
          width: 100%;
          .btn{
            width: 33.3333%;
          }
        }
      }
    }
    .previewBox{
      overflow: hidden;
      display: flex;
      min-width: 200px;
      justify-content: center;
      align-items: flex-start;
      padding-top: 20px;
      .previewBlock{
        display: flex;
        justify-content: center;
        flex-direction: column;
        .borderBox{
          border: 1px solid #ccc;
          overflow: hidden;
          .preview{
            width: 78px;
            height: 78px;
            margin: 2px;
            overflow: hidden;
          }
        }
        &.previewRect{
          margin-right: 30px;
        }
        &.previewCircle{
          .borderBox{
            border-radius: 40px;
            .preview{
              border-radius: 40px;
            }
          }
        }
        p{
          margin-top: 12px;
          text-align: center;
          color: #999;
        }
      }
    }
  }
  .btnBox{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
