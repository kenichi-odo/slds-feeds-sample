import { init, Record } from 'typed-remote-objects'

import { getElapsedTimeLabel } from '../assets/utilities'

type SObject = Partial<{
  content__c: string | null
  CreatedById: string | null
  CreatedDate: Date | null
  Id: string | null
  LastModifiedById: string | null
  LastModifiedDate: Date | null
  Name: string | null
  number_of_comments__c: number | null
  OwnerId: string | null
}>

type Extensions = {
  getElapsedTimeLabel(this: SObject): string
}

export default ({ time_zone_offset }: { time_zone_offset: number }) =>
  init<SObject, Extensions>({
    object_name: 'Feeds__c',
    time_zone_offset,
    extensions: {
      getElapsedTimeLabel() {
        return getElapsedTimeLabel({ date_time: this.CreatedDate! })
      },
    },
  })
export type Feeds__cRecord = Record<SObject, Extensions>
