<template>
	<div class="wrapper">
		<div class="center">
			<el-input v-model="screenCut">
				<template #prepend>截图</template>
				<template #append
									@click="resetScreenshotKey">重置</template>
			</el-input>
		</div>
		<div class="bottom">
			<el-button @click="cancel">取消</el-button>
			<dl-button @click="confirm">确认</dl-button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue"
import { SCREENSHOT_STORE_KEY, SCREENSHOT_DEFAULT_KEY } from "../../common";

const { ipcRenderer } = window.electron;
const { bridgeEvent } = window.api;

let screenCut = ref(localStorage.getItem(SCREENSHOT_STORE_KEY) ?? SCREENSHOT_DEFAULT_KEY);
function resetScreenshotKey() {
	screenCut.value = SCREENSHOT_DEFAULT_KEY;
}

function cancel() {
	ipcRenderer.send(bridgeEvent.CLOSE_SHORTCUT_WINDOW);
}

function confirm() {
	localStorage.setItem(SCREENSHOT_STORE_KEY, screenCut.value);
	ipcRenderer.send(bridgeEvent.UPDATE_SHORTCUT_KEY);
}
</script>

<style lang="scss" scoped>
</style>
