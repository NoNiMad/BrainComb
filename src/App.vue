<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { mdiMagnify } from "@mdi/js";
import TheFileDragDrop from "./components/TheFileDragDrop.vue";
import TheToolbar from "./components/TheToolbar.vue";
import TheNodeEditor from "./components/TheNodeEditor.vue";
import KeyBindingsListener from "./components/KeyBindingsListener.vue";

import { Command } from "./lib/Command";
import { KeyBinding } from "./lib/KeyBinding";

import { simpleLayout } from "./lib/LayoutAlgo";
import { flatten } from "./lib/NodeHelpers";

import * as NavigationController from "./lib/NavigationController";

import { documentService } from "./lib/services";

const appContainer = ref(null);
const mindmapContainer = ref(null);

let nodeIdCounter = 0;
let autoLayoutScheduled = false;
const defaultMap = makeNode("Root", [
	makeNode("Gameplay", [
		makeNode("Levels"),
		makeNode("Craft")
	]),
	makeNode("Story", [
		makeNode("Introduction", [
			makeNode("Cavern"),
			makeNode("Solitude")
		]),
		makeNode("Reveal of the big city"),
		makeNode("Battle"),
		makeNode("Conclusion")
	])
]);

const svgNodes = ref([]);
function getSVGNode(node)
{
	return svgNodes.value.find(svgNode => svgNode.getAttribute("data-node") == node.id);
}

const data = reactive({
	mapRoot: defaultMap,
	settings:
	{
		leaveHeight: 60,
		horizontalSpace: 70
	},
	ui:
	{
		globalDragDrop: false
	}
});

onMounted(() =>
{
	documentService.addEventListener("fileLoaded", onFileLoaded);
	scheduleAutoLayout();
	select(data.mapRoot);
});

function onFileLoaded(event)
{
	loadFromText(event.detail);
}

//#region Mindmap View

const mindmap = ref(null);
import { useViewBox } from "./composables/viewBox.js";
const { view, viewBox } = useViewBox(mindmap);
const showZoom = computed(() => Math.round(view.zoom * 100) != 100);
const zoomText = computed(() => {
	const percentage = Math.round(view.zoom * 100);
	return `${percentage}%`;
});

//#endregion

const commands = reactive({
	editNode: new Command(() => edition.isEditingNode = true, () => !edition.isEditingNode),
	collapseNode: new Command(() => collapseNode(edition.selected), () => edition.selected.children.length > 0),
	deleteNode: new Command(() => deleteNode(edition.selected), () => edition.selected.parent != null),
	
	selectUp: new Command(() => select(NavigationController.getNodeUp(data.mapRoot, edition.selected))),
	selectDown: new Command(() => select(NavigationController.getNodeDown(data.mapRoot, edition.selected))),
	selectLeft: new Command(() => select(NavigationController.getNodeLeft(data.mapRoot, edition.selected))),
	selectRight: new Command(() => select(NavigationController.getNodeRight(data.mapRoot, edition.selected))),
	
	moveUp: new Command(
		() => moveNode(edition.selected,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected) - 1),
		() => canMoveNode(edition.selected,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected) - 1),
	),
	moveDown: new Command(
		() => moveNode(edition.selected,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected) + 1),
		() => canMoveNode(edition.selected,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected) + 1),
	),
	addBefore: new Command(
		() => {
			const newNode = makeNode();
			insertChild(newNode,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected))
			select(newNode);
		},
		() => edition.selected.parent !== null
	),
	addAfter: new Command(
		() => {
			const newNode = makeNode();
			insertChild(newNode,
				edition.selected.parent,
				edition.selected.parent.children.indexOf(edition.selected) + 1)
			select(newNode);
		},
		() => edition.selected.parent !== null
	),
	addChild: new Command(() => {
		const newNode = makeNode();
		insertChild(newNode, edition.selected);
		select(newNode);
	}),
});

const bindings = reactive([
	new KeyBinding("Edit node", "Enter", {}, commands.editNode),
	new KeyBinding("Collapse node", "c", {}, commands.collapseNode),
	new KeyBinding("Remove node", "Delete", {}, commands.deleteNode),
	new KeyBinding("Select up", "ArrowUp", {}, commands.selectUp),
	new KeyBinding("Select down", "ArrowDown", {}, commands.selectDown),
	new KeyBinding("Select left", "ArrowLeft", {}, commands.selectLeft),
	new KeyBinding("Select right", "ArrowRight", {}, commands.selectRight),
	new KeyBinding("Move up", "ArrowUp", { alt: true }, commands.moveUp),
	new KeyBinding("Move down", "ArrowDown", { alt: true }, commands.moveDown),
	new KeyBinding("Add sibling before", "ArrowUp", { shift: true }, commands.addBefore),
	new KeyBinding("Add sibling after", "ArrowDown", { shift: true }, commands.addAfter),
	new KeyBinding("Add child", "ArrowRight", { shift: true }, commands.addChild)
]);

function scheduleAutoLayout()
{
	if (autoLayoutScheduled)
		return;

	autoLayoutScheduled = true;
	nextTick(() => {
		autoLayoutScheduled = false;
		simpleLayout(data.mapRoot, data.settings, getSVGNode)
	});
};
function loadFromText(text)
{
	try
	{
		const parsed = JSON.parse(text);
		function processNode(node, parent)
		{
			node.parent = parent;
			node.x = 0;
			node.y = 0;
			node.collapsed = node.collapsed ?? false;
			nodeIdCounter = Math.max(nodeIdCounter, node.id + 1);
			
			if (node.children === undefined)
			{
				node.children = [];
			}
			else
			{
				node.children.forEach(child => processNode(child, node));
			}
		}
		processNode(parsed, null);
		data.mapRoot = parsed;
		select(data.mapRoot);
		scheduleAutoLayout();
	}
	catch (error)
	{
		console.error(error);
		alert("Failed to parse text into a mind map!");
	}
}


//#region Edition

const nodeEditor = ref(null);
const edition = reactive({
	isEditingNode: false,
	selected: null
});

function onNodeEditionEnded(newValue)
{
	edition.isEditingNode = false;
	if (newValue)
	{
		edition.selected.content = newValue.content;
		scheduleAutoLayout();
	}
}

function select(node)
{
	if (node == null)
		return;

	if (edition.isEditingNode)
		onNodeEditionEnded();
	
	edition.selected = node;
}

function makeNode(content, children)
{
	const newId = nodeIdCounter++;
	const newNode = {
		id: newId,
		content: content ?? `Node${newId}`,
		parent: null,
		children: [],
		x: 0,
		y: 0,
		collapsed: false
	};

	if (children)
	{
		children.forEach(child => insertChild(child, newNode));
	}
	return newNode;
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
		select(parentChildren[Math.max(0, indexInParent - 1)]);
	}
	else
	{
		select(edition.selected.parent);
	}
	scheduleAutoLayout();
}

//#endregion

const nodesToDraw = computed(() =>
{
	return flatten(data.mapRoot);
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

	return gatherConnections(data.mapRoot);
});
</script>

<template>
	<div ref="appContainer" id="app" tabindex="0">
		<TheFileDragDrop />
		<TheToolbar :document="data.mapRoot" />
		<div
			ref="mindmapContainer"
			id="mindmap-container">
			<div
				id="mindmap-background"
				:style="{
					backgroundPositionX: `${-view.center.x * view.zoom}px`,
					backgroundPositionY: `${-view.center.y * view.zoom}px`,
					backgroundSize: `${view.zoom*100}px ${view.zoom*100}px, ${view.zoom*20}px ${view.zoom*20}px`
				}">
			</div>
			<aside class="left-side-panels">
				<KeyBindingsListener :bindings="bindings" :disabled="edition.isEditingNode" />
			</aside>
			<aside class="right-side-panels">
				<section v-show="showZoom">
					<article class="text-with-icons">
						{{ zoomText }}
						<svg-icon :path="mdiMagnify"></svg-icon>
					</article>
				</section>
			</aside>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				id="mindmap"
				ref="mindmap"
				:view-box.camel="viewBox">
				<g
					v-for="node in nodesToDraw"
					:key="node.id"
					ref="svgNodes"

					@click.left="select(node)"

					:transform="`translate(${node.x}, ${node.y})`"

					:data-node="node.id"
					class="node"
					:class="{ selected: edition.selected === node, collapsed: node.collapsed }">
					<text>{{node.content}}</text>
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
					:active="edition.isEditingNode"
					:targetNode="edition.selected"
					:settings="data.settings"
					@edition-ended="onNodeEditionEnded"/>
			</svg>
		</div>
	</div>
</template>

<style scoped>
#app
{
	position: relative;
	display: flex;
	flex-direction: column;
}

#mindmap-container
{
	position: relative;
	flex-grow: 1;
}

#mindmap-background
{
	display: none;
	width: 100%;
	height: 100%;
	background-image:
		conic-gradient(at calc(100% - 2px) calc(100% - 2px),#555 270deg, #0000 0),
		conic-gradient(at calc(100% - 1px) calc(100% - 1px),#444 270deg, #0000 0);
	background-size: 100px 100px, 20px 20px;
}

#mindmap-container > *
{
	position: absolute;
	overflow: hidden;
}

#mindmap
{
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}

#mindmap .node
{
	fill: var(--color-text);
	position: relative;
}

#mindmap .node.selected
{
	fill: red;
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
