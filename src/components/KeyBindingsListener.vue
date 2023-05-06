<script setup>
import { mdiArrowUpThin, mdiArrowDownThin, mdiArrowLeftThin, mdiArrowRightThin } from "@mdi/js";

const props = defineProps([ "bindings", "disabled" ]);

document.addEventListener("keydown", event => {
	if (event.defaultPrevented || event.isComposing || props.disabled)
		return;
	
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
</script>

<template>
<section
	id="key-bindings-panel"
	:class="{ disabled: props.disabled }">
	<header>Shortcuts</header>
	<article
		class="key-binding"
		v-for="binding in props.bindings"
		:key="binding.name">
		<div class="key" v-if="binding.ctrl">Ctrl</div>
		<div class="key" v-if="binding.alt">Alt</div>
		<div class="key" v-if="binding.shift">Shift</div>
		<div class="key" v-if="shouldDisplayKeyName(binding.key)">{{ binding.key }}</div>
		<div class="key" v-else>
			<svg-icon type="mdi" :path="getIconPathFor(binding.key)"></svg-icon>
		</div>
		<div>{{ binding.name }}</div>
	</article>
</section>
</template>

<style scoped>
section.disabled .key-binding
{
	opacity: 0.5;
}

.key-binding
{
	margin: 0.2em 0;

	display: flex;
	gap: 0.2em;
	align-items: center;
}

.key-binding > *
{
	height: 24px;
	line-height: 24px;
}

.key
{
	background-color: var(--color-bg);
	padding: 0.1em 0.3em;
}
</style>