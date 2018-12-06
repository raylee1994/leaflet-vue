<template>
    <div class="sticky_navigation">
        <a href="javascript:;" class="sticky_navigation_item info_item" @click="showHotspot"><i></i><em>消息</em><span></span></a>
        <a href="javascript:;" class="sticky_navigation_item route_item" @click="showRecommendRoutes"><i></i><em>路线</em></a>
        <a href="javascript:;" class="sticky_navigation_item search_item" @click="showSearch"><i></i><em>搜索</em></a>
        <a href="javascript:;" class="sticky_navigation_item intro_item" @click="showIntro"><i></i><em>介绍</em></a>
        <a href="tel:4001212563" class="sticky_navigation_item kefu_item"><i></i><em>客服</em></a>
    </div>
</template>

<script>
export default {
  methods: {
    showHotspot() {
      this.$emit("showHotspot")
    },
    showRecommendRoutes() {
      this.$emit("showRecommendRoutes")
    },
    showSearch() {
      this.$emit("showSearch")
    },
    showIntro() {
      this.$emit("showIntro")
    }
  }
}
</script>

<style>

</style>
