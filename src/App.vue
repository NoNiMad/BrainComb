<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { mdiMagnify } from "@mdi/js";

import TheMindMap from "./components/TheMindMap.vue";
import TheFileDragDrop from "./components/TheFileDragDrop.vue";
import TheToolbar from "./components/TheToolbar.vue";
import TheDocumentList from "./components/TheDocumentList.vue";
import KeyBindingsListener from "./components/KeyBindingsListener.vue";

import { Workspace } from "./lib/Workspace";
import { fileService } from "./lib/services";

const mindmap = ref(null);
const mindmapBindings = computed(() => mindmap.value?.bindings);

const data = reactive({
	settings:
	{
		leaveHeight: 60,
		horizontalSpace: 70
	},
	ui:
	{
		globalDragDrop: false
	}
});

const workspace = ref(new Workspace());

onMounted(() =>
{
	fileService.addEventListener("documentLoaded", onDocumentLoaded);
	fileService.addEventListener("downloadRequested", onDownloadRequested);
});

function onDocumentLoaded(event)
{
	const newDocument = event.detail;
	workspace.value.documents.push(newDocument);
	workspace.value.setCurrentDocument(newDocument);
}

const downloadLink = ref(null);
function onDownloadRequested(event)
{
	downloadLink.value.href = event.detail.url;
	downloadLink.value.download = event.detail.filename;
	downloadLink.value.click();
}

const showZoom = computed(() => {
	if (mindmap.value == null)
		return false;
	return Math.round(mindmap.value.view.zoom * 100) != 100
});
const zoomText = computed(() => {
	if (mindmap.value == null)
		return false;
	const percentage = Math.round(mindmap.value.view.zoom * 100);
	return `${percentage}%`;
});
</script>

<template>
	<div id="app">
		<a id="download-link" ref="downloadLink"></a>
		<TheFileDragDrop />
		<TheToolbar :workspace="workspace" />
		<div id="mindmap-container">
			<!--
			<div
				id="mindmap-background"
				:style="{
					backgroundPositionX: `${-mindmap.view.center.x * mindmap.view.zoom}px`,
					backgroundPositionY: `${-mindmap.view.center.y * mindmap.view.zoom}px`,
					backgroundSize: `${mindmap.view.zoom*100}px ${mindmap.view.zoom*100}px, ${mindmap.view.zoom*20}px ${view.zoom*20}px`
				}">
			</div>
			-->
			<aside class="left-side-panels">
				<TheDocumentList :workspace="workspace" />
				<KeyBindingsListener :bindings="mindmapBindings" />
			</aside>
			<aside class="right-side-panels">
				<section v-show="showZoom">
					<article class="text-with-icons">
						{{ zoomText }}
						<svg-icon :path="mdiMagnify"></svg-icon>
					</article>
				</section>
			</aside>
			<TheMindMap
				tabindex="0"
				ref="mindmap"
				:document="workspace.currentDocument"
				:settings="data.settings" />
		</div>
	</div>
</template>

<style scoped>
#app
{
	position: relative;
	display: flex;
	flex-direction: column;
}

#download-link
{
	display: none;
}

#mindmap-container
{
	position: relative;
	flex-grow: 1;
}

#mindmap-background
{
	width: 100%;
	height: 100%;
	background-image:
		conic-gradient(at calc(100% - 2px) calc(100% - 2px),#555 270deg, #0000 0),
		conic-gradient(at calc(100% - 1px) calc(100% - 1px),#444 270deg, #0000 0);
	background-size: 100px 100px, 20px 20px;
}

#mindmap-container > *
{
	position: absolute;
	overflow: hidden;
}
</style>
