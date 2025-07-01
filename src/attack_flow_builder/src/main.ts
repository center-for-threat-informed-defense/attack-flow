
import App from "./App.vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/assets/fonts/inter.css";
import "@/assets/fonts/jetbrains_mono.css";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
