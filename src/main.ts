import "./style/var";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/main.scss";
import { runtimeConfig } from "./config/runtimeConfig";
import { wagmiConfig } from "./config/wagmiConfig";
import { WagmiPlugin } from "@wagmi/vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

if (typeof document !== "undefined") {
  document.title = runtimeConfig.appTitle || "Hero Path";
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(WagmiPlugin, { config: wagmiConfig });
app.use(VueQueryPlugin, {});

app.mount("#app");
