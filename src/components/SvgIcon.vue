<script setup>
import { computed } from "vue";

const props = defineProps({
	path: {
		type: String,
		default: ""
	},
	size: {
		type: String,
		default: "24"
	},
	viewbox: {
		type: String,
		default: "0 0 24 24"
	},
	flip: {
		type: String,
		default: ""
	},
	rotate: {
		type: String,
		default: "0deg"
	},
});

const flipDirections = computed(() =>
{
	const flip = props.flip.toLowerCase();
	return {
		x: [ "both", "horizontal" ].includes(flip) ? "-1" : "1",
		y: [ "both", "vertical" ].includes(flip) ? "-1" : "1",
	};
});

const svgStyles = computed(() => ({
	transform: `rotate(${props.rotate}) scale(${flipDirections.value.x}, ${flipDirections.value.y})`,
}));
</script>

<template>
	<svg :width="size" :height="size" :viewBox="viewbox" :style="svgStyles">
		<path class="fill-current" :d="path" />
	</svg>
</template>

<style scoped>
</style>