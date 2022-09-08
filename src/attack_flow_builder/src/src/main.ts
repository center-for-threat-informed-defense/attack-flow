import App from './App.vue'
import store from './store'
import { createApp } from 'vue'
import "@/assets/fonts/inter.css"

createApp(App).use(store).mount('#app')
