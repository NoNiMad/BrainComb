<script setup>
import { ref } from "vue";
import { mdiBrain, mdiFolderOpen, mdiTrayArrowDown, mdiFilePlusOutline } from "@mdi/js";
import { fileService } from "../lib/services";

const { workspace } = defineProps([ "workspace" ]);

function newFile()
{
	workspace.newDocument();
}

const fileInput = ref(null);
function openFile()
{
	fileInput.value.click();
}
function onFileInputChanged(event)
{
	const file = event.target.files[0];
	fileService.loadFromFile(file);
}

function downloadAll()
{
	console.log("Not implemeted.");
}

</script>

<template>
	<nav>
		<input ref="fileInput" type="file" @change="onFileInputChanged($event)" />
		<ul>
			<li>
				<div class="text-with-icons">
					<svg-icon :path="mdiBrain"></svg-icon>
					SimpleMind
				</div>
			</li>
		</ul>
		<ul>
			<li>
				<button @click="newFile()">
					<div class="text-with-icons">
						<svg-icon :path="mdiFilePlusOutline"></svg-icon>
						New
					</div>
				</button>
			</li>
			<li>
				<button @click="openFile()">
					<div class="text-with-icons">
						<svg-icon :path="mdiFolderOpen"></svg-icon>
						Open
					</div>
				</button>
			</li>
			<li>
				<button @click="downloadAll()">
					<div class="text-with-icons">
						<svg-icon :path="mdiTrayArrowDown"></svg-icon>
						Download All
					</div>
				</button>
			</li>
		</ul>
	</nav>
</template>

<style scoped>
nav
{
	display: flex;
	margin: 0;
	padding: 0;

	background-color: var(--color-bg-alt);
}

ul
{
	display: flex;
	align-items: center;
	gap: 0.3em;
	margin: 0;
	padding: 0.4em;

	list-style-type: none;
}

li
{
	margin: 0;
	padding: 0;
}

button
{
	padding: 0.5em;
	
	border: none;
	outline: none;
	background-color: var(--color-bg);
	color: var(--color-text);
}

button:hover
{
	filter: brightness(120%);
}

input[type="file"]
{
	display: none;
}
</style>