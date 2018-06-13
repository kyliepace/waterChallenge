import Vue from 'vue'
import App from './App'
import axios from 'axios'

Vue.config.productionTip = false
Vue.use(axios)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
