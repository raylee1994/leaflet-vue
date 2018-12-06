<template>
  <div>
      <div class="scenic_list_con overlay" :class="{'active': ifActive}">
        <div class="scenic_list_con_inner">
          <a href="javascript:;" class="scenic_list_close" @click="toggleScenicList"><i></i></a>
          <div class="scenic_list_btn">
              <a href="javascript:;" v-for="(item,index) in categories" :class="{'active': index == categoryIndex}" :id="item.id" @click="toggleIndex({id:item.id, index})">
                <i :style="{background:'url('+item.icon+') center center no-repeat', backgroundSize:'0.45rem auto'}"></i>
                {{item.name}}
              </a>
          </div>

          <div class="scenic_list_wrap">
            <div class="scenic_list_box">
              <li v-for="(item,index) in spotsData" :id="item.id" @click="createrDetails(item.id, item.name)">
                <div class="scenic_list_box_img">
                  <i>
                    <span :style="{backgroundImage:'url(' + categoriesIcon[categoryIndex] + ')'}"></span>
                  </i>
                  <img v-show="item.img" :src="item.img" alt="">
                </div>
                <div class="scenic_list_box_text">
                  <h4>{{item.name}}</h4>
                  <p>{{item.area}}</p>
                </div>
                <div class="distance"><i></i></div>
              </li>
            </div>
          </div>
        </div>
      </div>
      <div class="list_mode_btn" ref="listModeBtn" :style="{display: !searching ? 'flex' : 'none'}" @click="toggleScenicList">
          <i></i>
          <em>列表模式</em>
      </div>
  </div>

</template>

<script>
import {mapGetters, mapMutations, mapActions} from "vuex"

export default {
  props: {
    categories: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      ifActive: false
    }
  },
  computed: {
    ...mapGetters([
      "categoryIndex",
      "spotsData",
      "mapId",
      "searching",
      "categoriesIcon",
      "searchSpots"
    ])
  },
  methods: {
    createrDetails(id, name) {
      const self = this
      $.post(this.searchSpots, { type: "spot", id: id }, function (data, status, xhr) {
        self.setSpotDetail(data.spot)
        setTimeout(function() {
          self.$emit("resetRoute", -1, id, self.categoryIndex, name)
        }, 100)
      }, "json")
    },
    ...mapMutations([
      "setSpotsData",
      "setCategoryIndex",
      "setMapId",
      "setSpotDetail"
    ]),
    ...mapActions([
      'toggleIndex'
    ]),
    toggleScenicList() {
      this.ifActive = !this.ifActive
    },
    hide() {
      this.ifActive = false
    },
    hideBtn() {
      this.$refs.listModeBtn.style.display = "none"
    },
    showBtn() {
      if(!this.searching) {
        this.$refs.listModeBtn.style.display = "flex"
      }
    }
  }
}
</script>

<style>

</style>
