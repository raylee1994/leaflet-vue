<template>
  <div>
    <!-- 推荐路线列表 -->
    <div class="recommend_line_con" :class="{'active': listActive}">
        <a href="javascript:;" class="recommend_line_close" @click="hideList">
            <i></i>
        </a>
        <div class="recommend_line_wrap">
          <div v-show="routes.length>0" class="recommend_line_box" v-for="(item, index) in routes">
              <div class="recommend_line_title_wrap">
                  <div class="recommend_line_title">
                      <h3>{{item.name}}</h3>
                      <p>景点数{{item.spotcount}}&nbsp;|&nbsp;全程{{item.distance}}公里&nbsp;|&nbsp;约{{item.time}}</p>
                  </div>
                  <a href="javascript:;" class="showSpot_btn" :id="item.id" @click="getRouteDetail(item.id)">查看</a>
              </div>
          </div>
          <p v-show="routes.length==0" style="line-height:40px;text-align:center;">暂无推荐路线</p>
        </div>
    </div>
    <!-- 推荐路线详情 -->
    <div class="recommend_line_spot_con" :class="{'active': detailActive, 'hide': ifHide}">
        <div class="recommend_line_spotwrap">
            <div class="recommend_line_box_spot_wrap">
              <div class="recommend_line_box">
                  <div class="recommend_line_title_wrap">
                      <div class="recommend_line_title">
                          <h3>{{lineSpotsData.name}}</h3>
                          <p>景点数{{lineSpotsData.spotcount}}个&nbsp;|&nbsp;全程{{lineSpotsData.distance}}公里&nbsp;|&nbsp;约{{lineSpotsData.time}}</p>
                      </div>
                      <a href="javascript:;" class="line_spot_list_close_btn" @click="hideDetail"></a>
                  </div>
              </div>
            </div>
            <div class="recommend_line_spot_list_btn_wrap">
                <div class="recommend_line_spot_list_btn">
                  <a href="javascript:;" v-for="(item, index) in lineSpotsData.spots" @click="showPopup(index)" :class="{'active': index == spotActiveIndex}" :longitude="item.longitude" :latitude="item.latitude">
                    <em>{{index + 1}}</em>
                    <i>{{item.name}}</i>
                  </a>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex"
require("jquery-mousewheel")($)
require('malihu-custom-scrollbar-plugin')($)

export default {
  props: {
    center: {
      type: Object,
      default: () => {}
    },
    zoom: {
      type: Number,
      default: 17
    }
  },
  data() {
    return {
      routes: [],
      listActive: false,
      detailActive: false,
      spotActiveIndex: -1,
      ifHide: false
    }
  },
  computed: {
    ...mapGetters([
      "recommendroutes",
      "lineSpotsData",
      "searching",
      "query"
    ])
  },
  methods: {
    getRecommendLine() {
      var self = this
      if(this.routes.length == 0) {
        $.post(this.recommendroutes, { type: "routes" }, function (data, status, xhr) {
          self.routes = data.routes
        }, "json")
      }
      this.listActive = true
    },
    getRouteDetail(id) {
      var self = this
      this.detailActive = true
      this.listActive = false
      this.$emit("removeMarkers")
      this.toggleHotSpot()

      this.$nextTick(() => {
        $.post(this.recommendroutes, { type: "route", id: id }, function (data, status, xhr) {
          self.setLineSpotsData(data.route)
          if(data.route.spots.length > 1) {
            var paths = ""
            var newPath = []
            var routePoint = []
            for (var i = 0; i < data.route.spots.length; i++) {
                var spot = data.route.spots[i]
                paths += spot.path + ";"
            }
            paths = paths.slice(1, paths.length-1)
            paths = paths.split(";")
            paths.forEach(function(item, index) {
                var newItem = item.split(",")
                newPath.push([newItem[1], newItem[0]])
            })
            newPath.unshift([data.route.spots[0].latitude, data.route.spots[0].longitude])
            newPath.push([data.route.spots[data.route.spots.length-1].latitude, data.route.spots[data.route.spots.length-1].longitude])
            self.setPaths(newPath)

            for (var j = 1; j < data.route.spots.length-1; j++) {
                var spot = data.route.spots[j]
                var points = spot.path.split(";")
                var point = points[points.length-1].split(",")
                point = point.reverse()
                routePoint.push([[self.lineSpotsData.spots[j].latitude, self.lineSpotsData.spots[j].longitude], point])
            }
            self.setSplitPaths(routePoint)
          }
        }, "json")
        this.setShowRecommend(true)
        this.setShowCategories(false)
      })
    },
    hideList() {
      this.listActive = false
    },
    hideDetail() {
      this.listActive = true
      this.detailActive = false
      this.spotActiveIndex = -1
      this.setShowRecommend(false)
      if(!this.searching) {
        this.setShowCategories(true)
      }
      this.$emit("showMarkers")
      this.toggleHotSpot()
    },
    toggleHotSpot() {
      this.$emit("setHotspotVisible")
    },
    addHide() {
      this.ifHide = true
    },
    removeHide() {
      this.ifHide = false
    },
    showPopup(index) {
      this.spotActiveIndex = index
      $(".recommend_line_spot_list_btn_wrap").mCustomScrollbar("scrollTo", -this.itemWidth*index+'px')
      this.$emit("closePopup", index)
    },
    triggerClick(index) {
      this.spotActiveIndex = index
      $(".recommend_line_spot_list_btn_wrap").mCustomScrollbar("scrollTo", -this.itemWidth*index+'px')
    },
    ...mapMutations([
      "setShowRecommend",
      "setShowCategories",
      "setLineSpotsData",
      "setPaths",
      "setSplitPaths"
    ])
  },
  watch: {
    lineSpotsData() {
      this.$nextTick(() => {
        $(".recommend_line_spot_list_btn_wrap").mCustomScrollbar("destroy")
        $(".recommend_line_spot_list_btn_wrap").mCustomScrollbar({
            theme:"light",
            axis:"x"
        })
        this.itemWidth = $(".recommend_line_spot_list_btn a").outerWidth(true)
      })
    }
  }
}
</script>

<style>

</style>
