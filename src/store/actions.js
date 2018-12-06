export default {
  toggleIndex({commit}, {id, index}) {
    commit('setCategoryIndex', index)
    commit('setMapId', id)
  }
}
