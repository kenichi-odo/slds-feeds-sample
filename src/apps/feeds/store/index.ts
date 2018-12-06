import Vue from 'vue'
import { store as createStore, install, createMapper, Getters, Mutations, Actions, module } from 'sinai'
import UUID from 'uuid/v4'

import { ObjectsAttributes, RemotingKeys, init as RemoteActions } from '../assets/remotings'
import User, { UserRecord } from '../../../objects/User'

import contents from './modules/contents'
import toast from './modules/toast'
import Common__mdt, { Common__mdtRecord } from '../../../objects/Common__mdt'

Vue.use(install)

let _login_user_id: string
let _remoting_keys: RemotingKeys

class state {
  error: Error | null = null
  objects_attributes: ObjectsAttributes | null = null
  processing_ids: string[] = []
  is_show_new_feed_modal = false
  users: UserRecord[] = []
  common_mdts: Common__mdtRecord[] = []
}

class getters extends Getters<state>() {
  get remote_actions() {
    return RemoteActions({ keys: _remoting_keys })
  }

  get login_user() {
    return this.state.users.find(_ => _.Id === _login_user_id)!
  }

  get time_zone_offset() {
    return this.state.common_mdts.find(_ => _.DeveloperName === 'time_zone_offset')!.number_value__c!
  }

  get svgs() {
    return {
      doctypes: {
        attachment: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/attachment.svg'),
        csv: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/csv.svg'),
        excel: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/excel.svg'),
        image: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/image.svg'),
        pdf: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/pdf.svg'),
        ppt: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/ppt.svg'),
        txt: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/txt.svg'),
        video: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/video.svg'),
        word: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/word.svg'),
        zip: require('svg-inline-loader!@salesforce-ux/design-system/assets/icons/doctype/zip.svg'),
      },
      standards: {
        feed: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/standard/feed.svg'),
      },
      utilities: {
        attach: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/attach.svg'),
        check: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/check.svg'),
        close: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/close.svg'),
        down: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/down.svg'),
        like: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/like.svg'),
        share_post: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/share_post.svg'),
        success: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/success.svg'),
        upload: require('svg-inline-loader?removingTagAttrs=fill!@salesforce-ux/design-system/assets/icons/utility/upload.svg'),
      },
    }
  }

  getAttachmentIcon({ content_type }: { content_type: string }) {
    if (content_type == null) {
      return this.svgs.doctypes.attachment
    }

    if (content_type.includes('csv')) {
      return this.svgs.doctypes.csv
    }

    if (content_type.includes('image')) {
      return this.svgs.doctypes.image
    }

    if (content_type.includes('pdf')) {
      return this.svgs.doctypes.pdf
    }

    if (content_type.includes('plain')) {
      return this.svgs.doctypes.txt
    }

    if (content_type.includes('video')) {
      return this.svgs.doctypes.video
    }

    if (content_type.includes('zip')) {
      return this.svgs.doctypes.zip
    }

    if (
      content_type.includes('msword') ||
      content_type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      return this.svgs.doctypes.word
    }

    if (
      content_type.includes('vnd.ms-excel') ||
      content_type.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ) {
      return this.svgs.doctypes.excel
    }

    if (
      content_type.includes('vnd.ms-powerpoint') ||
      content_type.includes('vnd.openxmlformats-officedocument.presentationml.presentation')
    ) {
      return this.svgs.doctypes.ppt
    }

    return this.svgs.doctypes.attachment
  }
}

class mutations extends Mutations<state>() {
  commitError(_: Error) {
    this.state.error = _
  }

  setObjectsAttributes(_: ObjectsAttributes) {
    this.state.objects_attributes = _
  }

  addProcessingID(_: string) {
    this.state.processing_ids.push(_)
  }

  removeProcessingID(_: string) {
    this.state.processing_ids = this.state.processing_ids.filter(id => id !== _)
  }

  setUsers(_: UserRecord[]) {
    this.state.users = _
  }

  setCommonMDTs(_: Common__mdtRecord[]) {
    this.state.common_mdts = _
  }

  commitIsShowNewFeedModal(_: boolean) {
    this.state.is_show_new_feed_modal = _
  }
}

class actions extends Actions<state, getters, mutations>() {
  async showLoading() {
    const id = UUID()
    this.mutations.addProcessingID(id)
    return id
  }

  async hideLoading({ id }: { id: string }) {
    this.mutations.removeProcessingID(id)
  }

  async init() {
    const first_awaits = await Promise.all([
      this.getters.remote_actions.getObjectsAttributes({
        object_names: ['Feeds__c', 'Comments__c', 'Likes__c'],
      }),
      Common__mdt()
        .limit(100)
        .all(),
    ]).catch((_: Error) => _)
    if (first_awaits instanceof Error) {
      throw first_awaits
    }

    this.mutations.setObjectsAttributes(first_awaits[0])
    this.mutations.setCommonMDTs(first_awaits[1])

    const second_awaits = await Promise.all([
      User({ time_zone_offset: this.getters.time_zone_offset }).all(),
      store.actions.contents.fetch(),
    ]).catch((_: Error) => _)
    if (second_awaits instanceof Error) {
      throw second_awaits
    }

    this.mutations.setUsers(second_awaits[0])
  }
}

export const store = createStore(
  module({ state, getters, mutations, actions })
    .child('toast', toast)
    .child('contents', contents),
  {
    strict: false,
  },
)

export const mapper = createMapper<typeof store>()

export const Store = ({ login_user_id, remoting_keys }: { login_user_id: string; remoting_keys: RemotingKeys }) => {
  _login_user_id = login_user_id
  _remoting_keys = remoting_keys

  return store
}
