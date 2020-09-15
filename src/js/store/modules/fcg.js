export default {
  namespaced: true,
  state: {
    webSpin: false,
    contentSpin: false,
  },
  mutations: {
    setWebSpin(state, data) {
      state.webSpin = data;
    },
    setContentSpin(state, data) {
      state.contentSpin = data;
    },
  },
  actions: {
    setWebSpin(context, params) {
      context.commit('setWebSpin', params);
    },
    setContentSpin(context, params) {
      context.commit('setContentSpin', params);
    },
  },
  getters: {},
};
