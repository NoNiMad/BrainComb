<script setup>
import { ref, computed, watch, nextTick } from "vue";

import TheNodeEditor from "./TheNodeEditor.vue";

import { Command } from "../lib/Command";
import { KeyBinding } from "../lib/KeyBinding";
import { simpleLayout } from "../lib/LayoutAlgo";
import * as NavigationController from "../lib/NavigationController";
import { flatten } from "../lib/NodeHelpers";

const svgEl = ref(null);
const props = defineProps([ "document", "settings" ]);

watch(() => props.document, () => {
	scheduleAutoLayout();
});

//#region Mindmap View

import { useViewBox } from "../composables/viewBox";
const { view, viewBox } = useViewBox(svgEl);

//#endregion

const selectedNode = computed(() => props.document?.selected);
const commands = ref({
	editNode: new Command(() => startEditingNode(), () => !isEditingNode.value),
	collapseNode: new Command(() => collapseNode(selectedNode.value), () => selectedNode.value.children.length > 0),
	deleteNode: new Command(() => deleteNode(selectedNode.value), () => selectedNode.value.parent != null),
	
	selectUp: new Command(() => trySelect(NavigationController.getNodeUp(props.document, selectedNode.value))),
	selectDown: new Command(() => trySelect(NavigationController.getNodeDown(props.document, selectedNode.value))),
	selectLeft: new Command(() => trySelect(NavigationController.getNodeLeft(props.document, selectedNode.value))),
	selectRight: new Command(() => trySelect(NavigationController.getNodeRight(props.document, selectedNode.value))),
	
	moveUp: new Command(
		() => moveNode(selectedNode.value,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value) - 1),
		() => canMoveNode(selectedNode.value,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value) - 1),
	),
	moveDown: new Command(
		() => moveNode(selectedNode.value,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value) + 1),
		() => canMoveNode(selectedNode.value,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value) + 1),
	),
	addBefore: new Command(
		() => {
			const newNode = props.document.createNode();
			insertChild(newNode,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value))
			trySelect(newNode);
		},
		() => selectedNode.value.parent !== null
	),
	addAfter: new Command(
		() => {
			const newNode = props.document.createNode();
			insertChild(newNode,
				selectedNode.value.parent,
				selectedNode.value.parent.children.indexOf(selectedNode.value) + 1)
			trySelect(newNode);
		},
		() => selectedNode.value.parent !== null
	),
	addChild: new Command(() => {
		const newNode = props.document.createNode();
		insertChild(newNode, selectedNode.value);
		trySelect(newNode);
	}),
});

const bindings = ref([
	new KeyBinding("Edit node", "Enter", {}, commands.value.editNode),
	new KeyBinding("Collapse node", "c", {}, commands.value.collapseNode),
	new KeyBinding("Remove node", "Delete", {}, commands.value.deleteNode),
	new KeyBinding("Select up", "ArrowUp", {}, commands.value.selectUp),
	new KeyBinding("Select down", "ArrowDown", {}, commands.value.selectDown),
	new KeyBinding("Select left", "ArrowLeft", {}, commands.value.selectLeft),
	new KeyBinding("Select right", "ArrowRight", {}, commands.value.selectRight),
	new KeyBinding("Move up", "ArrowUp", { alt: true }, commands.value.moveUp),
	new KeyBinding("Move down", "ArrowDown", { alt: true }, commands.value.moveDown),
	new KeyBinding("Add sibling before", "ArrowUp", { shift: true }, commands.value.addBefore),
	new KeyBinding("Add sibling after", "ArrowDown", { shift: true }, commands.value.addAfter),
	new KeyBinding("Add child", "ArrowRight", { shift: true }, commands.value.addChild)
]);

defineExpose({ view, bindings });

let autoLayoutScheduled = false;
function scheduleAutoLayout()
{
	if (autoLayoutScheduled || props.document == null)
		return;

	autoLayoutScheduled = true;
	nextTick(() => {
		autoLayoutScheduled = false;
		simpleLayout(props.document, props.settings)
	});
};

//#region Edition

const nodeEditor = ref(null);
const isEditingNode = ref(false);

function startEditingNode()
{
	if (props.document == null)
		return;

	nodeEditor.value.show();
	isEditingNode.value = true;
}

function onNodeEditorClosed()
{
	if (props.document == null)
		return;

	isEditingNode.value = false;
	svgEl.value.focus();
	scheduleAutoLayout();
}

function trySelect(node)
{
	if (node == null || props.document == null)
		return;

	if (isEditingNode.value)
	{
		onNodeEditorClosed();
	}
	
	props.document.selected = node;
}

function insertChild(child, parent, index)
{
	if (!canInsertChild(child, parent, index))
		throw new Error(`Cannot insert "${child.content}" in "${parent.content}" at index ${index}.`);

	child.parent = parent;
	parent.children.splice(index ?? parent.children.length, 0, child);
	scheduleAutoLayout();
}

function canInsertChild(child, parent, index)
{
	return index == undefined || index >= 0 && index <= parent.children.length;
}

function moveNode(node, targetParent, index)
{
	if (!canMoveNode(node, targetParent, index))
		throw new Error(`Cannot move "${child.content}" to "${parent.content}" at index ${index}.`);
	
	const currentIndex = node.parent.children.indexOf(node);
	node.parent.children.splice(currentIndex, 1);
	insertChild(node, targetParent, index);
	scheduleAutoLayout();
}

function canMoveNode(node, targetParent, index)
{
	if (node.parent === null)
		return false;
	
	if (node.parent == targetParent)
		return index >= 0 && index < targetParent.children.length;

	return canInsertChild(node, targetParent, index);
}

function collapseNode(node)
{
	if (node.children.length == 0)
		return false;

	node.collapsed = !node.collapsed;
	scheduleAutoLayout();
}

function deleteNode(node)
{	
	const parentChildren = node.parent.children;
	const indexInParent = parentChildren.indexOf(node);
	parentChildren.splice(indexInParent, 1);

	if (parentChildren.length > 0)
	{
		trySelect(parentChildren[Math.max(0, indexInParent - 1)]);
	}
	else
	{
		trySelect(selectedNode.value.parent);
	}
	scheduleAutoLayout();
}

//#endregion

const svgNodes = ref([]);
function getSVGNode(node)
{
	return svgNodes.value.find(svgNode => svgNode.getAttribute("data-node") == node.id);
}

const nodesToDraw = computed(() =>
{
	if (props.document === null)
		return [];
	return flatten(props.document.root);
});
const connectionsToDraw = computed(() =>
{
	function gatherConnections(node)
	{
		if (node.children.length === 0 || node.collapsed)
			return [];
		
		const svgNode = getSVGNode(node);
		const nodeWidth = svgNode?.getBBox().width ?? -10;

		const connections = [];
		node.children.forEach((child, i) =>
		{
			const xOffset = 5;
			const yOffset = -5;
			const connection = {
				id: `node-${node.id}-${i}`,
				startX: node.x + nodeWidth + xOffset,
				startY: node.y + yOffset,
				endX: child.x - xOffset,
				endY: child.y + yOffset
			};
			connection.distX = connection.endX - connection.startX;
			connection.distY = connection.endY - connection.startY;

			connection.path =
				`M
					${connection.startX} ${connection.startY}
				C
					${connection.startX + connection.distX / 2} ${connection.startY},
					${connection.endX - connection.distX / 2} ${connection.endY},
					${connection.endX} ${connection.endY}`;

			connections.push(connection, ...gatherConnections(child));
		});
		return connections;
	}

	if (props.document === null)
		return [];
	return gatherConnections(props.document.root);
});
</script>

<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		id="mindmap"
		ref="svgEl"
		:view-box.camel="viewBox">
		<g
			v-for="node in nodesToDraw"
			:key="node.id"
			ref="svgNodes"

			@click.left="trySelect(node)"

			:transform="`translate(${node.x}, ${node.y})`"

			:data-node="node.id"
			class="node"
			:class="{ selected: props.document?.selected === node, collapsed: node.collapsed }">
			<text :alt="node.content">{{node.name}}</text>
		</g>
		<g
			v-for="conn in connectionsToDraw"
			:key="conn.id"
			class="connection">
			<path
				:d="conn.path"
				stroke="white"
				fill="transparent" />
		</g>
		<TheNodeEditor
			ref="nodeEditor"
			v-show="isEditingNode"
			:targetNode="props.document?.selected"
			:settings="props.settings"
			@closed="onNodeEditorClosed"/>
	</svg>
</template>

<style scoped>
#mindmap
{
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}

#mindmap:focus
{
	border: none;
}

#mindmap .node
{
	fill: var(--color-text);
	position: relative;
}

#mindmap .node.selected
{
	font-weight: bold;
}

#mindmap .node.collapsed
{
	font-style: italic;
}

#mindmap .connection
{
	stroke: var(--color-text);
	fill: transparent;
}
</style>