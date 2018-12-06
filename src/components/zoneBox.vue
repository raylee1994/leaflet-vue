<template>
  <div>
    <div class="zone_box_con_wrap overlay" :class="{active: ifActice}" >
      <div class="zone_box_con">
        <a href="javascript:;" class="zone_box_close"><i @click="hide"></i></a>

        <div class="zone_box_wrap">
            <div class="zone_box">
              <div class="swiper-container">
                  <div class="swiper-wrapper">
                    <div class="swiper-slide" v-for="(img, index) in spotDetail.imgs">
                      <img :src="img.imguri" alt="">
                    </div>
                  </div>
                  <div class="swiper-pagination"></div>
                </div>

                <div class="zone_title_wrap">
                  <div class="zone_title">
                    <h3>{{spotDetail.name}}</h3>
                    <p>{{spotDetail.area}}<span v-show="spotDetail.area">&nbsp;&nbsp;|&nbsp;&nbsp;</span><span>距离：<b>{{distanceText}}</b></span></p>
                  </div>
                  <a href="javascript:;" class="zone_target" :longitude="spotDetail.longitude" :latitude="spotDetail.latitude" @click="goHere"><i></i>去这里</a>
                </div>

                <div class="zone_time_wrap" v-show="spotDetail.normalTimes">
                    <div class="zone_time_icon"><i></i>今日演出时间</div>
                    <div class="zone_time" v-html="timeHtml(spotDetail.normalTimes)"></div>
                </div>

                <div class="zone_media" v-if="spotDetail.video || spotDetail.audio">
                  <div class="zone_media_video" v-if="spotDetail.video" @click="popVideo"></div>
                  <div class="zone_media_audio" v-if="spotDetail.audio" :style="audioStyle"><audio ref="audio" controls preload :src="spotDetail.audio" @playing="audioPlaying"></audio></div>
                </div>

                <div class="zone_intro" v-html="spotDetail.description">
                </div>

                <div class="zone_share"><i></i>分享</div>
            </div>
        </div>
      </div>
    </div>
    <video-box ref="videoBox"></video-box>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex"
import VideoBox from "@/components/video"
import Swiper from "swiper"
import {TimeFormat} from "@/common/js/utils"

export default {
  props: {
    startPoint: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      ifActice: false,
      swiper: null,
      distanceText: "定位后计算",
      durationText: 0,
      path: []
    }
  },
  components: {
    VideoBox
  },
  computed: {
    ...mapGetters([
      "spotDetail",
      "endMarkerName",
      "distance",
      "duration",
      "routePlanning",
      "paths"
    ]),
    audioStyle() {
      return this.spotDetail.video == "" ? { borderLeft: "none", width: "94%" } : {}
    }
  },
  methods: {
    popVideo() {
      this.refs.videoBox.show()
    },
    show() {
      this.ifActice = true
    },
    hide() {
      this.ifActice = false
      if(this.spotDetail.audio) {
        this.$refs.audio.pause()
      }
      this.$emit("clearShare")
    },
    timeHtml(normalTimes) {
      var time = normalTimes || []
      var timeHtml = ""
      if(time.length > 0) {
          time.forEach(function(item) {
              timeHtml += "<b>" + item.startTime.slice(0, item.startTime.length-3) + "</b>/"
          })
          timeHtml = timeHtml.slice(0, timeHtml.length-1)
      }
      return timeHtml
    },
    audioPlaying() {
      this.setAudioPlaying(false)
    },
    planRoute() {
      var self = this
      var latlng = this.startPoint
      $.post(this.routePlanning, {start: latlng.lat+","+latlng.lng, end: this.spotDetail.latitude+","+this.spotDetail.longitude}, function(res) {
        var steps = res.result.routes[0].steps
        var path = ""
        var newPath = []
        steps.forEach(function(item, index) {
            path += item.path + ";"
        })
        path = path.slice(0, path.length-1)
        path = path.split(";")
        path.forEach(function(item, index) {
            var newItem = item.split(",")
            newPath.push([newItem[1], newItem[0]])
        })
        newPath.unshift([latlng.lat, latlng.lng])
        newPath.push([self.spotDetail.latitude, self.spotDetail.longitude])
        self.distanceText = res.result.routes[0].distance + "米"
        self.durationText = TimeFormat(res.result.routes[0].duration)
        self.path = newPath
      })
    },
    goHere() {
      var latlng = this.startPoint
      if(latlng) {
        this.setEndMarkerName(this.spotDetail.name)
        this.setDistance(parseInt(this.distanceText))
        this.setDuration(this.durationText)
        this.$emit("drawLine", this.path, latlng, this.spotDetail)
        this.ifActice = false
      }else {
        this.$emit("checkInPark")
      }
    },
    resetRoute() {
      if(this.startPoint) {
        if(this.endMarkerName == this.spotDetail.name) {
          this.distanceText = this.distance + "米"
          this.durationText = this.duration
          this.path = this.paths
        }else {
          this.planRoute()
        }
      }else {
        this.distanceText = "定位后计算"
      }
    },
    ...mapMutations([
      "setAudioPlaying",
      "setEndMarkerName",
      "setDistance",
      "setDuration"
    ])
  },
  watch: {
    spotDetail(newSpot) {
      const self = this
      if(this.swiper) {
        this.swiper.destroy()
      }
      if(newSpot) {
        setTimeout(function() {
          self.swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            speed: 800,
            spaceBetween: 0,
            loop: true,
            autoplay: 3000,
          })
          self.ifActice = true
        }, 100)
      }
    }
  }
}
</script>

<style>

</style>
