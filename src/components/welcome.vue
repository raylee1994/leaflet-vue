<template>
  <div class="welcome_wrap overlay" :class="{active: ifActice}">
      <div class="welcome_card">
          <span class="close" @click="toggle"></span>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ifActice: false
    }
  },
  methods: {
    toggle() {
      this.ifActice = !this.ifActice
    }
  }
}
</script>

<style>
</style>
