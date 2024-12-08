// External dependencies
import { createApp } from "vue";

import "./style.css";
import App from "./App.vue";

import SvgIcon from "./components/SvgIcon.vue";

const app = createApp(App);
app.component("SvgIcon", SvgIcon);
app.mount('#app-container');
