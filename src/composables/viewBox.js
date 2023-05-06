import { onMounted, onUnmounted, reactive, computed } from "vue";

export function useViewBox(element)
{
	const viewUpdateInterval = 10;
	let viewLastUpdate = Date.now();

	const view = reactive({
		zoom: 1,
		center: { x: 0, y: 0 },
		lastMousePos: { x: 0, y: 0 },
		isDragging: false,
		windowResized: 0
	});

	const viewBox = computed(() =>
	{
		// To trigger viewBox refresh
		view.windowResized;
	
		if (!element.value)
			return "0 0 0 0";
	
		const zoomedWidth = element.value.clientWidth / view.zoom;
		const zoomedHeight = element.value.clientHeight / view.zoom;
		const minX = view.center.x - zoomedWidth / 2;
		const minY = view.center.y - zoomedHeight / 2;
		return `${minX} ${minY} ${zoomedWidth} ${zoomedHeight}`;
	});
	
	onMounted(() => {
		window.addEventListener("resize", onWindowResized);

		element.value.addEventListener("mousedown", onElementMouseDown);
		element.value.addEventListener("mousemove", onElementMouseMove);
		element.value.addEventListener("mouseup", onElementMouseUp);
		element.value.addEventListener("wheel", onElementWheel);
	});

	onUnmounted(() => {
		window.removeEventListener("resize", onWindowResized);

		if (element.value)
		{
			element.value.removeEventListener("mousedown", onElementMouseDown);
			element.value.removeEventListener("mousemove", onElementMouseMove);
			element.value.removeEventListener("mouseup", onElementMouseUp);
			element.value.removeEventListener("wheel", onElementWheel);
		}
	});

	return { view, viewBox };

	function onWindowResized()
	{
		view.windowResized++;
	}
	
	function onElementMouseDown(event)
	{
		view.isDragging = true;
		view.lastMousePos = { x: event.clientX, y: event.clientY };
	}

	function onElementMouseMove(event)
	{
		const now = Date.now();
		if (!view.isDragging || now - viewLastUpdate < viewUpdateInterval)
			return;
		
		view.center.x -= (event.clientX - view.lastMousePos.x) / view.zoom;
		view.center.y -= (event.clientY - view.lastMousePos.y) / view.zoom;
		view.lastMousePos = { x: event.clientX, y: event.clientY };
		viewLastUpdate = now;
	}
	
	function onElementMouseUp(_)
	{
		view.isDragging = false;
	}
	
	function onElementWheel(event)
	{
		let newZoom = view.zoom - 0.1 * Math.sign(event.deltaY);
		// Min Zoom = 10% - Max Zoom = 300%
		view.zoom = Math.min(Math.max(newZoom, 0.1), 3);
	}
}