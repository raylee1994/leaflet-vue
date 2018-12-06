<template>
  <div id="container">
    <l-map ref="map" :zoom="zoom" :min-zoom="minZoom" :max-zoom="maxZoom" :center="center" :max-bounds="maxBounds" :crs="baiduCRS" :options="mapOptions">
      <startMarker :startPoint="startPoint"></startMarker>
      <markers ref="markers" :categories="categories" @mapPan="mapPan" @drawLine="drawLine" @resetRoute="resetRoute" :startPoint="startPoint"></markers>
      <line-markers ref="lineMarkers" :startPoint="startPoint" @drawLine="drawLine" @resetRoute="resetRoute"></line-markers>
      <l-polyline-ant-path-recommend ref="path" :paths="paths" :options="antpathOptions"></l-polyline-ant-path-recommend>
      <l-polyline-ant-path ref="splitPaths" v-for="(item, index) in splitPaths" :key="index" :paths="splitPaths" :options="antpathOptions"></l-polyline-ant-path>
    </l-map>
    <not-in-park-box ref="notInParkBox" :init="init" @openLocation="openLocation"></not-in-park-box>
    <spots-categories ref="spotsCategories" :categories="categories" :spotsReady="spotsReady"></spots-categories>
    <senic-list ref="senicList" :categories="categories" @resetRoute="resetRoute"></senic-list>
    <search ref="search" @showSearch="showSearch" @setDefSpots="setDefSpots" @clearPath="clearPath" @resetRoute="resetRoute" :categories="categories"></search>
    <zone-box ref="zoneBox" :startPoint="startPoint" @drawLine="drawLine" @clearShare="clearShare" @checkInPark="checkInPark"></zone-box>
    <hot-spot ref="hotSpot" :showIndex="showIndex" @clearPolyline="clearPolyline" @resetRoute="resetRoute"></hot-spot>
    <intro ref="intro"></intro>
    <welcome ref="welcome"></welcome>
    <loc-btn @bindGetPos="bindGetPos"></loc-btn>
    <recommend-routes ref="recommendRoutes" :center="center" :zoom="zoom" @removeMarkers="removeMarkers" @showMarkers="showMarkers" @setHotspotVisible="setHotspotVisible" @closePopup="closePopup"></recommend-routes>
    <sticky-nav @showHotspot="showHotspot" @showRecommendRoutes="showRecommendRoutes" @showSearch="showSearch" @showIntro="showIntro"></sticky-nav>
    <audio :src="audioUrl" ref="commentary" @ended="audioEnded"></audio>
  </div>
</template>

<script>
import {LMap} from "vue2-leaflet"
import L from "leaflet"
import baiduCRS from "@/common/js/crs.baidu.js"
import LPolylineAntPath from "@/components/LPolylineAntPath"
import LPolylineAntPathRecommend from "@/components/LPolylineAntPathRecommend"
import {WechatHandler} from "@/api"
import wx from 'weixin-js-sdk'
import {GPS} from "@/common/js/utils"
import notInParkBox from "@/components/notInParkBox"
import spotsCategories from "@/components/spotsCategories"
import senicList from "@/components/senicList"
import startMarker from "@/components/startMarker"
import markers from "@/components/marker"
import lineMarkers from "@/components/lineMarkers"
import zoneBox from "@/components/zoneBox"
import search from "@/components/search"
import hotSpot from "@/components/hotSpot"
import welcome from "@/components/welcome"
import stickyNav from "@/components/stickyNav"
import intro from "@/components/intro"
import locBtn from "@/components/locBtn"
import recommendRoutes from "@/components/recommendRoutes"
import {mapGetters, mapMutations, mapActions} from "vuex"

export default {
  data() {
    return {
      zoom: 17,
      minZoom: 16,
      maxZoom: 19,
      center: L.latLng(30.160607, 119.99203),
      wxCenter: [30.152991,119.984647],
      url: process.env.NODE_ENV == "production" ? "/activity/leaflet-vue/static/tiles/{z}/{x}_{-y}.png" : "/static/tiles/{z}/{x}_{-y}.png",
      baiduCRS,
      detectRetina: true,
      maxBounds: L.latLngBounds([
          [30.1477,119.983508],
          [30.170121,120.00133]
      ]),
      mapOptions: {
        attributionControl: false,
        zoomControl: false,
        zoomSnap: 0.05, // 设置无极缩放
        touchZoom: 'center', // 双指缩放地图的同时锁定地图移动
        bounceAtZoomLimits: false // 关闭回弹
      },
      antpathOptions: {
        "delay":400,
        "dashArray":[10,20],
        "weight":5,
        "color":"#00a0e9",
        "opacity": 1,
        "fillOpacity": 1,
        "pulseColor":"#41d3ff",
        "paused":false,
        "reverse":false
      },
      startLabel: null, //设为起点,
      startMarker: null, //起点marker
      startMarkerLabel: null, //起点marker文字
      startPoint: null,
      WechatjsApiList: ['checkJsApi', 'getLocation', 'openLocation', 'onMenuShareTimeline', 'onMenuShareAppMessage'],
      nowInPark: false,
      categories: [],
      spotsReady: false,
      showIndex: 1, //精彩演出索引
      miniProgram: false,
      init: true,
      shareUrl: "",
      shareId: "",
      shareCategory: -1,
      shareDsec: "iMAP景区畅游系统",
      defaultTitle: "iMAP景区畅游系统",
      shareImgUrl: "https://www.ipow.cn/images/welcome.jpg"
    }
  },
  computed: {
    ...mapGetters([
      "searchSpots",
      "mapId",
      "paths",
      "splitPaths",
      "audioUrl",
      "audioPlaying",
      "query",
      "searching",
      "spotsData",
      "lineSpotsData",
      "mapIdList"
    ])
  },
  components: {
    LMap,
    LPolylineAntPath,
    LPolylineAntPathRecommend,
    notInParkBox,
    spotsCategories,
    senicList,
    startMarker,
    markers,
    lineMarkers,
    zoneBox,
    search,
    hotSpot,
    stickyNav,
    recommendRoutes,
    intro,
    locBtn,
    welcome
  },
  methods: {
    // 添加瓦片图层
    addTile() {
      const map = this.$refs.map.mapObject
      const titleLayer = new L.TileLayer(this.url, {
          minZoom: this.minZoom,
          maxZoom: this.maxZoom+1,
          detectRetina: this.detectRetina
      })
      titleLayer.addTo(map)
    },
    // 长按设为起点
    longPressStart() {
      const self = this
      const map = this.$refs.map.mapObject
      function longPressStartFunc(e) {
        if(self.startLabel) {
            self.startLabel.remove()
            self.startLabel = null
        }
        self.startLabel = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: L.divIcon({
                html: '<div class="setStart">设为起点</div>'
            })
        })
        map.addLayer(self.startLabel)

        self.startLabel.on("click", function() {
            // self.clearStart2End()
            self.setStartMarker(e.latlng)
            self.startLabel.remove()
            self.startLabel = null
        })

        map.on("click", function(e) {
            if(self.startLabel) {
                self.startLabel.remove()
                self.startLabel = null
            }
        })
      }
      map.on("contextmenu", longPressStartFunc)
    },
    checkMp() {
      wx.miniProgram.getEnv((res) => {
          this.miniProgram = res.miniprogram
      })
    },
    bindGetPos() {
      const map = this.$refs.map.mapObject
      const self = this
      this.setEndMarkerName("")
      this.setDistance(0)
      this.setDuration(0)
      map.closePopup()
      this.getCurrentPosition(function() {
          self.clearPath()
          if(self.init) {
              self.init = false
          }
          if(self.nowInPark == true) {
              self.setStartMarker(self.nowLngLat)
              map.panTo([self.nowLngLat.lng, self.nowLngLat.lat])
          }else {
              self.$refs.notInParkBox.show()
          }
      })
    },
    // 微信定位
    wechatLocation() {
      const self = this
      WechatHandler().then((data) => {
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data["appId"], // 必填，公众号的唯一标识
            timestamp: data["timestamp"], // 必填，生成签名的时间戳
            nonceStr: data["nonceStr"], // 必填，生成签名的随机串
            signature: data["signature"],// 必填，签名，见附录1
            jsApiList: this.WechatjsApiList// 必填，需要使用的JS接口列表
        })
        wx.error(function (res) {
            console.log('验证失败返回的信息:', res);
        })
        wx.ready(function(){
            //检查客户端是否支持某个js接口
            wx.checkJsApi({
                jsApiList: self.WechatjsApiList.splice(1), // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function (res) {
                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                }
            })
            wx.showOptionMenu();
            self.handlePosition(function ff() {
                if(self.updatePosId1) {
                    clearTimeout(self.updatePosId1)
                }
                // 定时更新位置
                self.updatePosId1 = setTimeout(function f() {
                    self.handlePosition(ff)
                }, 2500)
            })

            self.sharePosition()

            //获取默认景点
            self.getDefaultSpot()
        })
      })
    },
    handlePosition: function(callback) {
        var self = this
        this.getCurrentPosition(function() {
            setTimeout(function() {
                if(self.nowInPark == true) {
                    self.setStartMarker(self.nowLngLat)
                    callback()
                }
            }, 100)
        })
    },
    getCurrentPosition: function(callback) {
        var self = this
        wx.getLocation({
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
                if (res.accuracy > 100) {
                    setTimeout(function() {
                        self.getCurrentPosition(callback);
                    }, 100)
                    return;
                }
                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var BDcoordinate = GPS.bd_encrypt(latitude, longitude)
                self.nowLngLat = L.latLng(BDcoordinate['lat'], BDcoordinate['lon'])
                self.isInPark()
                callback()
            }
        })
    },
    // 是否在园区内
    isInPark: function() {
        if (this.maxBounds.contains(this.nowLngLat)) {
            this.nowInPark = true;
            this.nowParkPos = this.nowLngLat;
        }else {
            this.nowInPark = false;
            this.$refs.notInParkBox.show()
        }
    },
    checkInPark: function() {
      if(this.init) {
          this.init = false
      }
      this.isInPark()
    },
    // 分享当前内容
    sharePosition: function() {
        var self = this
        // var url = location.protocol + "//" + location.host + location.pathname
        wx.onMenuShareTimeline({
            title: this.defaultTitle, // 分享标题
            link: location.href, // 分享链接，该链接域名必须与当前企业的可信域名一致
            imgUrl: this.shareImgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        })
        wx.onMenuShareAppMessage({
            title: this.defaultTitle, // 分享标题
            desc: this.shareDsec, // 分享描述
            link: location.href, // 分享链接，该链接域名必须与当前企业的可信域名一致
            imgUrl: this.shareImgUrl, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        })
        if(this.miniProgram) {
            var url = location.href
            var hasSpotId = url.indexOf("spotId")
            var spotId = hasSpotId > -1 ? url.substring(hasSpotId, url.indexOf("&")).split("=")[1] : -1
            var category = hasSpotId > -1 ? url.substring(url.indexOf("?")+1).split("&")[1].split("=")[1] : -1
            var data = {
                spotId: spotId,
                category: category
            }
            wx.miniProgram.postMessage({
                data: data
            })
        }
    },
    //获取默认景点
    getDefaultSpot: function() {
        var self = this
        var search = ""
        var shareCategory = ""
        var url = location.href
        var hasSpotId = url.indexOf("spotId")
        var params = url.substring(url.indexOf("?")+1).split("&")
        if(hasSpotId > -1) {
            search = url.substring(hasSpotId, url.indexOf("&")).split("=")[1]
            shareCategory = params[1].split("=")[1]
            this.$refs.zoneBox.show()

            this.createrDetails(search, shareCategory)
            this.toggleIndex({id: this.mapIdList[shareCategory], index: shareCategory})
        }else{
            this.$refs.welcome.toggle()
        }
    },
    createrDetails(detailID, categoryIndex) {
      $.post(this.searchSpots, { type: "spot", id: detailID }, (data) => {
        this.setSpotDetail(data.spot)
        this.resetRoute(-1, detailID, categoryIndex, data.spot.name)
      }, "json")
    },
    clearShare() {
      this.shareId = ""
      this.shareCategory = -1
      this.shareDsec = "iMAP景区畅游系统"
      window.history.replaceState(null, null, location.protocol + "//" + location.host + location.pathname)
      this.sharePosition()
    },
    // 设置起点
    setStartMarker: function(point) {
      this.startPoint = point
    },
    // 获取景点分类
    getSpotsCategories: function() {
      const self = this
      $.post(this.searchSpots, {type: "category"}, function(res) {
        self.categories = res.categories
        self.spotsReady = true
        var categoriesName = []
        var categoriesIcon = []
        var mapIdList = []
        res.categories.forEach((item, index) => {
          categoriesName.push(item.name)
          categoriesIcon.push(item.icon)
          mapIdList.push(item.id)
        })
        self.setCategoriesName(categoriesName)
        self.setCategoriesIcon(categoriesIcon)
        self.setMapIdList(mapIdList)
      }, "json")
    },
    clearPath() {
      if(this.paths.length>0) {
        this.$refs.path.removeLayer()
        this.setPaths([])
      }
      if(this.splitPaths.length>0) {
        this.$refs.splitPaths.forEach((path) => {
          path.removeLayer()
        })
        this.setSplitPaths([])
      }
    },
    closePopup(index) {
      const map = this.$refs.map.mapObject
      map.closePopup()
      this.$refs.lineMarkers.showPopup(map, index)
    },
    resetRoute(index, detailID, categoryIndex, name) {
      this.$refs.zoneBox.resetRoute()
      index > -1 && this.$refs.recommendRoutes.triggerClick(index)
      window.history.replaceState(null, null, location.protocol + "//" + location.host + location.pathname + "?spotId=" + detailID + "&category=" + categoryIndex)
      this.shareId = detailID
      this.shareCategory = categoryIndex
      this.shareDsec = name

      this.sharePosition()
    },
    showHotspot() {
      this.$refs.hotSpot.showHotspot()
    },
    showRecommendRoutes() {
      this.$refs.recommendRoutes.getRecommendLine()
    },
    drawLine(path, latlng, spot) {
      const map = this.$refs.map.mapObject
      this.clearPath()
      this.$nextTick(() => {
        this.setPaths(path)
      })
      map.fitBounds([
          latlng,
          [spot.latitude, spot.longitude]
      ])
      this.$refs.senicList.hide()
      this.$refs.hotSpot.hideList()
    },
    removeMarkers() {
      const map = this.$refs.map.mapObject
      this.$refs.markers.remove()
      map.closePopup()
      map.setView(this.center, this.zoom, {
          animate: false
      })
      this.zoomHandler = () => {
          this.$refs.recommendRoutes.addHide()
      }
      map.once("zoomstart", this.zoomHandler)
      this.$refs.senicList.hideBtn()
      this.$refs.search.hideBtn()
      this.clearPath()
    },
    showMarkers() {
      const map = this.$refs.map.mapObject
      if(!this.searching) {
        this.$refs.spotsCategories.getSpots(this.mapId)
      }else {
        this.$refs.search.handleSearch(this.query)
      }
      this.$refs.lineMarkers.remove()
      this.clearPath()
      map.off("zoomstart", this.zoomHandler)
      this.$refs.recommendRoutes.removeHide()
      this.$refs.senicList.showBtn()
      this.$refs.search.showBtn()
    },
    search() {
      const map = this.$refs.map.mapObject
      this.clearPath()
      map.setView(this.center, this.zoom, {
          animate: false
      })
    },
    showIntro() {
      this.$refs.intro.toggle()
    },
    showSearch() {
      this.$refs.search.showBox()
    },
    setDefSpots() {
      this.$refs.spotsCategories.getSpots(this.mapId)
      this.clearPath()
    },
    openLocation() {
      wx.openLocation({
          latitude: this.wxCenter[0], // 纬度，浮点数，范围为90 ~ -90
          longitude: this.wxCenter[1], // 经度，浮点数，范围为180 ~ -180。
          name: '杭州野生动物世界', // 位置名
          address: '浙江省杭州市富阳区杭富路九龙大道1号', // 地址详情说明
          scale: 15, // 地图缩放级别,整形值,范围从1~28。默认为最大
          infoUrl: '', // 在查看位置界面底部显示的超链接,可点击跳转
      })
    },
    mapPan(center) {
      const map = this.$refs.map.mapObject
      map.panTo(center)
    },
    setHotspotVisible() {
      this.$refs.hotSpot.setHotspotVisible()
    },
    clearPolyline() {
      const map = this.$refs.map.mapObject
      this.clearPath()
      map.setView(this.center, this.zoom-1, {
          animate: false
      })
    },
    audioEnded() {
      this.setAudioPlaying(false)
    },
    ...mapMutations([
      "setCategoriesName",
      "setCategoriesIcon",
      "setAudioPlaying",
      "setMapIdList",
      "setMapId",
      "setPaths",
      "setSplitPaths",
      "setSpotDetail",
      "setEndMarkerName",
      "setDistance",
      "setDuration"
    ]),
    ...mapActions({
      toggleIndex: 'toggleIndex'
    })
  },
  mounted() {
    this.checkMp()
    this.addTile()
    this.longPressStart()
    this.wechatLocation()
    this.getSpotsCategories()
  },
  watch: {
    audioPlaying(playing) {
      if(playing) {
        this.$refs.commentary.play()
      }else {
        this.$refs.commentary.pause()
      }
    }
  }
}
</script>

<style>

</style>
