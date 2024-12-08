<script setup>
import { ref } from "vue";
import { mdiBrain, mdiFolderOpen, mdiContentSave } from "@mdi/js";
import { documentService } from "../lib/services";
import IconButton from "./IconButton.vue";

const props = defineProps([ "document" ]);

const fileInput = ref(null);
function openFile()
{
	fileInput.value.click();
}
function onFileInputChanged(event)
{
	const file = event.target.files[0];
	documentService.loadFromFile(file);
}

const downloadLink = ref(null);
function saveFile()
{
	downloadLink.value.href = documentService.getDownloadUrl(props.document);
	downloadLink.value.download = documentService.getDownloadName();
	downloadLink.value.click();
}

</script>

<template>
	<nav class="bg-bg-alt flex gap-1 p-2 items-center">
		<SvgIcon :path="mdiBrain"></SvgIcon>
		<div>BrainComb</div>

		<div class="m-2 h-full border-l-4 border-bg border-dotted"></div>

		<IconButton
			@click="openFile()"
			:icon="mdiFolderOpen"
			text="Open"
			:icon-only="true">
		</IconButton>
		<IconButton
			@click="saveFile()"
			:icon="mdiContentSave"
			text="Download"
			:icon-only="true">
		</IconButton>

		<input class="hidden" ref="fileInput" type="file" @change="onFileInputChanged($event)" />
		<a class="hidden" ref="downloadLink"></a>
	</nav>
</template>