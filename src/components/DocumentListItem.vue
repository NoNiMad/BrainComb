<script setup>
import { ref } from "vue";
import { mdiPencil, mdiClose, mdiCheck, mdiTrayArrowDown } from "@mdi/js";

const { document } = defineProps([ "document" ])

const isEditing = ref(false)
const editingName = ref("");

function startEditing()
{
	editingName.value = document.name;
	isEditing.value = true;
}

function finishEditing()
{
	document.name = editingName.value;
	isEditing.value = false;
}

function cancelEditing()
{
	isEditing.value = false;
}

</script>

<template>
	<article>
		<template v-if="!isEditing">
			<div>{{ document.name }}</div>
			<svg-icon :path="mdiPencil" @click="startEditing()"></svg-icon>
			<svg-icon :path="mdiTrayArrowDown" @click="$emit('download')"></svg-icon>
			<svg-icon :path="mdiClose" @click="$emit('close')"></svg-icon>
		</template>
		<template v-else>
			<input type="text" v-model="editingName" @keypress.enter="finishEditing()" />
			<svg-icon :path="mdiCheck" @click="finishEditing()"></svg-icon>
			<svg-icon :path="mdiClose" @click="cancelEditing()"></svg-icon>
		</template>
	</article>
</template>

<style scoped>
article
{
	display: flex;
}

article div, article input
{
	flex-grow: 2;
}

article svg-icon
{
	cursor: pointer;
}
</style>