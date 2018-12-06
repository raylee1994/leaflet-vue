export default {
  setCategoryIndex(state, index) {
    state.categoryIndex = index
  },
  setSpotCategories(state, spotCategories) {
    state.spotCategories = spotCategories
  },
  setCategoriesIcon(state, categoriesIcon) {
    state.categoriesIcon = categoriesIcon
  },
  setSpotsData(state, data) {
    state.spotsData = data
  },
  setAudioUrl(state, url) {
    state.audioUrl = url
  },
  setQuery(state, query) {
    state.query = query
  },
  setEndMarkerName(state, name) {
    state.endMarkerName = name
  },
  setDistance(state, distance) {
    state.distance = distance
  },
  setDuration(state, duration) {
    state.duration = duration
  },
  setAudioPlaying(state, flag) {
    state.audioPlaying = flag
  },
  setLineSpotsData(state, data) {
    state.lineSpotsData = data
  },
  setPaths(state, paths) {
    state.paths = paths
  },
  setSearching(state, flag) {
    state.searching = flag
  },
  setSplitPaths(state, paths) {
    state.splitPaths = paths
  },
  setCategoriesName(state, name) {
    state.categoriesName = name
  },
  setShowRecommend(state, flag) {
    state.showRecommend = flag
  },
  setShowCategories(state, flag) {
    state.showCategories = flag
  },
  setMapId(state, id) {
    state.mapId = id
  },
  setMapIdList(state, list) {
    state.mapIdList = list
  },
  setSpotDetail(state, id) {
    state.spotDetail = id
  }
}
