// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import store from "./store"
import "babel-polyfill"

import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.css'
import "swiper/dist/css/swiper.min.css"
import "@/common/css/jquery.mCustomScrollbar.min.css"
import "@/common/css/style.css"


import FastClick from "fastclick"
FastClick.attach(document.body);

Vue.config.productionTip = false

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
