import Moment from 'moment'

export const getElapsedTimeLabel = ({ date_time }: { date_time: Date }) => {
  const ds = Moment().diff(Moment(date_time), 'seconds')
  if (ds < 60) {
    return `${ds} seconds ago`
  }

  const dm = Moment().diff(Moment(date_time), 'minutes')
  if (dm < 60) {
    return `${dm} minutes ago`
  }

  const dh = Moment().diff(Moment(date_time), 'hours')
  if (dh < 24) {
    return `${dh} hours ago`
  }

  return `${Moment().diff(Moment(date_time), 'days')} days ago`
}

export const textToChunk = ({ text, size }: { text: string; size: number }) => {
  return text.match(new RegExp(`.{1,${size.toString()}}`, 'g'))
}
