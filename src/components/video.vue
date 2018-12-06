<template>
  <div class="pop_video_box" v-show="ifshow">
    <a href="javascript:;" class="video_close_btn" @click="hide"></a>
    <div class="pop_video_box_wrap">
      <video ref="video" controls preload :src="spotDetail.video"></video>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex"

export default {
  data() {
    return {
      ifshow: false
    }
  },
  computed: {
    ...mapGetters([
      "spotDetail"
    ])
  },
  methods: {
    show() {
      if(this.spotDetail.video == null) {
        alert('暂无视频')
      }else{
        this.ifshow = true
      }
    },
    hide() {
      this.ifshow = false
      this.$refs.video[0].pause()
    }
  }
}
</script>

<style>

</style>
