<style lang="stylus" module>
.root
  position fixed
  z-index 9999
  width 100%
</style>

<template lang="pug">
div(:class="$style.root" :style="{ height }")
  .slds-spinner.slds-spinner_brand.slds-spinner_large.slds-is-fixed
    .slds-spinner__dot-a
    .slds-spinner__dot-b
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    height() {
      return `${innerHeight}px`
    },
  },
})
</script>
