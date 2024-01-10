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
const previewImage = ref("");

async function handleCutScreen() {
	await ipcRenderer.send("OPEN_CUT_SCREEN");
	ipcRenderer.removeListener("GET_CUT_INFO", getCutInfo);
	ipcRenderer.on("GET_CUT_INFO", getCutInfo);
}

function getCutInfo(event, pic) {
	previewImage.value = pic;
}
</script>

