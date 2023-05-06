import { countLeaves } from "./NodeHelpers";

export function simpleLayout(mapRoot, settings, getElement)
{
	function visitChildren(node)
	{
		if (node.children.length === 0 || node.collapsed)
			return;

		const svgNode = getElement(node);
		const xSpace = svgNode.getBBox().width;
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

	mapRoot.x = 0;
	mapRoot.y = 0;
	visitChildren(mapRoot);
}