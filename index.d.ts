declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

interface Window {
  Visualforce: {
    remoting: {
      Manager: {
        invokeAction(
          ..._: (
            | string
            | string[]
            | number
            | number[]
            | Date
            | ((
                result_,
                event_: {
                  action: string
                  data: { [index: number]: string | number | Date }
                  message: string
                  method: string
                  ref: boolean
                  result
                  status: boolean
                  statusCode: number
                  tid: number
                  type: string
                  vfDbg: boolean
                  vfTx: boolean
                  where: string
                },
              ) => void)
            | { escape?: boolean; buffer?: boolean; timeout?: number })[]
        )
      }
    }
  }
}
