<script>
import { nextTick } from "vue";
import TheFileDragDrop from "./components/TheFileDragDrop.vue";
import TheAppKeyBindings from "./components/TheAppKeyBindings.vue";

let nodeIdCounter = 0;
function makeNode(content, children, parent)
{
	const newNode = {
		id: nodeIdCounter++,
		content,
		parent: parent ?? null,
		children: children ?? [],
		x: 0,
		y: 0,
		collapsed: false
	};

	newNode.children.forEach(child => child.parent = newNode);
	return newNode;
}

function sqrDistBetweenNodes(nodeA, nodeB)
{
	return (nodeA.x - nodeB.x) * (nodeA.x - nodeB.x) + (nodeA.y - nodeB.y) * (nodeA.y - nodeB.y);
}

function getSVGNode(node)
{
	return document.querySelector(`#mindmap #node-${node.id}`);
}

function getClosest(to, nodes)
{
	return nodes.reduce((min, node) => {
		const dist = sqrDistBetweenNodes(node, to);
		return min === null || dist < min.dist ? { dist, node } : min;
	}, null);
}

const domElements = {};
const minViewSize = { width: 360, height: 360 };

function initViewBox(app)
{
	app.view.size =
	{
		width: Math.max(document.body.clientWidth, minViewSize.width),
		height: Math.max(document.body.clientHeight, minViewSize.height)
	};

	domElements.mindmapDiv.addEventListener("mousedown", event => {
		app.view.isDragging = true;
		app.view.lastDrag = { x: event.clientX, y: event.clientY };
	});

	domElements.mindmapDiv.addEventListener("mousemove", event => {
		if (!app.view.isDragging)
			return;
		
		app.view.center.x -= event.clientX - app.view.lastDrag.x;
		app.view.center.y -= event.clientY - app.view.lastDrag.y;
		app.view.lastDrag = { x: event.clientX, y: event.clientY };
	});

	domElements.mindmapDiv.addEventListener("mouseup", _ => {
		app.view.isDragging = false;
	});

	domElements.mindmapDiv.addEventListener("wheel", ev => {
		app.view.size.width = Math.max(minViewSize.width, app.view.size.width + ev.deltaY);
		app.view.size.height = Math.max(minViewSize.height, app.view.size.height + ev.deltaY);
	});
}

export default
{
	inject: [ "commands", "services", "icons" ],
	components: {
		TheFileDragDrop,
		TheAppKeyBindings,
	},
	created()
	{
		this.services.VueService.app = this;

		nextTick(() => {
			domElements.appDiv = document.getElementById("app");
			domElements.mindmapContainerDiv = document.getElementById("mindmap-container");
			domElements.mindmapDiv = document.getElementById("mindmap");
			domElements.mapInput = document.getElementById("map-input");

			initViewBox(this);

			this.autoLayout();
			this.select(this.mapRoot);

			domElements.appDiv.focus();
		});
	},
	data()
	{
		return {
			selected: null,
			mapRoot: makeNode("Root", [
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
			]),
			input:
			{
				active: false,
				value: "",
				x: 0,
				y: 0,
				width: 0
			},
			view:
			{
				center: { x: 0, y: 0 },
				size: { width: 0, height: 0 },
				lastDrag: { x: 0, y: 0 },
				isDragging: false
			},
			settings:
			{
				leaveHeight: 60,
				horizontalSpace: 70
			},
			ui:
			{
				iconsPath: {

				},
				globalDragDrop: false
			}
		};
	},
	methods:
	{
		scheduleAutoLayout: function()
		{
			nextTick(() => this.autoLayout());
		},
		loadFromText: function (text)
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
				this.mapRoot = parsed;
				this.select(this.mapRoot);
				this.scheduleAutoLayout();
			}
			catch (error)
			{
				console.error(error);
				alert("Failed to parse text into a mind map!");
			}
		},
		startEditNode: function()
		{
			if (this.input.active)
				return;

			this.input.value = this.selected.content;
			this.input.x = this.selected.x;
			this.input.y = this.selected.y;
			this.input.width = getSVGNode(this.selected).getBBox().width;
			this.input.active = true;
			nextTick(() => {
				domElements.mapInput.focus();
				domElements.mapInput.select();
			});
		},
		stopEditNode: function()
		{
			if (!this.input.active)
				return;
			
			this.input.active = false;
			this.input.w = 0;
			this.input.h = 0;
			domElements.appDiv.focus();
		},
		onNodeInputCancel: function(event)
		{
			event.preventDefault();
			event.stopPropagation();
			this.stopEditNode();
		},
		onNodeInputValidate: function(event)
		{
			event.preventDefault();
			event.stopPropagation();

			const newValue = this.input.value.trim();
			if (!this.input.active || newValue === "")
				return;

			this.input.active = false;
			this.selected.content = newValue;
			domElements.appDiv.focus();
			this.scheduleAutoLayout();
		},
		selectClosestToSelected: function (filter)
		{
			const closest = getClosest(
				this.selected,
				this.allNodes().filter(filter)
			);
			if (closest !== null)
			{
				this.select(closest.node);
			}
		},
		select: function (node)
		{
			this.stopEditNode();
			this.selected = node;
		},
		addEmptyChild: function (parent, index)
		{
			parent = parent ?? this.selected;
			index = index ?? parent.children.length;

			const newNode = makeNode("New" + nodeIdCounter, [], parent);
			parent.children.splice(index, 0, newNode);
			this.scheduleAutoLayout();

			return newNode;
		},
		countLeaves: function (from)
		{
			return this.allNodes(from).filter(node => node.children.length === 0 || node.collapsed).length;
		},
		autoLayout: function ()
		{
			const _this = this;
			function visitChildren(node)
			{
				if (node.children.length === 0 || node.collapsed)
					return;

				const svgNode = getSVGNode(node);
				const xSpace = svgNode.getBBox().width;
				const nodeLeavesCount = _this.countLeaves(node);
				
				let leavesCounter = 0;
				node.children.forEach((child, i) =>
				{
					child.x = node.x + xSpace + _this.settings.horizontalSpace;

					const childLeavesCount = _this.countLeaves(child);
					child.y = node.y + _this.settings.leaveHeight * (
						leavesCounter // Current offset
						+ childLeavesCount / 2 // To place in middle of children
						- nodeLeavesCount / 2 // Half parent count for centering
					);
					leavesCounter += childLeavesCount;

					visitChildren(child);
				});
			}

			this.mapRoot.x = 0;
			this.mapRoot.y = 0;
			visitChildren(this.mapRoot);
		},
		allNodes: function (from)
		{
			function flattenNode(node)
			{
				if (node.collapsed === true)
					return [node];
				return [node].concat(node.children.flatMap(child => flattenNode(child)));
			}

			return flattenNode(from ?? this.mapRoot);
		}
	},
	computed:
	{
		isEditing: function()
		{
			return this.input.active;
		},
		viewBox: function()
		{
			const minX = this.view.center.x - this.view.size.width / 2;
			const minY = this.view.center.y - this.view.size.height / 2;
			return `${minX} ${minY} ${this.view.size.width} ${this.view.size.height}`;
		},
		nodesToDraw: function ()
		{
			return this.allNodes();
		},
		connectionsToDraw: function ()
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

			return gatherConnections(this.mapRoot);
		}
	}
};
</script>

<template>
	<div id="app" tabindex="0">
		<TheFileDragDrop />
		<TheAppKeyBindings :ignoreBindings="isEditing" />
		<nav class="toolbar">
			<ul>
				<li>
					<svg-icon type="mdi" :path="icons.brain"></svg-icon>
				</li>
				<li>SimpleMind</li>
			</ul>
			<ul>
				<li>
					<button @click="commands.OpenFile.execute()">
						<svg-icon type="mdi" :path="icons.folderOpen"></svg-icon>
						<span>Open</span>
					</button>
				</li>
				<li>
					<button @click="commands.SaveFile.execute()">
						<svg-icon type="mdi" :path="icons.contentSave"></svg-icon>
						<span>Download</span>
					</button>
				</li>
			</ul>
		</nav>
		<div id="mindmap-container">
			<svg xmlns="http://www.w3.org/2000/svg" id="mindmap" :view-box.camel="viewBox">
				<g
					v-for="node in nodesToDraw"
					:key="`node-${node.id}`"
					:id="`node-${node.id}`"
					:transform="`translate(${node.x}, ${node.y})`"
					@click.left="select(node)"
					class="node"
					:class="{ selected: selected === node, collapsed: node.collapsed }">
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
				<foreignObject
					:x="input.x - 50" :y="input.y - settings.leaveHeight / 4"
					:width="input.active ? input.width + 100 : 0"
					:height="input.active ? settings.leaveHeight / 2 : 0">
					<input
						id="map-input"
						v-show="input.active"
						type="text"
						v-model="input.value"
						@keypress.enter="onNodeInputValidate($event)"
						@keydown.esc="onNodeInputCancel($event)" />
				</foreignObject>
			</svg>
		</div>
	</div>
</template>

<style scoped>
</style>
