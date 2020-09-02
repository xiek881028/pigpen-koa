
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import user from './modules/user';
import systemUser from './modules/systemUser';

export default new Vuex.Store({
  modules: {
    user,
    systemUser,
  },
});
