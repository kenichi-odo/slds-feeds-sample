import { init, Record } from 'typed-remote-objects'

type SObject = Partial<{
  FullPhotoUrl: string | null
  Id: string | null
  Name: string | null
}>

export default ({ time_zone_offset }: { time_zone_offset: number }) =>
  init<SObject>({ object_name: 'User', time_zone_offset })
export type UserRecord = Record<SObject>
