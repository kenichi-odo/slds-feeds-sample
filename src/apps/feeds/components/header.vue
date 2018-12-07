<template lang="pug">
.slds-page-header(:class="{ 'slds-has-top-magnet': is_mobile, 'slds-has-bottom-magnet': is_mobile }")
  .slds-page-header__row
    .slds-page-header__col-title
      .slds-media
        .slds-media__figure
          span.slds-icon_container.slds-icon-standard-opportunity
            svg.slds-icon.slds-page-header__icon(v-html="svgs.standards.feed")
        .slds-media__body
          .slds-page-header__name
            .slds-page-header__name-title
              h1
                span {{ objects_attributes.Feeds__c.attribute.label }}
                span.slds-page-header__title.slds-truncate {{ selected_order_type }}
            .slds-page-header__name-switcher
              .slds-dropdown-trigger.slds-dropdown-trigger_click(:class="{ 'slds-is-open': is_show_dropdown }")
                button.slds-button.slds-button_icon.slds-button_icon-small(@click.stop="is_show_dropdown = !is_show_dropdown")
                  svg.slds-button__icon.slds-icon_x-small(v-html="svgs.utilities.down")
                .slds-dropdown.slds-dropdown_center.slds-dropdown_small
                  ul.slds-dropdown__list(role="menu")
                    li.slds-dropdown__item(role="presentation" v-for="o in _order_types" :key="o" :class="{ 'slds-is-selected': selected_order_type === o }")
                      a(role="menuitemcheckbox" @click="clickItem({ order_type: o })")
                        span.slds-truncate
                          svg.slds-icon.slds-icon_selected.slds-icon_x-small.slds-icon-text-default.slds-m-right_x-small(v-html="svgs.utilities.check")
                          | {{ o }}

    .slds-page-header__col-actions
      .slds-page-header__controls
        .slds-page-header__control
          ul.slds-button-group-list
            li
              button.slds-button.slds-button_neutral(@click="clickNew") New
            li
              .slds-dropdown-trigger.slds-dropdown-trigger_click(:class="{ 'slds-is-open': is_show_more }")
                button.slds-button.slds-button_icon.slds-button_icon-border-filled(@click.stop="is_show_more = !is_show_more")
                  svg.slds-button__icon(v-html="svgs.utilities.down")
                .slds-dropdown.slds-dropdown_right
                  ul.slds-dropdown__list(role="menu")
                    li.slds-dropdown__item(role="presentation")
                      a(role="menuitem" @click="clickReset") Reset
  .slds-page-header__row
    .slds-page-header__col-meta
      p.slds-page-header__meta-text {{ feeds.length }} items {{ updated_label }}
</template>

<script lang="ts">
import Vue from 'vue'

import { mapper } from '../store'
import { OrderType } from '../store/modules/contents'

export default Vue.extend({
  data: () => ({
    is_show_dropdown: false,
    is_show_more: false,
  }),
  computed: {
    ...mapper.mapState(['objects_attributes']),
    ...mapper.module('contents').mapState(['feeds', 'likes', 'selected_order_type']),
    ...mapper.module('contents').mapGetters(['order_types']),
    ...mapper.mapGetters(['svgs', 'is_mobile']),
    _order_types() {
      return this.order_types
    },
    updated_label() {
      if (this.feeds.length === 0) {
        return null
      }

      return `• Updated ${this.feeds[0].getElapsedTimeLabel()}`
    },
  },
  mounted() {
    addEventListener('click', this.windowClick)
  },
  methods: {
    ...mapper.mapMutations(['commitIsShowNewFeedModal', 'commitError']),
    ...mapper.module('contents').mapMutations(['commitOrderType']),
    ...mapper.mapActions(['showLoading', 'hideLoading']),
    ...mapper.module('contents').mapActions(['fetch']),
    ...mapper.module('toast').mapActions({ showToast: 'show' }),
    windowClick() {
      this.is_show_dropdown = false
      this.is_show_more = false
    },
    clickNew() {
      this.commitIsShowNewFeedModal(true)
    },
    async clickItem({ order_type }: { order_type: OrderType }) {
      this.commitOrderType(order_type)

      const lid = await this.showLoading()

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      await this.hideLoading({ id: lid })
    },
    async clickReset() {
      const lid = await this.showLoading()

      const as = await Promise.all([...this.feeds.map(_ => _.delete()), ...this.likes.map(_ => _.delete())])
      if (as instanceof Error) {
        this.commitError(as)
        return
      }

      this.showToast({ text: 'Reset is succeeded.' })

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      await this.hideLoading({ id: lid })
    },
  },
  destroyed() {
    removeEventListener('click', this.windowClick)
  },
})
</script>
