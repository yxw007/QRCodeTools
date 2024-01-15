<template>
	<div class="container">
		<button @click="handleCutScreen">截屏</button>
		<div>
			<img :src="previewImage"
					 style="max-width: 100%" />
		</div>
	</div>
</template>


<script setup>
import { ref } from "vue";
const { ipcRenderer } = window.electron;
const { bridgeEvent } = window.api;
const previewImage = ref("");

async function handleCutScreen() {
	await ipcRenderer.send(bridgeEvent.ENTER_SCREEN_CUT);
	ipcRenderer.removeListener(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
	ipcRenderer.on(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
}

function getCutImageInfo(event, pic) {
	previewImage.value = pic;
}
</script>

