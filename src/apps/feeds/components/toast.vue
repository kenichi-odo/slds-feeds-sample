<style lang="stylus" module>
.mobile
  min-width 80% * 1.175 !important
</style>

<template lang="pug">
.slds-notify_container
  .slds-notify.slds-notify_toast.slds-theme_success(role="status" :class="{ [$style.mobile]: is_mobile }")
    span.slds-icon_container.slds-icon-utility-success.slds-m-right_small.slds-no-flex.slds-align-top
      svg.slds-icon.slds-icon_small(v-html="svgs.utilities.success")
    .slds-notify__content
      h2.slds-text-heading_small {{ labels[labels.length - 1].text }}
    .slds-notify__close
      button.slds-button.slds-button_icon.slds-button_icon-inverse(@click="clickClose")
        svg.slds-button__icon.slds-button__icon_large(v-html="svgs.utilities.close")
</template>

<script lang="ts">
import Vue from 'vue'
import { mapper } from '../store'

export default Vue.extend({
  computed: {
    ...mapper.mapGetters(['svgs', 'is_mobile']),
    ...mapper.module('toast').mapState(['labels']),
  },
  methods: {
    ...mapper.module('toast').mapMutations(['removeLabel']),
    clickClose() {
      this.removeLabel({ id: this.labels[0].id })
    },
  },
})
</script>
