/*!
* login
* create: 2017-12-05
* since: 0.0.1
*/

<template lang="pug">
  .registerBox(is="LayoutBase")
    h1 注册页
    Form(@submit.native.prevent="register" ref="form" :model="form" :rules="rules")
      FormItem.inputBox(prop="mail")
        Input(placeholder="邮箱" name="mail" v-model="form.mail" clearable prefix="md-mail")
      FormItem.inputBox(prop="mailCaptcha")
        Input(placeholder="邮箱验证码" search name="mailCaptcha" v-model="form.mailCaptcha" enter-button="获取验证码" @on-search="getMailCaptcha")
      FormItem.inputBox(prop="password")
        Input(placeholder="密码" name="password" v-model="form.password" type="password" clearable prefix="md-lock")
      FormItem.inputBox(prop="repassword")
        Input(placeholder="确认密码" name="repassword" v-model="form.repassword" type="password" clearable prefix="md-lock")
      .linkList
        | 已有账号？
        router-link(to="/user/login") 请登录>
      Button(type="primary" html-type="submit" long) 注册
</template>

<script>
import {
  Button,
  Form,
  Input,
  FormItem,
} from 'iview';
import LayoutBase from './components/LayoutBase.vue';
import api from '@/js/common/api.js';
export default{
  components: {
    LayoutBase,
    Button,
    Input,
    Form,
    FormItem,
  },

  data() {
    const repasswordVail = (rule, val, cb) => {
      if(val !== this.form.password){
        cb(new Error('两次密码输入不一致'));
      }else{
        cb();
      }
    };
    const mailIsRegisterVail = (rule, mail, cb) => {
      if(mail.trim().length){
        api
          .mailIsRegister({
            mail,
          })
          .then(res => {
            cb();
          })
          .catch(err => {
            cb(new Error(err.error));
          })
          ;
      }
    }
    return {
      form: {
        mail: '',
        mailCaptcha: '',
        password: '',
        repassword: '',
      },
      rules: {
        mail: [
          {required: true, whitespace: true, message: '邮箱不能为空', trigger: 'blur'},
          {type: 'email', message: '邮箱格式不正确', trigger: 'blur'},
          {validator: mailIsRegisterVail, trigger: 'blur'},
        ],
        mailCaptcha: [
          {required: true, whitespace: true, message: '邮箱验证码不能为空', trigger: 'blur'},
        ],
        password: [
          {required: true, whitespace: true, message: '密码不能为空', trigger: 'blur'},
        ],
        repassword: [
          {required: true, whitespace: true, message: '确认密码不能为空', trigger: 'blur'},
          {validator: repasswordVail, trigger: 'blur'},
        ],
      },
    };
  },

  methods:{
    register() {
      this.$refs.form.validate(valid => {
        if(valid){
          api
            .register(this.form)
            .then(res => {
              this.$Message.success(res.data.message);
              this.$router.push('/user/login');
            })
            .catch(err => {
              this.$Message.error(err.error);
            })
            ;
        }
      });
    },
    getMailCaptcha() {
      this.$refs.form.validateField('mail', err => {
        if(!err){
          api
            .captchaRegister({
              mail: this.form.mail,
            })
            .then(res => {
              this.$Message.success(res.data.message);
            })
            .catch(err => {
              this.$Message.error(err.error);
            })
            ;
        }
      });
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/css/_common.scss';
.registerBox{
  color: #1f2f3d;
  h1 {
    font-size: 24px;
    font-weight: 400;
    margin: 55px 0 20px;
    text-align: center;
  }
  form{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
    margin: 0 auto 20px;
    .inputBox {
      width: 100%;
      // margin-bottom: 20px;
    }
  }
  .linkList{
    display: flex;
    width: 100%;
    font-size: $font-size-small;
    margin-bottom: 6px;
    a {
      color: $primary-color;
      margin-left: 3px;
    }
  }
}
</style>
