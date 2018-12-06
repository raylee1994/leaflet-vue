<template>
  <div class="notInPark" v-show="!init && !ifshow">
      <div class="notInPark_wrap">
          <a href="javascript:;" class="notInPark_close"><i @click="hide"></i></a>
          <div class="notInPark_text">
              <p>您当前定位不在该景区内</p>
              <p>景区内体验效果会更佳</p>
          </div>
          <a href="javascript:;" class="openLocation" @click="openLocation"><i></i>导航去景区</a>
          <a href="javascript:;" class="notInPark_buy"><i></i>去购票</a>
      </div>
  </div>
</template>

<script>
export default {
  props: {
    init: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      ifshow: true
    }
  },
  methods: {
    show() {
      this.ifshow = false
    },
    hide() {
      this.ifshow = true
    },
    openLocation() {
      this.$emit("openLocation")
    }
  }
}
</script>

<style>

</style>
