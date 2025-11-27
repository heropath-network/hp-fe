import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.scss'
import { runtimeConfig } from './config/runtimeConfig'

if (typeof document !== 'undefined') {
  document.title = runtimeConfig.appTitle || 'HP FE Demo'
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
