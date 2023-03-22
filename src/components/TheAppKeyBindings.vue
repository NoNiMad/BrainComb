<script setup>
import { inject } from "vue";

const services = inject("services");

const props = defineProps([ "ignoreBindings" ]);

document.addEventListener("keydown", event => {
	if (event.defaultPrevented || event.isComposing || props.ignoreBindings)
		return;
	
	const binding = services.KeyBindingsService.getBinding(event.key, {
		ctrl: event.ctrlKey,
		alt: event.altKey,
		shift: event.shiftKey
	});

	if (binding == null || !binding.action())
		return;

	event.preventDefault()
	event.stopPropagation();
	return false;
});
</script>

<template>
</template>

<style>
</style>