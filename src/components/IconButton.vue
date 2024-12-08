<script setup>
import { computed } from "vue";

const props = defineProps({
	icon: {
		type: String,
		default: ""
	},
	text: {
		type: String,
		default: null
	},
	iconOnly: {
		type: Boolean,
		default: false
	}
});

const hasText = computed(() => !props.iconOnly && !(!props.text || props.text.length === 0));

</script>

<template>
	<button class="flex gap-1 p-1 bg-bg" :title="props.text">
		<SvgIcon :path="props.icon"></SvgIcon>
		<span v-if="hasText">{{ text }}</span>
	</button>
</template>