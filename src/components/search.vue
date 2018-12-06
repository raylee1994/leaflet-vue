<template>
  <div>
      <!-- 搜索 -->
      <div class="search_box_con_wrap overlay" :class="{active: boxActive}">
          <div class="search_box_con">
              <a href="javascript:;" class="search_box_close"><i @click="hideBox"></i></a>

              <div class="search_box_wrap">
                  <div class="search_box">
                      <div class="search_input_wrap">
                          <div class="search_input">
                              <i></i>
                              <form action='' onsubmit="return false;">
                                  <input type="search" v-model.trim="keywords" @search="keywordsSearch" ref="keywords" placeholder="输入关键字">
                              </form>
                          </div>
                      </div>
                      <div class="search_tag">
                        <a href="javascript:;" v-for="(item, index) in categories" :id="item.id" @click="searchTag({id:item.id, index})">{{item.name}}</a>
                      </div>
                      <a href="javascript:;" class="confirm" @click="keywordsSearch">确认</a>
                  </div>
              </div>
          </div>
      </div>

      <!-- 搜索列表模式 -->
      <div class="search_list_box_con_wrap overlay" :class="{active: resultActive}">
          <div class="search_list_box_con">
              <a href="javascript:;" class="search_list_box_close"><i @click="hideResult"></i></a>

              <div class="search_list_box_wrap">
                  <div class="search_list_box">
                      <div class="search_list_input_wrap">
                          <div class="search_list_input">
                              <i></i>
                              <form action='' onsubmit="return false;">
                                  <input type="search" v-model.trim="keywords" ref="keywordsResult" @search="resultSearch">
                              </form>
                          </div>
                      </div>
                      <div class="search_result_list">
                        <li v-for="(item, index) in searchResult" :id="item.id" @click="createrDetails(item.id, item.name)">
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
      </div>

      <!-- 右上关闭搜索按钮 -->
      <div ref="close" class="close_search" :style="{display: searching ? 'flex' : 'none'}" @click="quitSearch">
          <i></i>
          <p id="search_name">{{keywords}}</p>
      </div>

      <!-- 搜索列表模式按钮 -->
      <div ref="listModeBtn" class="list_mode_btn" :style="{display: searching ? 'flex' : 'none'}" @click="showResult">
          <i></i>
          <em>列表模式</em>
      </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

export default {
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchResult: [],
      keywords: "",
      boxActive: false,
      resultActive: false
    }
  },
  computed: {
    ...mapGetters([
      "placeSearch",
      "categoriesName",
      "searchSpots",
      "searching",
      "mapId",
      "categoryIndex",
      "categoriesIcon"
    ])
  },
  methods: {
    showBox() {
      this.boxActive = true
    },
    showResult() {
      this.resultActive = true
    },
    hideBox() {
      this.boxActive = false
      this.$refs.keywords.blur()
    },
    hideResult() {
      this.resultActive = false
      this.$refs.keywordsResult.blur()
    },
    keywordsSearch() {
      this.$refs.keywords.blur()
      this.handleSearch(this.keywords, () => {
        this.setSearching(true)
        this.setShowCategories(false)
        this.boxActive = false
      })
      this.$emit("clearPath")
    },
    resultSearch() {
      this.$refs.keywordsResult.blur()
      this.handleSearch(this.keywords)
      this.$emit("clearPath")
    },
    handleSearch(query, callback) {
      if(query == "") {
          alert("请输入关键词")
          return
      }
      $.post(this.placeSearch, {query: query}, (data) => {
        if(data.length == 0) {
            alert("没有符合的结果")
            return
        }
        if(callback) {
            callback()
        }
        this.setQuery(query)
        this.searchResult = data

        this.$emit("search")

        var spotCategories = []
        for (var index = 0; index < data.length; index++) {
          for(var j=0;j<this.categoriesName.length;j++) {
            if(data[index].category == this.categoriesName[j]) {
                spotCategories.push(j)
                break
            }
          }
        }
        this.setSpotCategories(spotCategories)
        this.setSpotsData(data)

      }, "json")
    },
    createrDetails(id) {
      const self = this
      $.post(this.searchSpots, { type: "spot", id: id }, function (data, status, xhr) {
        self.setSpotDetail(data.spot)
        setTimeout(function() {
          self.$emit("resetRoute", -1, id, self.categoryIndex, name)
        }, 100)
      }, "json")
    },
    quitSearch() {
      this.setSearching(false)
      this.setShowCategories(true)
      this.toggleIndex({id: this.mapId, index: this.categoryIndex})
      this.$emit("setDefSpots")
    },
    searchTag(id, index) {
      this.toggleIndex(id, index)
      this.boxActive = false
      this.$emit("clearPath")
    },
    hideBtn() {
      this.$refs.listModeBtn.style.display = "none"
      this.$refs.close.style.display = "none"
    },
    showBtn() {
      if(this.searching) {
        this.$refs.listModeBtn.style.display = "flex"
        this.$refs.close.style.display = "flex"
      }
    },
    ...mapActions({
      toggleIndex: "toggleIndex"
    }),
    ...mapMutations([
      "setSearching",
      "setSpotCategories",
      "setSpotsData",
      "setSpotDetail",
      "setShowCategories",
      "setQuery"
    ])
  }
}
</script>

<style>
.list_mode_btn{
  display: none;
}
</style>
