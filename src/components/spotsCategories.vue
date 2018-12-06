<template>
  <div class="zone_type_con" :class="{active: ifActive}" v-show="showCategories">
      <div class="zone_type">
          <a href="javascript:;" v-for="(item,index) in categories" :class="{'active': index == categoryIndex}" :id="item.id" ref="zoneTypeBtn" @click="toggle({id:item.id, index})">
            <i :style="{background:'url('+item.icon+') center center no-repeat', backgroundSize:'0.45rem auto'}"></i>
            <em></em>
            {{item.name}}
          </a>
      </div>

      <a href="javascript:;" class="zone_type_extend_btn" @click="toggleShow"></a>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from "vuex"

export default {
  props: {
    categories: {
      type: Array,
      default: []
    },
    spotsReady: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      "categoryIndex",
      "spotsData",
      "mapId",
      "searchSpots",
      "showCategories"
    ])
  },
  data() {
    return {
      latLong: [],
      ifActive: true
    }
  },
  methods: {
    ...mapMutations([
      "setSpotsData",
      "setCategoryIndex",
      "setMapId",
      "setSpotCategories"
    ]),
    toggleShow() {
      this.ifActive = !this.ifActive
      if(!this.ifActive) {
        Array.prototype.slice.call(this.$refs.zoneTypeBtn).forEach((item) => {
          item.style.display = "block"
        })
      }else{
        Array.prototype.slice.call(this.$refs.zoneTypeBtn).forEach((item) => {
          item.style.display = "none"
        })
        this.$refs.zoneTypeBtn[this.categoryIndex].style.display = "block"
      }
    },
    toggle(id, index) {
      if(this.ifActive) {
        this.toggleShow()
      }else {
        this.toggleIndex(id, index)
      }
    },
    ...mapActions({
      toggleIndex: 'toggleIndex'
    }),
    getSpots(id) {
      const self = this
      $.post(this.searchSpots, { type: "category_spots", id: id }, function (data, status, xhr) {
        self.setSpotsData(data.spots)
        var spotCategories = []
        data.spots.forEach((item, index) => {
          spotCategories.push(self.categoryIndex)
        })
        self.setSpotCategories(spotCategories)
      }, "json");
    }
  },
  watch: {
    spotsReady(ready) {
      const self = this
      if(ready) {
        setTimeout(function() {
          self.getSpots(self.$refs.zoneTypeBtn[0].id)
          self.setMapId(self.$refs.zoneTypeBtn[0].id)
        }, 100);
      }
    },
    categoryIndex(newIndex, oldIndex) {
      const self = this
      Array.prototype.slice.call(this.$refs.zoneTypeBtn).forEach((item) => {
        item.style.display = "none"
      })
      if(newIndex !== oldIndex) {
        setTimeout(function() {
          self.getSpots(self.mapId)
        }, 100);
      }
      if(!this.ifActive) {
        this.ifActive = !this.ifActive
      }
    }
  }
}
</script>

<style>

</style>
