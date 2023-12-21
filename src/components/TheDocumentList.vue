<script setup>
import { computed } from "vue";
import DocumentListItem from "./DocumentListItem.vue";

const { workspace } = defineProps([ "workspace" ]);

const sortedDocuments = computed(() => {
	return workspace.documents.sort((a, b) => a.name.localeCompare(b.name));
});

</script>

<template>
	<section>
		<header>Documents</header>
		<DocumentListItem
			v-for="document in sortedDocuments"
			:key="document.name"
			@click="workspace.setCurrentDocument(document)"
			:document="document"
			@close="workspace.closeDocument(document)"
			@download="workspace.downloadDocument(document)" />
	</section>
</template>