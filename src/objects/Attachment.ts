import { init, Record } from 'typed-remote-objects'

type SObject = Partial<{
  Body: string | null
  ContentType: string | null
  Id: string | null
  Name: string | null
  ParentId: string | null
}>

const Attachment = ({ time_zone_offset }: { time_zone_offset: number }) =>
  init<SObject>({ object_name: 'Attachment', time_zone_offset })
export default Attachment
export type AttachmentRecord = Record<SObject>
