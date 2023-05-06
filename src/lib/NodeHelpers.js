export function sqrDist(nodeA, nodeB)
{
	return (nodeA.x - nodeB.x) * (nodeA.x - nodeB.x) + (nodeA.y - nodeB.y) * (nodeA.y - nodeB.y);
}

export function flatten(startNode, includeCollapsed)
{
	includeCollapsed = includeCollapsed ?? false;
	if (startNode.collapsed && !includeCollapsed)
		return [startNode];
	return [startNode].concat(startNode.children.flatMap(child => flatten(child, includeCollapsed)));
}

export function getClosestFiltered(startNode, document, filter)
{
	const nodesToSearch = flatten(document).filter(filter);
	return getClosest(startNode, nodesToSearch);
}

export function getClosest(startNode, nodes)
{
	let minDist = null;
	let closestNode = null;
	for (const node of nodes)
	{
		if (node === startNode)
			continue;
		
		const dist = sqrDist(startNode, node);
		if (minDist == null || dist < minDist)
		{
			minDist = dist;
			closestNode = node;
		}
	}
	return closestNode;
}

export function countLeaves(startNode)
{
	return flatten(startNode).filter(node => node.children.length === 0 || node.collapsed).length;
}