<template>
	<div class="container">
		提示：<br>
		1.点击"截图"按钮 or 点击快捷键：CTRL + ALT + C 开始截图<br>
		2.选择完区域后，点击Enter: 确认截图，点击Esc: 退出截图
		<br>
		<button @click="handleCutScreen">截屏</button>
		<div>
			<img :src="previewImage"
					 style="max-width: 100%" />
		</div>
	</div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const { ipcRenderer } = window.electron;
const { bridgeEvent } = window.api;
const previewImage = ref("");

async function handleCutScreen() {
	await ipcRenderer.send(bridgeEvent.ENTER_SCREEN_CUT);
}

onMounted(() => {
	ipcRenderer.on(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

onUnmounted(() => {
	ipcRenderer.removeListener(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

function getCutImageInfo(event, pic) {
	previewImage.value = pic;
}
</script>

