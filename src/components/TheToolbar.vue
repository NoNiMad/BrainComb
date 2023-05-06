<script setup>
import { ref } from "vue";
import { mdiBrain, mdiFolderOpen, mdiContentSave } from "@mdi/js";
import { documentService } from "../lib/services";

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
	<nav id="toolbar">
		<ul>
			<li>
				<div class="text-with-icons">
					<svg-icon type="mdi" :path="mdiBrain"></svg-icon>
					SimpleMind
				</div>
				<input class="hide" ref="fileInput" type="file" @change="onFileInputChanged($event)" />
			</li>
		</ul>
		<ul>
			<li>
				<button @click="openFile()">
					<div class="text-with-icons">
						<svg-icon type="mdi" :path="mdiFolderOpen"></svg-icon>
						Open
					</div>
				</button>
			</li>
			<li>
				<button @click="saveFile()">
					<div class="text-with-icons">
						<svg-icon type="mdi" :path="mdiContentSave"></svg-icon>
						Download
					</div>
					<a class="hide" ref="downloadLink"></a>
				</button>
			</li>
		</ul>
	</nav>
</template>

<style scoped>
#toolbar
{
	display: flex;
	margin: 0;
	padding: 0;

	background-color: var(--color-bg-alt);
}

#toolbar ul
{
	display: flex;
	align-items: center;
	gap: 0.3em;
	margin: 0;
	padding: 0.4em;

	list-style-type: none;
}

#toolbar li
{
	margin: 0;
	padding: 0;
}

#toolbar button
{
	padding: 0.5em;
	
	border: none;
	outline: none;
	background-color: var(--color-bg);
	color: var(--color-text);
}

#toolbar button:hover
{
	filter: brightness(120%);
}

.hide
{
	display: none;
}
</style>