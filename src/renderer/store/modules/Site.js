const state = {
  site: null,
  url: null
};

const mutations = {
  UPDATE_SITE (state, payload) {
    state.site = payload.site;
    state.url = payload.url;
  }
};

export default {
  state,
  mutations
};
