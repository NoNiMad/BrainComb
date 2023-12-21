import { countLeaves } from "./NodeHelpers";

const svgNS = "http://www.w3.org/2000/svg";
let _svgNode = null;
let _textNode = null;
function enableMeasuring()
{
	_svgNode = document.createElementNS(svgNS, "svg");
	_textNode = document.createElementNS(svgNS, "text");
	
	_svgNode.appendChild(_textNode);
	document.body.appendChild(_svgNode);
}

function getTextWidth(text)
{
	_textNode.textContent = text;
	return _textNode.getBBox().width;
}

function disableMeasuring()
{
	document.body.removeChild(_svgNode);
	_svgNode = null;
	_textNode = null;
}

export function simpleLayout(document, settings)
{
	function visitChildren(node)
	{
		if (node.children.length === 0 || node.collapsed)
			return;

		const xSpace = getTextWidth(node.name);
		const nodeLeavesCount = countLeaves(node);
		
		let leavesCounter = 0;
		node.children.forEach((child, i) =>
		{
			child.x = node.x + xSpace + settings.horizontalSpace;

			const childLeavesCount = countLeaves(child);
			child.y = node.y + settings.leaveHeight * (
				leavesCounter // Current offset
				+ childLeavesCount / 2 // To place in middle of children
				- nodeLeavesCount / 2 // Half parent count for centering
			);
			leavesCounter += childLeavesCount;

			visitChildren(child);
		});
	}

	enableMeasuring();

	const root = document.root;
	root.x = 0;
	root.y = 0;
	visitChildren(root);

	disableMeasuring();
}