<template>
  <div v-if="startPoint">
    <l-marker :icon="icon" :lat-lng="[startPoint.lat, startPoint.lng]">
      <l-popup :options="popupOptions">
        <div class="startLabel">我在这里</div>
      </l-popup>
    </l-marker>
  </div>
</template>

<script>
import L from "leaflet"
import {LMarker, LPopup} from "vue2-leaflet"

export default {
  props: {
    startPoint: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      icon: L.divIcon({
        html: '<div class="navigation"><i></i></div>'
      }),
      popupOptions: {
        className: 'startMarkerLabel'
      }
    }
  },
  components: {
    LMarker,
    LPopup
  }
}
</script>

<style>

</style>
