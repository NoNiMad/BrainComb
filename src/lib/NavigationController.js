import { getClosest, getClosestFiltered } from "./NodeHelpers";

export function getNodeUp(document, fromNode)
{
	const siblings = fromNode.parent?.children;
	if (siblings)
	{
		const currentIndex = siblings.indexOf(fromNode);
		if (currentIndex > 0)
			return siblings[currentIndex - 1];
	}
	return getClosestFiltered(fromNode, document, node => node.y < fromNode.y);
}

export function getNodeDown(document, fromNode)
{
	const siblings = fromNode.parent?.children;
	if (siblings)
	{
		const currentIndex = siblings.indexOf(fromNode);
		if (currentIndex < siblings.length - 1)
			return siblings[currentIndex + 1];
	}
	return getClosestFiltered(fromNode, document, node => node.y > fromNode.y);
}

export function getNodeLeft(document, fromNode)
{
	if (fromNode.parent !== null)
		return fromNode.parent;
	else
		return getClosestFiltered(fromNode, document, node => node.x < fromNode.x);
}

export function getNodeRight(document, fromNode)
{
	if (fromNode.children.length > 0)
		return getClosest(fromNode, fromNode.children);	
	else
		return getClosestFiltered(fromNode, document, node => node.x > fromNode.x);
}