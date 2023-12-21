export class Node
{
	id = 0;

	parent = null;
	children = [];
	collapsed = false;

	name = null;
	content = null;

	x = 0;
	y = 0;

	constructor(id, name)
	{
		this.id = id;
		this.name = name;
	}

	siblings()
	{
		if (parent === null)
			return [];
		return parent.children;
	}

	static serialize(node)
	{
		const serializedNode = {
			id: node.id,
			name: node.name
		};

		if (node.content !== null)
		{
			serializedNode.content = node.content;
		}
		if (node.collapsed)
		{
			serializedNode.collapsed = true;
		}
		if (node.children.length > 0)
		{
			serializedNode.children = node.children.map(child => Node.serialize(child));
		}

		return serializedNode;
	}

	static deserialize(serializedNode)
	{

	}
}