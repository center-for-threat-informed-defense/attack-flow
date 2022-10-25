import App from './App.vue'
import store from './store'
import { createApp } from 'vue'
import "@/assets/fonts/inter.css"
import "@/assets/fonts/roboto_mono.css"

createApp(App).use(store).mount('#app')
