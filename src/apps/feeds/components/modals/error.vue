<template lang="pug">
article
  section.slds-modal.slds-fade-in-open.slds-modal_prompt
    .slds-modal__container
      header.slds-modal__header.slds-theme_error.slds-theme_alert-texture
        h2.slds-text-heading_medium Please contact your system administrator ({{ error.name }})
      .slds-modal__content.slds-p-around_medium
        p {{ error.message }}
  .slds-backdrop.slds-backdrop_open
</template>

<script lang="ts">
import Vue from 'vue'
import { mapper } from '../../store'

export default Vue.extend({
  computed: {
    ...mapper.mapState(['error']),
  },
  mounted() {
    console.error(this.error)
  },
})
</script>
