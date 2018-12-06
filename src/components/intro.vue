<template>
  <div class="scenic_intro_con overlay" v-if="introData" :class="{active: ifActive}">
      <a href="javascript:;" class="scenic_intro_close"><i @click="toggle"></i></a>
      <div class="scenic_intro_con_text">
        <div class="scenic_intro_con_text_overflow">
            <div class="scenic_intro_con_text_inner">
                <div class="scenic_intro_title_box">
                    <div class="scenic_intro_title_box_top">
                        <a href="javascript:;" class="scenic_intro_title_box_music_btn" :style="{background:'url('+introData.ImageUrl+')', backgroundSize:'100% auto'}"><i></i></a>

                        <div class="scenic_intro_title_box_top_text">
                            <h3>{{introData.Name}}</h3>
                            <div class="tag" v-html="TagSpan()"></div>
                            <a class="openLocationLink" href="javascript:;" target="_blank" @click="openLocation"><i></i>{{introData.Address}}</a>
                        </div>
                    </div>

                    <div class="scenic_intro_title_box_top_music">
                        <audio :src="introData.AudioUrl" controls></audio>
                    </div>
                </div >

                <div class="scenic_intro_wrap">
                    <div class="scenic_intro_text" v-html="introData.Introduction"></div>
                </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
import wx from 'weixin-js-sdk'
import {mapGetters} from "vuex"

export default {
  data() {
    return {
      introData: undefined,
      ifActive: false
    }
  },
  computed: {
    ...mapGetters([
      "introduction",
      "wxCenter",
      "locationName",
      "locationAddress"
    ])
  },
  created() {
    this.getIntroduction()
  },
  methods: {
    getIntroduction() {
      $.get(this.introduction, (data) => {
        this.introData = data
      })
    },
    openLocation() {
      wx.openLocation({
          latitude: this.wxCenter[0], // 纬度，浮点数，范围为90 ~ -90
          longitude: this.wxCenter[1], // 经度，浮点数，范围为180 ~ -180。
          name: this.locationName, // 位置名
          address: this.locationAddress, // 地址详情说明
          scale: 15, // 地图缩放级别,整形值,范围从1~28。默认为最大
          infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
      })
    },
    TagSpan() {
      var tags = this.introData.Tags.split(",")
      var TagSpan = ""
      tags.forEach(function(item) {
          TagSpan += "<span>"+item+"</span>"
      })
      return TagSpan
    },
    toggle() {
      this.ifActive = !this.ifActive
    }
  }
}
</script>

<style>
</style>
