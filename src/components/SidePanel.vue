<script setup>
const props = defineProps([ "title" ]);
</script>

<template>
<section class="p-4 rounded bg-bg-alt opacity-50 transition-opacity duration-200 hover:opacity-100">
	<header v-if="props.title" class="text-2xl mb-4">{{ props.title }}</header>
	<slot></slot>
</section>
</template>