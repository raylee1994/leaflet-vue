<template>
  <div>
    <!-- 定位按钮 -->
    <div class="getLocBtn" @click="bindGetPos">定位</div>
    <!-- copyright -->
    <p class="copyright">©深圳互动力</p>
  </div>
</template>

<script>
export default {
  methods: {
    bindGetPos() {
      this.$emit("bindGetPos")
    }
  }
}
</script>

<style>
</style>
