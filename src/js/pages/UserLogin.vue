/*!
* login
* create: 2017-12-05
* since: 0.0.1
*/

<template lang="pug">
  .loginBox(is="LayoutBase")
    h1 登录页
    Form(@submit.native.prevent="login" ref="form" :model="form" :rules="rules")
      FormItem.inputBox(prop="mail")
        Input(placeholder="邮箱" name="mail" v-model="form.mail" clearable prefix="md-mail")
      FormItem.inputBox(prop="password")
        Input(placeholder="密码" name="password" v-model="form.password" type="password" clearable prefix="md-lock")
      .linkList
        | 没有账号？
        router-link(to="/user/register") 去注册>
      Button(type="primary" html-type="submit" long) 登录
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
    return {
      form: {
        mail: '',
        password: '',
      },
      rules: {
        mail: [
          {required: true, message: '邮箱不能为空', trigger: 'blur'},
          {type: 'email', message: '邮箱格式不正确', trigger: 'blur'},
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'},
        ],
      },
    };
  },

  methods:{
    login() {
      this.$refs.form.validate(valid => {
        if(valid){
          api
            .login(this.form)
            .then(res => {
              localStorage.token = res.data.token;
              this.$Message.success(res.data.message);
              this.$router.push('/');
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
.loginBox{
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
