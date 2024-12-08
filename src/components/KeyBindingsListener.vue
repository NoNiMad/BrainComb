<script setup>
import { mdiArrowUpThin, mdiArrowDownThin, mdiArrowLeftThin, mdiArrowRightThin } from "@mdi/js";
import { computed } from "vue";

import SidePanel from "./SidePanel.vue";

const props = defineProps([ "bindings", "disabled" ]);

document.addEventListener("keydown", event => {
	if (event.defaultPrevented || event.isComposing || props.disabled)
		return;
	
	console.log("prout");
	const binding = findBinding(event.key, {
		ctrl: event.ctrlKey,
		alt: event.altKey,
		shift: event.shiftKey
	});
	if (binding == null)
		return;
	
	if (binding.command.canExecute())
	{
		binding.command.execute();
	}
	
	event.preventDefault()
	event.stopPropagation();
	return false;
});

function findBinding(key, modifiers)
{
	for (const binding of props.bindings)
	{
		if (binding.matches(key, modifiers))
		{
			return binding;
		}
	}
	return null;
}

function shouldDisplayKeyName(key)
{
	var charCode = key.charCodeAt(key);
	return charCode >= 97 && charCode <= 122 // a-z
		|| iconKeyMap[key] === undefined; // No icon
}

const iconKeyMap = {
	"ArrowUp": mdiArrowUpThin,
	"ArrowDown": mdiArrowDownThin,
	"ArrowLeft": mdiArrowLeftThin,
	"ArrowRight": mdiArrowRightThin
};
function getIconPathFor(key)
{
	return iconKeyMap[key];
}

const bindingsWithCanExecute = computed(() => props.bindings.map(b => {
		return {
			value: b,
			canExecute: b.command.canExecute()
		};
	}));
</script>

<template>
<SidePanel title="Shortcuts">
	<article
		v-for="binding in bindingsWithCanExecute"
		class="my-1 flex gap-1 items-center"
		:class="{ 'opacity-50': !binding.canExecute }"
		:key="binding.value.name">
		<div class="bg-bg py-0.5 px-1" v-if="binding.value.ctrl">Ctrl</div>
		<div class="bg-bg py-0.5 px-1" v-if="binding.value.alt">Alt</div>
		<div class="bg-bg py-0.5 px-1" v-if="binding.value.shift">Shift</div>
		<div class="bg-bg py-0.5 px-1" v-if="shouldDisplayKeyName(binding.value.key)">{{ binding.value.key }}</div>
		<div class="bg-bg py-0.5 px-1" v-else>
			<SvgIcon :path="getIconPathFor(binding.value.key)"></SvgIcon>
		</div>
		<div>{{ binding.value.name }}</div>
	</article>
</SidePanel>
</template>