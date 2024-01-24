<template>
	<div class="container">
		<ul class="menus">
			<li v-for="(menu, index) in menus"
					:key="index"
					@click="menu.action">
				<i :class="'iconfont ' + menu.icon"></i>
			</li>
		</ul>

		<div class="content">
			<div class="upper">
				<img v-if="previewImage"
						 :src="previewImage" />
			</div>
			<div class="downer">
				<div class="tips">识别内容
					<button class="copy"
									@click.self="copyContent"> {{ isAlreadyCopy ? "已复制" : "复制内容" }}</button>
					<button @click.self="generateQr">↑ 生成二维码</button>
				</div>
				<textarea class="area"
									cols="40"
									rows="10"
									placeholder="二维码内容"
									v-model="code"
									@focusin="onFocusin">
				</textarea>
			</div>
		</div>
	</div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import jsQR from "jsqr";
import QRCode from 'qrcode'
const { ipcRenderer } = window.electron;
const { bridgeEvent } = window.api;

const previewImage = ref("");
const code = ref("");
const isAlreadyCopy = ref(false);

async function handleCutScreen() {
	await ipcRenderer.send(bridgeEvent.ENTER_SCREEN_CUT);
}

const menus = ref([
	{
		name: "截图识别",
		icon: "icon-jietu",
		action: handleCutScreen
	},
	{
		name: "上传识别",
		icon: "icon-24gl-folderOpen",
		action: handleUpload
	},
]);


onMounted(() => {
	ipcRenderer.on(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

onUnmounted(() => {
	ipcRenderer.removeListener(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

function getCutImageInfo(event, { base64, imageData, w, h }) {
	previewImage.value = base64;
	let data = jsQR.default(imageData, w, h);
	code.value = data.data ?? "";
	isAlreadyCopy.value = false;
}

function onFocusin(event) {
	let target = event.target;
	//! 自动聚焦，同时去掉前后空格
	target.value = target.value.trim();
	target.focus();
	target.selectionStart = target.value.length;
}

async function copyContent() {
	try {
		await navigator.clipboard.writeText(code.value);
		console.info("Content copied to clipboard");
		/* Resolved - 文本被成功复制到剪贴板 */
		isAlreadyCopy.value = true;
	} catch (err) {
		console.error('Failed to copy: ', err);
	}
}

async function generateQr() {
	if (!code.value || code.value.length == 0) {
		return;
	}
	let base64 = await QRCode.toDataURL(code.value);
	console.log("generateQr:");
	console.log(base64);
	previewImage.value = base64;
}

function getImageData(dataUrl) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = dataUrl;
		img.addEventListener("load", () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);

			resolve(ctx.getImageData(0, 0, img.width, img.height));
		});
	});
}

function decodeQRCode(imageData) {
	const code = jsQR.default(imageData.data, imageData.width, imageData.height);
	return code ? code.data : null;
}

function handleUpload() {
	var input = document.createElement('input');
	input.type = 'file';
	input.accept = "image/png,image/jpeg"
	input.onchange = event => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async function (e) {
				previewImage.value = e.target.result;
				const imageData = await getImageData(e.target.result);
				code.value = decodeQRCode(imageData);
				isAlreadyCopy.value = false;
			};
			reader.readAsDataURL(file);
		}
	}

	input.click();
}

</script>

<style lang="less">
.container {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
	padding: 10px;
	box-sizing: border-box;

	.menus {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20px;
		height: 36px;
		background-color: #F0F0F0;
		padding-left: 10px;
	}

	.content {
		display: flex;
		flex-direction: column;
		height: calc(100% - 36px);

		.upper {
			width: 100%;
			height: 330px;
			margin: 0 auto;
			border: 1px solid;

			img {
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}

		.tips {
			margin: 4px 0;

			button {
				float: right
			}
		}

		.downer {
			width: 100%;
			height: auto;
			margin: 0 auto;
			flex-shrink: 1;
			flex-grow: 1;
			flex: 1;

			.area {
				width: 100%;
				height: calc(100% - 50px);
				resize: none;
			}

			.copy {
				float: right
			}
		}
	}
}
</style>

