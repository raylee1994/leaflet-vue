<template>
  <l-marker-cluster :options="clusterOptions" ref="clusterRef" @clusterclick="clusterclick">
    <l-marker v-for="(spot, index) in spotsData" :icon="markerIcon(spot, index)" :lat-lng="[spot.latitude, spot.longitude]" :key="spot.id" @click="mapPan(spot, [spot.latitude, spot.longitude])">
      <l-popup :options="popupOptions">
        <div class="info_box" :id="spot.id" :class="{'hasStart': startPoint !== null}" @click="createrDetails(spot, $event)">
          <div class="info_box_content">
            <div class="info_box_img">
              <div class="info_box_img_icon" :class="iconActive">
                <i>
                  <span :style="{background:'url(' + categoriesIcon[spotCategories[index]] + ') center center no-repeat', backgroundSize:'0.4rem auto'}"></span>
                </i>
                <img v-show="spot.img" :src="spot.img">
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
      <l-tooltip :options="toolTipOptions(spot.ishot)" :content="spot.name"></l-tooltip>
    </l-marker>
  </l-marker-cluster>
</template>

<script>
import L from "leaflet"
import {LMarker, LPopup, LTooltip} from "vue2-leaflet"
import LMarkerCluster from "vue2-leaflet-markercluster"
import {mapGetters, mapMutations} from "vuex"
import {TimeFormat} from "@/common/js/utils"

export default {
  props: {
    categories: {
      type: Array,
      default: [],
    },
    startPoint: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    ...mapGetters([
      "mapId",
      "spotsData",
      "categoryIndex",
      "spotDetail",
      "searchSpots",
      "spotCategories",
      "categoriesIcon",
      "audioUrl",
      "audioPlaying",
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
  data() {
    return {
      clusterOptions: {
        iconCreateFunction: function(cluster) {
          return L.divIcon({ html: '<div class="clusterer_icon">' + cluster.getChildCount() + '</div>' });
        },
        maxClusterRadius: 40,
        spiderfyDistanceMultiplier: 2,
        spiderLegPolylineOptions: { weight: 1.5, color: '#222', opacity: 0 },
        zoomToBoundsOnClick: false
      },
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
    createrDetails(spot, e) {
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
          self.$emit("resetRoute", -1, spot.id, self.categoryIndex, spot.name)
        }, 100)
      }, "json")
    },
    toolTipOptions(hot) {
      var className = ""
      if(hot) {
        className = "marker_name_hot"
      }else {
        className = "marker_name"
      }
      return {
        permanent: true,
        opacity: 1,
        className: className,
        direction: "center"
      }
    },
    markerIcon(spot, index) {
      if(spot.ishot) {
        var icon = L.divIcon({
          html: '<div class="marker_icons route_icon hot"><i style="background:url('+require('../common/images/hot.png')+') center center no-repeat;background-size:0.28rem auto;"></i></div>'
        })
      }else {
        var icon = L.divIcon({
          html: '<div class="marker_icons route_icon"><i style="background:url(' + this.categoriesIcon[this.spotCategories[index]] + ') center center no-repeat;background-size:0.28rem auto;"></i></div>'
        })
      }
      return icon
    },
    clusterclick(a) {
      a.layer.zoomToBounds()
    },
    ...mapMutations([
      "setSpotDetail",
      "setSpotsData",
      "setAudioUrl",
      "setAudioPlaying",
      "setEndMarkerName",
      "setDistance",
      "setDuration"
    ]),
    remove() {
      this.setSpotsData([])
    },
    mapPan(spot, center) {
      this.spotName = spot.name
      this.setAudioUrl(spot.audioUrl)
      this.setAudioPlaying(false)
      this.$emit("mapPan", center)
    }
  },
  watch: {
    spotsData() {
      // this.$refs.clusterRef.mapObject.refreshClusters()
    }
  },
  components: {
    LMarkerCluster,
    LMarker,
    LPopup,
    LTooltip
  }
}
</script>

<style>

</style>
