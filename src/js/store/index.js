
import { createStore } from 'vuex';
import user from './modules/user';
import systemUser from './modules/systemUser';
import fcg from './modules/fcg';

export default createStore({
  modules: {
    user,
    systemUser,
    fcg,
  },
});
