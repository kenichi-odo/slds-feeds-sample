export type RemotingKeys = {
  GET_OBJECTS_ATTRIBUTES: string
}

export type ObjectsAttributes = {
  [key: string]: {
    attribute: {
      label: string
      [properties: string]: any
    }
    fields: {
      [field_name: string]: {
        label: string
        [properties: string]: any
      }
    }
  }
}

export const init = ({ keys }: { keys: RemotingKeys }) => {
  return {
    getObjectsAttributes: ({ object_names }: { object_names: string[] }) => {
      return new Promise((Resolve_: (_: ObjectsAttributes) => void, Reject_: (_: Error) => void) => {
        window.Visualforce.remoting.Manager.invokeAction(
          keys.GET_OBJECTS_ATTRIBUTES,
          object_names,
          (result: ObjectsAttributes, event) => {
            if (!event.status) {
              Reject_(new Error(event.message))
              return
            }

            Resolve_(result)
          },
          { escape: false, buffer: false },
        )
      })
    },
  }
}
