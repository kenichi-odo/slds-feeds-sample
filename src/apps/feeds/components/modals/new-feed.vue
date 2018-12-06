<style lang="stylus" module>
.attachment_name_area
  width 100%
</style>

<template lang="pug">
div
  section.slds-modal.slds-fade-in-open(role="dialog")
    .slds-modal__container
      header.slds-modal__header
        button.slds-button.slds-button_icon.slds-modal__close.slds-button_icon-inverse(@click="clickClose")
          svg.slds-button__icon.slds-button__icon_large(v-html="svgs.utilities.close")
        h2.slds-text-heading_medium.slds-hyphenate New feed
      .slds-modal__content.slds-p-around_medium

        .slds-form-element(:class="{ 'slds-has-error': content.error_message != null }")
          label.slds-form-element__label
            abbr.slds-required *
            | {{ objects_attributes.Feeds__c.fields.content__c.label }}
          .slds-form-element__control
            textarea.slds-textarea(:placeholder="placeholder" v-model="content.value")
          .slds-form-element__help(v-if="content.error_message != null") {{ content.error_message }}

        .slds-form-element(:class="{ 'slds-has-error': content.error_message != null }")
          label.slds-form-element__label Attachments
          .slds-form-element__control
            input(ref="input_attachment" type="file" :style="{ display: 'none' }" @change="changeInputFile")
            button.slds-button.slds-button_neutral(v-if="attachment == null" @click="clickSelectFile")
              svg.slds-button__icon.slds-button__icon_left(v-html="svgs.utilities.upload")
              | Select file
            ul.slds-grid(v-else)
              li.slds-p-horizontal_xx-small.slds-size_1-of-2.slds-medium-size_1-of-3
                .slds-file.slds-file_card
                  figure
                    a.slds-file__crop
                      img(v-if="attachment.type != null && attachment.type.includes('image')" :src="`data:${attachment.type};base64,${attachment.base64}`")
                      span.slds-file__icon.slds-icon_container(v-else)
                        svg.slds-icon(v-html="_getAttachmentIcon({ content_type: attachment.type })")
                    figcaption.slds-file__title.slds-file__title_card.slds-file-has-actions
                      .slds-media.slds-media_small.slds-media_center(:class="$style.attachment_name_area")
                        .slds-media__figure.slds-line-height_reset
                          span.slds-icon_container
                            svg.slds-icon.slds-icon_x-small(v-html="_getAttachmentIcon({ content_type: attachment.type })")
                        .slds-media__body: .slds-file__text.slds-truncate(:title="attachment.name") {{ attachment.name }}
                  .slds-file__actions-menu
                    .slds-button-group
                      button.slds-button.slds-button_icon.slds-button_icon.slds-button_icon-x-small(@click="clickRemoveAttachment")
                        svg.slds-button__icon(v-html="svgs.utilities.close")

      footer.slds-modal__footer
        button.slds-button.slds-button_neutral(@click="clickClose") Cancel
        button.slds-button.slds-button_brand(@click="clickSave") Save
  .slds-backdrop.slds-backdrop_open
</template>

<script lang="ts">
import Vue from 'vue'

import { mapper } from '../../store'
import Feeds__c from '../../../../objects/Feeds__c'
import Attachment, { AttachmentRecord } from '../../../../objects/Attachment'
import { textToChunk } from '../../../../assets/utilities'

export default Vue.extend({
  data: () => ({
    content: {
      value: '',
      error_message: null as string | null,
    },
    attachment: null as {
      name: string | null
      type: string | null
      base64: string | null
    } | null,
  }),
  computed: {
    ...mapper.mapState(['objects_attributes']),
    ...mapper.mapGetters(['svgs', 'time_zone_offset']),
    placeholder(): string {
      return `Write a ${this.objects_attributes!.Feeds__c.fields.content__c.label.toLowerCase()}…`
    },
  },
  methods: {
    ...mapper.mapGetters(['getAttachmentIcon']),
    ...mapper.mapMutations(['commitIsShowNewFeedModal', 'commitError']),
    ...mapper.mapActions(['showLoading', 'hideLoading']),
    ...mapper.module('contents').mapActions(['fetch']),
    ...mapper.module('toast').mapActions({ showToast: 'show' }),
    _getAttachmentIcon({ content_type }: { content_type: string }) {
      return this.getAttachmentIcon()({ content_type })
    },
    clickClose() {
      this.commitIsShowNewFeedModal(false)
    },
    clickSelectFile() {
      ;(this.$refs.input_attachment as HTMLInputElement).click()
    },
    async changeInputFile(_: Event) {
      const readFile = ({ file }: { file: File }) => {
        return new Promise((Resolve_: (_: string) => void) => {
          const r = new FileReader()
          r.onload = () => Resolve_(r.result as string)
          r.readAsDataURL(file)
        })
      }

      const file = (_.target as HTMLInputElement).files!.item(0)!
      const result = await readFile({ file })
      ;(this.$refs.input_attachment as HTMLInputElement).value = ''

      const base64: string = result.split(',')[1]
      if (base64.length > 6000000) {
        alert('Attach a file with a file size of about 4.3 MB or less.')
        return
      }

      this.attachment = { name: file.name, type: file.type, base64 }
    },
    clickRemoveAttachment() {
      this.attachment = null
    },
    async clickSave() {
      this.content.error_message = null

      if (this.content.value === '') {
        this.content.error_message = `${this.objects_attributes!.Feeds__c.fields.content__c.label} is required.`
        return
      }

      const lid = await this.showLoading()

      const f = await Feeds__c({ time_zone_offset: this.time_zone_offset })
        .record({ content__c: this.content.value })
        .insert()
        .catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      if (this.attachment != null) {
        let counter = 0
        let attachment: AttachmentRecord | Error

        const chunks = textToChunk({ text: this.attachment.base64!, size: 1000000 })!
        while (true) {
          const b = chunks[counter]
          if (b == null) {
            break
          }

          if (counter === 0) {
            attachment = await Attachment({ time_zone_offset: this.time_zone_offset })
              .record({
                ParentId: f.Id,
                Name: this.attachment.name,
                ContentType: this.attachment.type,
                Body: b,
              })
              .insert()
              .catch((_: Error) => _)
            if (attachment instanceof Error) {
              this.commitError(attachment)
              break
            }

            counter += 1
            continue
          }

          await (attachment! as AttachmentRecord)
            .set('Body', b)
            .update()
            .catch((_: Error) => _)
          if (attachment instanceof Error) {
            this.commitError(attachment)
            break
          }
          counter += 1
        }
      }

      this.clickClose()

      this.showToast({ text: 'Feed was created.' })

      const _ = await this.fetch().catch((_: Error) => _)
      if (_ instanceof Error) {
        this.commitError(_)
        return
      }

      await this.hideLoading({ id: lid })
    },
  },
})
</script>
