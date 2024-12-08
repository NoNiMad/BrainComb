<script setup>
import { ref } from "vue";
import { documentService } from "../lib/services";

const isDrapDropActive = ref(false);

let dragTarget;
document.addEventListener("dragenter", event => {
	event.stopPropagation();
	event.preventDefault();

	dragTarget = event.target;
	
	isDrapDropActive.value = true;
	return false;
});

document.addEventListener("dragleave", event => {
	if (event.target == dragTarget)
	{
		event.stopPropagation();
		event.preventDefault();
		isDrapDropActive.value = false;
	}
	return false;
});

document.addEventListener("dragover", event => {
	event.stopPropagation();
	event.preventDefault();
	return false;
});

document.addEventListener("drop", event => {
	event.stopPropagation();
	event.preventDefault();

	isDrapDropActive.value = false;

	const filesArray = event.dataTransfer.files;
	if (filesArray.length == 0)
		return false;
	
	documentService.loadFromFile(filesArray[0]);
	return false;
});
</script>

<template>
	<div id="global-drag-drop"
		class="z-50 absolute w-full h-full flex justify-center items-center text-center backdrop-blur-sm"
		v-show="isDrapDropActive">
		<div class="p-4 rounded bg-bg-alt">
			Drop your document to load it
		</div>
	</div>
</template>