import { init, Record } from 'typed-remote-objects'

type SObject = Partial<{
  DeveloperName: string | null
  number_value__c: number | null
}>

export default () => init<SObject>({ object_name: 'Common__mdt', time_zone_offset: 0 })
export type Common__mdtRecord = Record<SObject>
