<template>
	<div class="container"
			 :style="'background-image:url(' + bg + ')'"
			 ref="container"
			 @mousedown="onMouseDown"
			 @mousemove="onMouseMove"
			 @mouseup="onMouseUp">
	</div>
</template>
<script setup>
import Konva from "konva";
import { ref, onMounted } from "vue";

const { ipcRenderer } = window.electron;
let container = ref(null);
let bg = ref("");
let stage, layer, rect, transformer;

onMounted(() => {
	ipcRenderer.send("SHOW_CUT_SCREEN");
	ipcRenderer.removeListener("GET_SCREEN_IMAGE", getSource);
	ipcRenderer.on("GET_SCREEN_IMAGE", getSource);
	ipcRenderer.on("FINISH_CUT", confirmCut);
});

async function getSource(event, source) {
	const { thumbnail } = source;
	const pngData = await thumbnail.toDataURL("image/png");
	bg.value = pngData;
	render();
}

function render() {
	stage = createStage();
	layer = createLayer(stage);
}

function createStage() {
	return new Konva.Stage({
		container: container.value,
		width: window.innerWidth,
		height: window.innerHeight,
	});
}

function createLayer(stage) {
	let layer = new Konva.Layer();
	stage.add(layer);
	layer.draw();
	return layer;
}

function createRect(layer, x, y, width, height, alpha, draggable) {
	let rect = new Konva.Rect({
		x,
		y,
		width,
		height,
		fill: `rgba(0,0,255,${alpha})`,
		draggable
	});
	layer.add(rect);
	return rect;
}

let isDown = false;
let rectOption = {};
function onMouseDown(e) {
	if (rect || isDown) {
		return;
	}
	isDown = true;
	const { pageX, pageY } = e;
	rectOption.x = pageX || 0;
	rectOption.y = pageY || 0;
	rect = createRect(layer, pageX, pageY, 0, 0, 0.25, false);
	rect.draw();
}

function onMouseMove(e) {
	if (!isDown) return;
	const { pageX, pageY } = e;
	let w = pageX - rectOption.x;
	let h = pageY - rectOption.y;
	rect.remove();
	rect = createRect(layer, rectOption.x, rectOption.y, w, h, 0.25, false);
	rect.draw();
}

function onMouseUp(e) {
	if (!isDown) {
		return;
	}
	isDown = false;
	const { pageX, pageY } = e;
	let w = pageX - rectOption.x;
	let h = pageY - rectOption.y;
	rect.remove();
	rect = createRect(layer, rectOption.x, rectOption.y, w, h, 0, true);
	rect.draw();
	transformer = createTransformer(rect);
	layer.add(transformer);
}

function createTransformer(rect) {
	let transformer = new Konva.Transformer({
		nodes: [rect],
		rotateAnchorOffset: 60,
		enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
	});
	return transformer
}

/**
 * 根据选择区域生成图片
 * @param {*} info 
 */
async function getCutImage(info) {
	const { x, y, width, height } = info;
	let img = new Image();
	img.src = bg.value;
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");
	canvas.width = ctx.width = width;
	canvas.height = ctx.height = height;
	ctx.drawImage(img, -x, -y, window.innerWidth, window.innerHeight);
	return canvas.toDataURL("image/png");
}

/**
 * 确认截图
 */
async function confirmCut() {
	const { width, height, x, y, scaleX = 1, scaleY = 1 } = rect.attrs;
	let _x = width > 0 ? x : x + width * scaleX;
	let _y = height > 0 ? y : y + height * scaleY;
	let pic = await getCutImage({
		x: _x,
		y: _y,
		width: Math.abs(width) * scaleX,
		height: Math.abs(height) * scaleY,
	});
	ipcRenderer.send("FINISH_CUT_SCREEN", pic);
}

/**
 * 关闭截图
 */
function closeCut() {
	ipcRenderer.send("CLOSE_CUT_SCREEN");
}
</script>

<style lang="scss" scoped>
.container {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: transparent;
	background-size: 100% 100%;
	background-repeat: no-repeat;
	border: 2px solid blue;
	box-sizing: border-box;
}
</style>
