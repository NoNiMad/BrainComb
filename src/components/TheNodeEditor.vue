<script setup>
import { reactive, computed, ref, nextTick } from "vue";

const props = defineProps([ "targetNode", "settings" ]);
const emit = defineEmits([ "closed" ]);

const inputField = ref(null);
const editionState = reactive({
	name: ""
});

const view = computed(() => {
	return {
		x: props.targetNode?.x ?? 0,
		y: (props.targetNode?.y ?? 0) - props.settings.leaveHeight / 4
	};
});

function show()
{
	editionState.name = props.targetNode.name;
	nextTick(() => {
		inputField.value.focus();
		inputField.value.select();
	});
}

function onNodeInputCancel(event)
{
	event?.preventDefault();
	event?.stopPropagation();

	emit("closed");
}

function onNodeInputValidate(event)
{
	event?.preventDefault();
	event?.stopPropagation();

	const newName = editionState.name.trim();
	if (newName !== "")
	{
		props.targetNode.name = editionState.name;
		emit("closed");
	}
}

defineExpose({
	show
});
</script>

<template>
	<foreignObject
		:x="view.x"
		:y="view.y"
		:width="300"
		:height="props.settings.leaveHeight / 2">
		<input
			id="map-input"
			ref="inputField"
			type="text"
			v-model="editionState.name"
			@keypress.enter="onNodeInputValidate($event)"
			@keydown.esc="onNodeInputCancel($event)" />
	</foreignObject>
</template>

<style scoped>
#map-input
{
	margin: 0;
	padding: 0;
	width: calc(100% - 8px);
	height: calc(100% - 6px);

	border: 1px solid black;
	outline: none;
}
</style>