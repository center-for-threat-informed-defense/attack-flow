import App from './App.vue'
import store from './store'
import { createApp } from 'vue'
import "@/assets/fonts/inter.css"

function isTouchEnabled() {
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0);
}

if (isTouchEnabled()) {
    alert("This application does not support touch screens.");
}

createApp(App).use(store).mount('#app')
