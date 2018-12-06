<template>
  <div style="display: none;">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet-ant-path';

import { findRealParent, propsBinder } from 'vue2-leaflet';

const props = {
  paths: {
    type: Array,
    default() { return [] }
  },
  options: {
    type: Object,
    default() { return {} }
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true
  }
};

export default {
  name: "LPolylineAntPath",
  props,
  data() {
    return {
      ready: false
    }
  },
  mounted() {
    this.mapObject = new L.Polyline.AntPath(this.paths, this.options);
    L.DomEvent.on(this.mapObject, this.$listeners);
    propsBinder(this, this.mapObject, props);
    this.parentContainer = findRealParent(this.$parent);
    this.parentContainer.addLayer(this, !this.visible);
    this.ready = true;
  },
  beforeDestroy() {
    this.parentContainer.removeLayer(this);
  },
  methods: {
    addLayer() {
      this.parentContainer.addLayer(this, !this.visible);
    },
    removeLayer() {
      this.parentContainer.removeLayer(this);
    }
  },
  watch: {
    paths() {
      this.mapObject = new L.Polyline.AntPath(this.paths, this.options);
      this.parentContainer.addLayer(this, !this.visible);
    }
  }
}
</script>

<style>

</style>
