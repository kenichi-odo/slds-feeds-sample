<style lang="stylus" src="./global.styl"></style>
<style lang="stylus" src="./index.styl" scoped></style>
<style lang="stylus" module>
.root
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

  &:before
    background-image url('../../../../node_modules/@salesforce-ux/design-system/assets/images/themes/oneSalesforce/banner-brand-default.png'), linear-gradient(to top, rgba(221, 219, 218, 0) 0, #e8e8e8)
</style>

<template lang="pug">
article.slds-brand-band.slds-brand-band_large(:class="[$style.root, { 'slds-p-around_small': !is_mobile }]" :style="root_style")
  transition(name="fade")
    v-spinner(v-if="processing_ids.length !== 0")

  template(v-if="rendered")
    v-header(ref="header")
    v-contents

  transition(name="fade")
    v-toast(v-if="labels.length !== 0")
    v-new-feed-modal(v-if="is_show_new_feed_modal")
    v-error-modal(v-if="error != null")
</template>

<script lang="ts">
import Vue from 'vue'

import VSpinner from '../components/spinner.vue'
import VHeader from '../components/header.vue'
import VContents from '../components/contents.vue'
import VToast from '../components/toast.vue'
import VNewFeedModal from '../components/modals/new-feed.vue'
import VErrorModal from '../components/modals/error.vue'

import { mapper } from '../store'

export default Vue.extend({
  components: { VSpinner, VHeader, VContents, VToast, VNewFeedModal, VErrorModal },
  data: () => ({
    rendered: false,
    height: 'auto',
  }),
  computed: {
    ...mapper.mapState(['window', 'is_show_new_feed_modal', 'processing_ids', 'error']),
    ...mapper.mapGetters(['is_mobile']),
    ...mapper.module('toast').mapState(['labels']),
    root_style(): { width: string; height: string } {
      if (this.window.width === 0) {
        return { width: 'auto', height: 'auto' }
      }
      return { width: `${this.window.width}px`, height: `${this.window.height}px` }
    },
  },
  async mounted() {
    const lid = await this.showLoading()

    const _ = await this.init().catch((_: Error) => _)
    if (_ instanceof Error) {
      this.commitError(_)
      return
    }

    await this.hideLoading({ id: lid })

    this.rendered = true
  },
  methods: {
    ...mapper.mapMutations(['commitError']),
    ...mapper.mapActions(['showLoading', 'hideLoading', 'init']),
  },
})
</script>
