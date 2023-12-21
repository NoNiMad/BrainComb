import { Node } from "./Node";

function loadDocumentV0(serializedDocument)
{
	const doc = new Document(null);
	doc.root = loadNode(serializedDocument, null);
	return doc;

	function loadNode(serializedNode, parentNode)
	{
		const node = new Node(doc.idCounter++);
		node.parent = parentNode;
		node.collapsed = serializedNode.collapsed ?? false;

		node.name = serializedNode.content;
		
		if (serializedNode.children)
		{
			serializedNode.children.forEach(serializedChild =>
			{
				const childNode = loadNode(serializedChild, node);
				node.children.push(childNode);
			});
		}
		return node;
	}
}

function loadDocumentV1(serializedDocument)
{

}

export class Document
{
	version = import.meta.env.VITE_DOCUMENT_VERSION;
	name = null;

	idCounter = 1;
	root = null;

	selected = null;

	constructor(name)
	{
		this.name = name;
		
		const defaultRoot = this.createNode();
		defaultRoot.name = "Root";
		this.root = defaultRoot;
		this.select(this.root);
	}

	createNode(name)
	{
		return new Node(this.idCounter++, name ?? "New Node");
	}

	select(node)
	{
		this.selected = node;
	}

	static serialize(document)
	{
		const serializedDocument = {
			version: document.version,
			name: document.name
		};

		if (document.root !== null)
		{
			serializedDocument.root = Node.serialize(document.root);
		}

		return serializedDocument;
	}

	static deserialize(serializedDocument)
	{
		switch (serializedDocument.version)
		{
			case undefined:
				return loadDocumentV0(serializedDocument);
			case "1":
				return loadDocumentV1(serializedDocument);
			default:
				throw new Error("Invalid document version.");
		}
	}
}