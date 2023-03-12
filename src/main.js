// External dependencies
import { createApp } from "vue";
import "@jamescoyle/svg-icon";
import { mdiFolderOpen, mdiContentSave, mdiBrain } from "@mdi/js";

// Local dependencies
import services from "./lib/services";
import commands from "./lib/commands";

import "./style.css";
import App from "./App.vue";

const app = createApp(App);

app.provide("services", services);
app.provide("commands", commands);

app.provide("icons", {
	"folderOpen": mdiFolderOpen,
	"contentSave": mdiContentSave,
	"brain": mdiBrain
});

app.mount('#app-container');
