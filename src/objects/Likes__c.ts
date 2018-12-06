import { init, Record } from 'typed-remote-objects'

type SObject = Partial<{
  comment__c: string | null
  CreatedById: string | null
  CreatedDate: Date | null
  feed__c: string | null
  Id: string | null
  LastModifiedById: string | null
  LastModifiedDate: Date | null
  Name: string | null
}>

export default ({ time_zone_offset }: { time_zone_offset: number }) =>
  init<SObject>({ object_name: 'Likes__c', time_zone_offset })
export type Likes__cRecord = Record<SObject>
