import KeyBinding from "./KeyBinding";
import services from "./services";

export default [
	new KeyBinding("Edit node", "Enter", {}, () => {
		services.VueService.app.startEditNode();
		return true;
	}),
	new KeyBinding("Collapse node", "c", {}, () => {
		const app = services.VueService.app;
		if (app.selected.children.length == 0)
			return false;

		app.selected.collapsed = !app.selected.collapsed;
		app.scheduleAutoLayout();
		return true;
	}),
	new KeyBinding("Remove node", "Delete", {}, () => {
		const app = services.VueService.app;
		if (app.selected.parent === null)
			return false;
		
		const parentChildren = app.selected.parent.children;
		const indexInParent = parentChildren.indexOf(app.selected);
		parentChildren.splice(indexInParent, 1);

		if (parentChildren.length > 0)
		{
			app.select(parentChildren[Math.max(0, indexInParent - 1)]);
		}
		else
		{
			app.select(app.selected.parent);
		}
		app.scheduleAutoLayout();
		return true;
	}),
	new KeyBinding("Select up", "ArrowUp", {}, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			if (currentIndex > 0)
			{
				app.select(siblings[currentIndex - 1]);
				return true;
			}
		}
		app.selectClosestToSelected(node => node.y < selectedNode.y);
		return true;
	}),
	new KeyBinding("Add sibling before", "ArrowUp", { shift: true }, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			const newNode = app.addEmptyChild(selectedNode.parent, currentIndex);
			if (newNode !== null)
			{
				app.select(newNode);
			}
		}
		return true;
	}),
	new KeyBinding("Move up", "ArrowUp", { alt: true }, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			if (currentIndex > 0)
			{
				siblings[currentIndex] = siblings[currentIndex - 1];
				siblings[currentIndex - 1] = selectedNode;
				app.scheduleAutoLayout();
			}
		}
		return true;
	}),
	new KeyBinding("Select down", "ArrowDown", {}, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			if (currentIndex < siblings.length - 1)
			{
				app.select(siblings[currentIndex + 1]);
				return true;
			}
		}
		app.selectClosestToSelected(node => node.y > selectedNode.y);
		return true;
	}),
	new KeyBinding("Add sibling after", "ArrowDown", { shift: true }, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			const newNode = app.addEmptyChild(selectedNode.parent, currentIndex + 1);
			if (newNode !== null)
			{
				app.select(newNode);
			}
		}
		return true;
	}),
	new KeyBinding("Move down", "ArrowDown", { alt: true }, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			const siblings = selectedNode.parent.children;
			const currentIndex = siblings.indexOf(selectedNode);
			if (currentIndex < siblings.length - 1)
			{
				siblings[currentIndex] = siblings[currentIndex + 1];
				siblings[currentIndex + 1] = selectedNode;
				app.scheduleAutoLayout();
			}
		}
		return true;
	}),
	new KeyBinding("Select left", "ArrowLeft", {}, () => {
		const app = services.VueService.app;
		const selectedNode = app.selected;
		if (selectedNode.parent !== null)
		{
			app.select(selectedNode.parent);
		}
		else
		{
			app.selectClosestToSelected(node => node.x < selectedNode.x);
		}
		return true;
	}),
	new KeyBinding("Select right", "ArrowRight", {}, () => {
		const app = services.VueService.app;
		if (app.selected.children.length > 0)
		{
			app.selectClosestToSelected(node => app.selected.children.includes(node));	
		}
		else
		{
			app.selectClosestToSelected(node => node.x > app.selected.x);
		}
		return true;
	}),
	new KeyBinding("Add child", "ArrowRight", { shift: true }, () => {
		const app = services.VueService.app;
		const newNode = app.addEmptyChild();
		if (newNode !== null)
		{
			app.select(newNode);
		}
		return true;
	})
];