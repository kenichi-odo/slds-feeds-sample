import { Getters, Mutations, module, Actions } from 'sinai'
import UUID from 'uuid/v4'

type Label = { id: string; text: string }

class state {
  labels: Label[] = []
}

class getters extends Getters<state>() {}

class mutations extends Mutations<state>() {
  addLabel(_: Label) {
    this.state.labels.push(_)
  }

  removeLabel({ id }: { id: string }) {
    this.state.labels = this.state.labels.filter(_ => _.id !== id)
  }
}

class actions extends Actions<state, getters, mutations>() {
  async show({ text }: { text: string }) {
    const id = UUID()
    this.mutations.addLabel({ id, text })
    setTimeout(() => this.mutations.removeLabel({ id }), 800 * 5)
  }
}

export default module({ state, getters, mutations, actions })
