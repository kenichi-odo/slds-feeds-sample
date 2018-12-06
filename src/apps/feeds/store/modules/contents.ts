import { Getters, Mutations, module, Actions } from 'sinai'

import Feeds__c, { Feeds__cRecord } from '../../../../objects/Feeds__c'
import Comments__c, { Comments__cRecord } from '../../../../objects/Comments__c'
import Likes__c, { Likes__cRecord } from '../../../../objects/Likes__c'
import Attachment, { AttachmentRecord } from '../../../../objects/Attachment'
import { store } from '..'

export enum OrderType {
  newest = 'Newest',
  oldest = 'Oldest',
  most_commented = 'Most commented',
}

class state {
  selected_order_type = OrderType.newest
  feeds: Feeds__cRecord[] = []
  comments: Comments__cRecord[] = []
  likes: Likes__cRecord[] = []
  attachments: AttachmentRecord[] = []
}

class getters extends Getters<state>() {
  get order_types() {
    return Object.keys(OrderType).map(_ => OrderType[_])
  }
}

class mutations extends Mutations<state>() {
  commitOrderType(_: OrderType) {
    this.state.selected_order_type = _
  }

  commitFeeds(_: Feeds__cRecord[]) {
    this.state.feeds = _
  }

  commitComments(_: Comments__cRecord[]) {
    this.state.comments = _
  }

  commitLikes(_: Likes__cRecord[]) {
    this.state.likes = _
  }

  commitAttachments(_: AttachmentRecord[]) {
    this.state.attachments = _
  }
}

class actions extends Actions<state, getters, mutations>() {
  async fetch() {
    const time_zone_offset = store.getters.time_zone_offset

    let f = Feeds__c({ time_zone_offset })
    if (this.state.selected_order_type === OrderType.newest) {
      f = f.order('CreatedDate', 'DESC')
    } else if (this.state.selected_order_type === OrderType.oldest) {
      f = f.order('CreatedDate', 'ASC')
    } else if (this.state.selected_order_type === OrderType.most_commented) {
      f = f.order('number_of_comments__c', 'DESC')
    }

    const as = await Promise.all([
      f.all(),
      Comments__c({ time_zone_offset })
        .order('CreatedDate', 'ASC')
        .all(),
      Likes__c({ time_zone_offset }).all(),
      Attachment({ time_zone_offset }).all(),
    ]).catch((_: Error) => _)
    if (as instanceof Error) {
      throw as
    }

    this.mutations.commitFeeds(as[0])
    this.mutations.commitComments(as[1])
    this.mutations.commitLikes(as[2])
    this.mutations.commitAttachments(as[3])
  }
}

export default module({ state, getters, mutations, actions })
