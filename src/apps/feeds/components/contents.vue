<style lang="stylus" module>
.contents
  overflow scroll

.attachment_name_area
  width 100%
</style>

<template lang="pug">
.slds-grid.slds-grid_align-center
  article.slds-card.slds-size_1-of-2
    div(:class="$style.contents" :style="{ height: contents.height }")
      v-no-data(v-if="feeds.length === 0")

      .slds-feed(v-else)
        transition-group.slds-feed__list(tag="ul" name="tiles")
          li.slds-feed__item(v-for="feed in feeds" :key="feed.Id")
            article.slds-post
              header.slds-post__header.slds-media
                .slds-media__figure
                  .slds-avatar.slds-avatar_circle.slds-avatar_large
                    img(:alt="getUserName({ user_id: feed.CreatedById })" :src="getAvatar({ user_id: feed.CreatedById })")
                .slds-media__body
                  .slds-grid.slds-grid_align-spread.slds-has-flexi-truncate
                    p {{ getUserName({ user_id: feed.CreatedById }) }}
                    .slds-dropdown-trigger.slds-dropdown-trigger_click(
                      v-if="login_user.Id === feed.CreatedById"
                      :class="{ 'slds-is-open': is_show_menu_id === feed.Id }"
                    )
                      button.slds-button.slds-button_icon.slds-button_icon-border.slds-button_icon-x-small(@click.stop="clickMenu({ object_id: feed.Id })")
                        svg.slds-button__icon(v-html="svgs.utilities.down")
                      .slds-dropdown.slds-dropdown_right
                        ul.slds-dropdown__list(role="menu")
                          li.slds-dropdown__item(role="presentation")
                            a(role="menuitem" @click="clickDelete({ object: feed })") Delete

                  p.slds-text-body_small {{ feed.getElapsedTimeLabel() }}
              .slds-post__content.slds-text-longform
                | {{ feed.content__c }}

              .slds-post__payload(v-if="getAttachments({ parent_id: feed.Id }).length !== 0")
                ul.slds-grid.slds-grid_pull-padded
                  li.slds-p-horizontal_xx-small.slds-size_1-of-2.slds-medium-size_1-of-3(v-for="a in getAttachments({ parent_id: feed.Id })" :key="a.Id")
                    .slds-file.slds-file_card(@click="clickAttachment({ id: a.Id })")
                      figure
                        a.slds-file__crop
                          img(v-if="a.ContentType != null && a.ContentType.includes('image')" :src="`/servlet/servlet.FileDownload?file=${a.Id}`")
                          span.slds-file__icon.slds-icon_container(v-else)
                            svg.slds-icon(v-html="_getAttachmentIcon({ content_type: a.ContentType })")
                        figcaption.slds-file__title.slds-file__title_card.slds-file-has-actions
                          .slds-media.slds-media_small.slds-media_center(:class="$style.attachment_name_area")
                            .slds-media__figure.slds-line-height_reset
                              span.slds-icon_container
                                svg.slds-icon.slds-icon_x-small(v-html="_getAttachmentIcon({ content_type: a.ContentType })")
                            .slds-media__body: .slds-file__text.slds-truncate(:title="a.Name") {{ a.Name }}
                      .slds-file__actions-menu(v-if="login_user.Id === feed.CreatedById")
                        .slds-button-group
                          button.slds-button.slds-button_icon.slds-button_icon.slds-button_icon-x-small(
                            @click.stop="clickDeleteAttachment({ attachment: a })"
                          ): svg.slds-button__icon(v-html="svgs.utilities.close")

              footer.slds-post__footer
                ul.slds-post__footer-actions-list.slds-list_horizontal
                  li.slds-col.slds-item.slds-m-right_medium
                    button.slds-button_reset.slds-post__footer-action(@click="clickLikeFeed({ feed_id: feed.Id })")
                      svg.slds-icon.slds-icon-text-default.slds-icon_x-small.slds-align-middle(v-html="svgs.utilities.like")
                      | {{ isLikedFeed({ feed_id: feed.Id }) ? 'Unlike' : 'Like' }}
                  li.slds-col.slds-item.slds-m-right_medium
                    button.slds-button_reset.slds-post__footer-action(@click="clickCommentIcon({ feed_id: feed.Id })")
                      svg.slds-icon.slds-icon-text-default.slds-icon_x-small.slds-align-middle(v-html="svgs.utilities.share_post")
                      |  Comment
                ul.slds-post__footer-meta-list.slds-list_horizontal.slds-has-dividers_right.slds-text-title
                  li.slds-item {{ getNumberOfFeedLikes({ feed_id: feed.Id }) }} likes
                  li.slds-item {{ feed.number_of_comments__c }} comments
            .slds-feed__item-comments
              ul(v-if="feed.number_of_comments__c !== 0")
                li(v-for="comment in getComments({ feed_id: feed.Id })" :key="comment.Id")
                  article.slds-comment.slds-media.slds-hint-parent
                    .slds-media__figure
                      .slds-avatar.slds-avatar_circle.slds-avatar_medium
                        img(:alt="getUserName({ user_id: comment.CreatedById })" :src="getAvatar({ user_id: comment.CreatedById })")
                    .slds-media__body
                      header.slds-media.slds-media_center
                        .slds-grid.slds-grid_align-spread.slds-has-flexi-truncate
                          p {{ getUserName({ user_id: comment.CreatedById }) }}
                          .slds-dropdown-trigger.slds-dropdown-trigger_click(
                            v-if="login_user.Id === comment.CreatedById"
                            :class="{ 'slds-is-open': is_show_menu_id === comment.Id }"
                          )
                            button.slds-button.slds-button_icon.slds-button_icon-border.slds-button_icon-x-small(@click.stop="clickMenu({ object_id: comment.Id })")
                              svg.slds-button__icon(v-html="svgs.utilities.down")
                            .slds-dropdown.slds-dropdown_right
                              ul.slds-dropdown__list(role="menu")
                                li.slds-dropdown__item(role="presentation")
                                  a(role="menuitem" @click="clickDelete({ object: comment })") Delete
                      .slds-comment__content.slds-text-longform {{ comment.content__c }}
                      footer.slds-grid
                        ul.slds-list_horizontal.slds-has-dividers_right.slds-text-body_small
                          li.slds-item
                            button.slds-button_reset.slds-text-color_weak(@click="clickLikeComment({ comment_id: comment.Id })")
                              | {{ isLikedComment({ comment_id: comment.Id }) ? 'Unlike' : 'like' }}
                          li.slds-item {{ comment.getElapsedTimeLabel() }}
                        ul.slds-post__footer-meta-list.slds-list_horizontal.slds-has-dividers_right.slds-text-title
                          li.slds-item {{ getNumberOfCommentLikes({ comment_id: comment.Id }) }} likes

              .slds-media.slds-comment.slds-hint-parent(v-if="expand_comment_feed_id === feed.Id")
                .slds-media__figure
                  .slds-avatar.slds-avatar_circle.slds-avatar_medium
                    img(:alt="login_user.Name" :src="login_user.FullPhotoUrl")
                .slds-media__body
                  .slds-publisher.slds-publisher_comment.slds-is-active.slds-has-focus
                    textarea.slds-publisher__input.slds-input_bare.slds-text-longform(placeholder="Write a comment…" v-model="comment.value")
                    .slds-publisher__actions.slds-grid.slds-grid_align-spread
                      ul.slds-grid
                      button.slds-button.slds-button_brand(@click="clickCommentButton({ feed_id: feed.Id })") Comment
</template>

<script lang="ts">
import Vue from 'vue'

import { Feeds__cRecord } from '../../../objects/Feeds__c'
import { mapper } from '../store'
import Comments__c, { Comments__cRecord } from '../../../objects/Comments__c'
import Likes__c from '../../../objects/Likes__c'
import VNoData from './no-data.vue'
import { AttachmentRecord } from '../../../objects/Attachment'

export default Vue.extend({
  components: { VNoData },
  data: () => ({
    contents: { height: 'auto' },
    expand_comment_feed_id: null as string | null,
    is_show_menu_id: null as string | null,
    comment: { value: '' },
  }),
  computed: {
    ...mapper.mapState(['users', 'objects_attributes']),
    ...mapper.module('contents').mapState(['feeds', 'comments', 'likes', 'attachments']),
    ...mapper.mapGetters(['svgs', 'login_user', 'time_zone_offset']),
  },
  mounted() {
    const header_height = (this.$parent.$refs.header as Vue).$el.offsetHeight
    this.contents.height = `${innerHeight - header_height - 8 * 7}px`

    addEventListener('click', this.windowClick)
  },
  methods: {
    ...mapper.mapGetters(['getAttachmentIcon']),
    ...mapper.mapMutations(['commitError']),
    ...mapper.mapActions(['showLoading', 'hideLoading']),
    ...mapper.module('contents').mapActions(['fetch']),
    ...mapper.module('toast').mapActions({ showToast: 'show' }),
    windowClick() {
      this.is_show_menu_id = null
    },
    getUserName({ user_id }: { user_id: string }) {
      return this.users.find(_ => _.Id === user_id)!.Name
    },
    getAvatar({ user_id }: { user_id: string }) {
      return this.users.find(_ => _.Id === user_id)!.FullPhotoUrl
    },
    getComments({ feed_id }: { feed_id: string }) {
      return this.comments.filter(_ => _.feed__c === feed_id)
    },
    _getAttachmentIcon({ content_type }: { content_type: string }) {
      return this.getAttachmentIcon()({ content_type })
    },
    clickCommentIcon({ feed_id }: { feed_id: string }) {
      this.comment.value = ''

      if (this.expand_comment_feed_id === feed_id) {
        this.expand_comment_feed_id = null
        return
      }

      this.expand_comment_feed_id = feed_id
    },
    clickMenu({ object_id }: { object_id: string }) {
      if (this.is_show_menu_id === object_id) {
        this.is_show_menu_id = null
        return
      }

      this.is_show_menu_id = object_id
    },
    async clickCommentButton({ feed_id }: { feed_id: string }) {
      if (this.comment.value === '') {
        alert(`${this.objects_attributes!.Comments__c.fields.content__c.label} is required.`)
        return
      }

      const lid = await this.showLoading()

      const r = await Comments__c({ time_zone_offset: this.time_zone_offset })
        .record({ feed__c: feed_id, content__c: this.comment.value })
        .insert()
        .catch((_: Error) => _)
      if (r instanceof Error) {
        this.commitError(r)
        return
      }

      this.showToast({ text: 'Comment was created.' })

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      this.expand_comment_feed_id = null
      this.comment.value = ''

      await this.hideLoading({ id: lid })
    },
    getNumberOfFeedLikes({ feed_id }: { feed_id: string }) {
      return this.likes.filter(_ => _.feed__c === feed_id).length
    },
    getNumberOfCommentLikes({ comment_id }: { comment_id: string }) {
      return this.likes.filter(_ => _.comment__c === comment_id).length
    },
    async clickLikeFeed({ feed_id }: { feed_id: string }) {
      const lid = await this.showLoading()

      const l = this.likes.find(_ => _.feed__c === feed_id && _.CreatedById === this.login_user.Id)
      if (l == null) {
        const r = await Likes__c({ time_zone_offset: this.time_zone_offset })
          .record({ feed__c: feed_id })
          .insert()
          .catch((_: Error) => _)
        if (r instanceof Error) {
          this.commitError(r)
          return
        }
      } else {
        const d = await l.delete().catch((_: Error) => _)
        if (d instanceof Error) {
          this.commitError(d)
          return
        }
      }

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      await this.hideLoading({ id: lid })
    },
    async clickLikeComment({ comment_id }: { comment_id: string }) {
      const lid = await this.showLoading()

      const l = this.likes.find(_ => _.comment__c === comment_id && _.CreatedById === this.login_user.Id)
      if (l == null) {
        const r = await Likes__c({ time_zone_offset: this.time_zone_offset })
          .record({ comment__c: comment_id })
          .insert()
          .catch((_: Error) => _)
        if (r instanceof Error) {
          this.commitError(r)
          return
        }
      } else {
        const d = await l.delete().catch((_: Error) => _)
        if (d instanceof Error) {
          this.commitError(d)
          return
        }
      }

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      await this.hideLoading({ id: lid })
    },
    isLikedFeed({ feed_id }: { feed_id: string }) {
      return this.likes.find(_ => _.feed__c === feed_id && _.CreatedById === this.login_user.Id) != null
    },
    isLikedComment({ comment_id }: { comment_id: string }) {
      return this.likes.find(_ => _.comment__c === comment_id && _.CreatedById === this.login_user.Id) != null
    },
    async clickDelete({ object }: { object: Feeds__cRecord | Comments__cRecord }) {
      if (!confirm('Are you sure you want to delete?')) {
        return
      }

      const lid = await this.showLoading()

      const d = object.delete().catch((_: Error) => _)
      if (d instanceof Error) {
        this.commitError(d)
        return
      }

      this.showToast({ text: `${'feed__c' in object ? 'Comment' : 'Feed'} was deleted.` })

      const f = await this.fetch().catch((_: Error) => _)
      if (f instanceof Error) {
        this.commitError(f)
        return
      }

      await this.hideLoading({ id: lid })
    },
    getAttachments({ parent_id }: { parent_id: string }) {
      return this.attachments.filter(_ => _.ParentId === parent_id)
    },
    clickAttachment({ id }: { id: string }) {
      open(`/servlet/servlet.FileDownload?file=${id}`)
    },
    async clickDeleteAttachment({ attachment }: { attachment: AttachmentRecord }) {
      if (!confirm('Are you sure you want to delete?')) {
        return
      }

      const lid = await this.showLoading()

      const d = attachment.delete().catch((_: Error) => _)
      if (d instanceof Error) {
        this.commitError(d)
        return
      }

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
