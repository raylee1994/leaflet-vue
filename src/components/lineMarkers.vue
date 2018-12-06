<template>
  <div >
    <l-marker v-for="(spot, index) in lineSpotsData.spots" :icon="markerIcon(index)" :lat-lng="[spot.latitude, spot.longitude]" :key="spot.id" @click="setAudio(spot, index)">
      <l-popup :options="popupOptions" ref="popup">
        <div class="info_box" :id="spot.id" :class="{'hasStart': startPoint}" @click="createrDetails(spot, index, $event)">
          <div class="info_box_content">
            <div class="info_box_img">
              <div class="info_box_img_icon">
                <img :src="spot.img">
              </div>
              <em v-show="spot.audioUrl" :class="audioClass"></em>
            </div>
            <div class="info_box_p">
              <p>{{spot.name}}</p>
              <p class="info_box_area" v-show="equalName">{{spot.area}}</p>
              <p class="info_box_res" v-show="!equalName">
                <span>{{distance}}</span>米&nbsp;&nbsp;<span>{{duration}}</span>分钟
              </p>
            </div>
            <div class="info_box_go" :data-lng="spot.longitude" :data-lat="spot.latitude" v-show="equalName"></div>
          </div>
        </div>
      </l-popup>
      <l-tooltip :options="toolTipOptions(index)" :content="spot.name"></l-tooltip>
    </l-marker>
  </div>
</template>

<script>
import L from "leaflet"
import {LMarker, LPopup, LTooltip} from "vue2-leaflet"
import {mapGetters, mapMutations} from "vuex"
import {TimeFormat} from "@/common/js/utils"

export default {
  props: {
    startPoint: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    ...mapGetters([
      "categoryIndex",
      "lineSpotsData",
      "searchSpots",
      "audioPlaying",
      "audioUrl",
      "endMarkerName",
      "routePlanning",
      "distance",
      "duration"
    ]),
    audioClass() {
      return this.audioPlaying ? "playing" : "pause"
    },
    iconActive() {
      return this.audioPlaying ? "active" : ""
    },
    equalName() {
      return this.endMarkerName !== this.spotName
    }
  },
  components: {
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      popupOptions: {
        keepInView: false,
        offset: [0, -10],
        minWidth: 230,
        autoClose: false
      },
      spotName: ""
    }
  },
  methods: {
    TimeFormat,
    createrDetails(spot, index, e) {
      const self = this
      if(e.target.className == "pause") {
          if(!this.audioUrl) {
              return
          }
          this.setAudioPlaying(true)
          return
      }
      if(e.target.className == "playing") {
          this.setAudioPlaying(false)
          return
      }
      if(e.target.className == "info_box_go") {
        var latlng = this.startPoint
        $.post(this.routePlanning, {start: latlng.lat+","+latlng.lng, end: spot.latitude+","+spot.longitude}, function(res) {
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
          newPath.push([spot.latitude, spot.longitude])
          self.setEndMarkerName(spot.name)
          self.setDistance(res.result.routes[0].distance)
          self.setDuration(TimeFormat(res.result.routes[0].duration))

          // 已在园区内或已设置起点
          self.$emit("drawLine", newPath, latlng, spot)
        })
        return
      }
      $.post(this.searchSpots, { type: "spot", id: spot.id }, function (data, status, xhr) {
        self.setSpotDetail(data.spot)
        setTimeout(function() {
          self.$emit("resetRoute", index, spot.id, self.categoryIndex, spot.name)
        }, 100)
      }, "json")
    },
    toolTipOptions(i) {
      var className = ""
      if (i == 0) {
        className = "marker_name_start"
      } else if (i == this.lineSpotsData.spots.length - 1) {
        className = "marker_name_end"
      } else {
        className = "marker_name"
      }
      return {
        permanent: true,
        opacity: 1,
        className: className,
        direction: "center"
      }
    },
    markerIcon(i) {
      if (i == 0) {
          var icon = L.divIcon({
              html: '<div class="marker_icons start">' + '起' + '</div>'
          })
      } else if (i == this.lineSpotsData.spots.length - 1) {
          var icon = L.divIcon({
              html: '<div class="marker_icons end">' + '终' + '</div>'
          })
      } else {
          var icon = L.divIcon({
              html: '<div class="marker_icons">' + (i + 1) + '</div>'
          })
      }
      return icon
    },
    remove() {
      this.setLineSpotsData({})
    },
    setAudio(spot, index) {
      this.spotName = spot.name
      this.setAudioUrl(spot.audioUrl)
      this.setAudioPlaying(false)
    },
    showPopup(map, index) {
      var spot = this.lineSpotsData.spots[index]
      this.spotName = spot.name
      this.setAudioUrl(spot.audioUrl)
      this.setAudioPlaying(false)
      this.$refs.popup[index].mapObject.setLatLng([spot.latitude, spot.longitude]).openOn(map)
    },
    ...mapMutations([
      "setSpotDetail",
      "setLineSpotsData",
      "setAudioUrl",
      "setAudioPlaying",
      "setEndMarkerName",
      "setDistance",
      "setDuration"
    ])
  }
}
</script>

<style>

</style>
