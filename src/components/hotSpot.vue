<template>
  <div>
    <!-- 首页滚动热点 -->
    <div class="scroll_hotspot" v-show="hotspotVisible">
        <div class="scroll_hotspot_list">
          <div v-for="(item, index) in hotspots" class="scroll_hotspot_item" :class="{'time': item.Time.length > 0, 'notTime': item.Time.length == 0}" :data-id="item.Id">
            <div class="scroll_hotspot_item_inner" @click="createHotspotDetail(item.Time.length == 0, item.Id, item.Title)">
              <span :style="{background: '#'+item.Color}">{{item.Type}}</span>
              <div class="text">
                <p>{{item.Title}}</p>
              </div>
              <i v-if="item.Time.length == 0"></i>
              <b v-if="item.Time.length > 0">{{item.Time}}</b>
            </div>
          </div>
        </div>
    </div>
    <!-- 热点列表 -->
    <div class="hotspot_list_wrap overlay" :class="{'active': listActive}" >
        <div class="hotspot_list_con">
            <a href="javascript:;" class="hotspot_close"><i @click="hideList"></i></a>
            <h2 class="title">今日热点概览</h2>
            <div class="hotspot_list_con_overflow">
              <ul class="show_list" :style="noBorder">
                <li v-for="(item, index) in hotspots" v-if="item.Time.length>0" ref="timeItem" :data-id="item.Id" :data-index="showIndex" @click="createHotspotDetail(false, item.Id, item.Title)">
                  <span>演出</span>
                  <div class="text_flex">
                    <div class="text">
                      <p>{{item.Title}}</p>
                    </div>
                    <em>即将开始</em>
                  </div>
                  <b>{{item.Time}}</b>
                  <i></i>
                </li>
              </ul>
              <ul class="hotspot_list">
                <li v-show="hotspotsList.length>0" v-for="(item, index) in hotspotsList" :data-id="item.Id" @click="createHotspotDetail(true, item.Id, item.Title)">
                  <span :style="{background: '#'+item.Color}" >{{item.Type}}</span>
                  <div class="text"><p>{{item.Title}}</p></div><i></i>
                </li>
                <p v-show="hotspotsList.length==0" style="line-height:50px;text-align:center;">暂无今日热点</p>
              </ul>
            </div>
        </div>
    </div>
    <!-- 热点详情 -->
    <div class="hotspot_detail_wrap overlay" :class="{'active': detailActive}">
        <div class="hotspot_detail_con">
            <a href="javascript:;" class="hotspot_detail_close"><i @click="hideDetail"></i></a>
            <div class="hotspot_detail_overflow">
              <div class="hotspot_detail">
                  <h2 class="title"><i class="back" @click="hideDetail"></i>{{hotspotTitle}}</h2>
                  <div class="text" v-html="hotspotDetail"></div>
              </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from "vuex"

export default {
  props: {
    showIndex: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      hotspotVisible: true,
      hotspots: [],
      hotspotsList: [],
      hotspotDetail: {},
      hotspotTitle: '',
      detailActive: false,
      listActive: false,
      ifCreateList: false,
      hotspotTimeId1: null,
      hotspotTimeId2: null,
      scrollHotspotItemfirst: null,
      scrollHotspotItemsecond: null,
      noBorderStyle: {
        border: 'none'
      }
    }
  },
  computed: {
    ...mapGetters([
      "showInfo",
      "searchSpots",
      "mapIdList"
    ]),
    noBorder() {
      var hotspots = 0
      this.hotspots.forEach((item, index) => {
        if(item.Time.length > 0) {
          hotspots += 1
        }
      })
      return hotspots == 0 ? this.noBorderStyle : ""
    }
  },
  methods: {
    addHotspot() {
      var self = this
      $.post(this.showInfo, {type: "shows"}, function(data, status, xhr) {
        self.hotspots = data.Values
        if(self.hotspotTimeId1) {
            clearTimeout(self.hotspotTimeId1)
            self.scrollHotspotItemfirst.remove()
            self.scrollHotspotItemsecond.remove()
        }
        if(self.hotspotTimeId2) {
            clearTimeout(self.hotspotTimeId2)
        }
        setTimeout(function() {
            self.scrollHotspot()
        }, 200)
      }, "json")
    },
    scrollHotspot: function() {
        var self = this
        var scrollHotspotItem = $(".scroll_hotspot_item")
        var scrollHotspotList = $(".scroll_hotspot_list")
        if(scrollHotspotItem.length>2) {
            this.scrollHotspotItemfirst = scrollHotspotItem.eq(0).clone()
            this.scrollHotspotItemsecond = scrollHotspotItem.eq(1).clone()
            var itemHeight = scrollHotspotItem.eq(0).outerHeight(true)
            var scrollIndex = 1
            scrollHotspotList.append(this.scrollHotspotItemfirst).append(this.scrollHotspotItemsecond)

            this.hotspotTimeId1 = setTimeout(function f() {
                scrollHotspotList.animate({
                    top: (-itemHeight*scrollIndex++)+'px'
                }, 1000, function() {
                    if(scrollIndex == $(".scroll_hotspot_item").length-1) {
                        scrollIndex = 1
                        scrollHotspotList.css("top", 0)
                        self.addHotspot()
                        return
                    }
                    self.hotspotTimeId2 = setTimeout(f, 5000)
                })
            }, 5000)
        }
    },
    createHotspotDetail(flag, id, title) {
      var self = this
      if(flag) {
        var self = this
        this.hotspotTitle = title
        this.detailActive = true
        $.post(this.showInfo, {type:"getPushContent", id: id}, function(data, status, xhr) {
            self.hotspotDetail = data.Values
        }, "json")
      }else {
        this.toggleIndex({id: this.mapIdList[this.showIndex], index: this.showIndex})
        this.$emit("clearPolyline")
        $.post(this.searchSpots, { type: "spot", id: id }, function (data, status, xhr) {
          self.setSpotDetail(data.spot)
          setTimeout(function() {
            self.$emit("resetRoute", -1, id, self.showIndex, title)
          }, 100)
        }, "json")
      }
    },
    showHotspot() {
      var self = this
      if(!this.ifCreateList) {
        this.ifCreateList = true
        $.post(this.showInfo, {type: "todayPush"}, function(data, status, xhr) {
          self.hotspotsList = data.Values
        }, "json")
      }
      this.listActive = true
    },
    hideDetail() {
      this.detailActive = false
    },
    hideList() {
      this.listActive = false
    },
    setHotspotVisible() {
      this.hotspotVisible = !this.hotspotVisible
    },
    ...mapMutations([
      "setCategoryIndex",
      "setSpotDetail"
    ]),
    ...mapActions([
      "toggleIndex"
    ])
  },
  mounted() {
    this.addHotspot()
  }
}
</script>

<style>

</style>
