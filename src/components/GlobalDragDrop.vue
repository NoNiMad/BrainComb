<script>

export default
{
	inject: [ "services" ],
	data()
	{
		return {
			isOccuring: false
		};
	},
	created()
	{
		let dragTarget;
		document.addEventListener("dragenter", event => {
			event.stopPropagation();
			event.preventDefault();

			dragTarget = event.target;
			
			this.isOccuring = true;
			return false;
		});

		document.addEventListener("dragleave", event => {
			if (event.target == dragTarget)
			{
				event.stopPropagation();
				event.preventDefault();
				this.isOccuring = false;
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

			this.isOccuring = false;

			const filesArray = event.dataTransfer.files;
			if (filesArray.length == 0)
				return false;
			
			this.services.DocumentService.loadFromFile(filesArray[0]);
			return false;
		});
	}
}
</script>

<template>
	<div id="global-drag-drop" v-show="isOccuring">
		<div>
			Drop your document to load it
		</div>
	</div>
</template>

<style>
#global-drag-drop
{
	z-index: 1000;

	position: absolute;
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;

	background-color: var(--color-bg);
	filter: opacity(80%);
}

#global-drag-drop > div
{
	padding: 1em;

	border: 1px solid black;
	border-radius: 1em;

	background-color: var(--color-bg-alt);
}
</style>