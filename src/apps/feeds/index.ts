import Vue from 'vue'

import Index from './pages/index.vue'
import { RemotingKeys } from './assets/remotings'
import { Store } from './store'

Vue.config.productionTip = false
Vue.config.errorHandler = _ => console.error(_)

export const InitFeeds = ({ login_user_id, remoting_keys }: { login_user_id: string; remoting_keys: RemotingKeys }) =>
  new Vue({
    el: '#app',
    render: _ => _(Index),
    store: Store({ login_user_id, remoting_keys }),
  })
