<template>
	<div class="wrapper">
		<div class="center">
			<el-input v-model="screenCut"
								@keydown="keydown"
								@keyup="keyup">
				<template #prepend>截图</template>

				<template #append
									@click="resetScreenshotKey">重置</template>
			</el-input>
		</div>
		<div class="bottom">
			<el-button @click="cancel">取消</el-button>
			<el-button @click="confirm">确认</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue"
import { SCREENSHOT_DEFAULT_KEY } from "../../common";

const { ipcRenderer } = window.electron;
const { bridgeEvent, shortcutKeys, store } = window.api;

let screenCut = ref(store.get(shortcutKeys.shortcut_snapshot) ?? SCREENSHOT_DEFAULT_KEY);
function resetScreenshotKey() {
	screenCut.value = SCREENSHOT_DEFAULT_KEY;
}

function cancel() {
	ipcRenderer.send(bridgeEvent.CLOSE_SHORTCUT_WINDOW);
}

function confirm() {
	ipcRenderer.send(bridgeEvent.UPDATE_SHORTCUT_KEY, store.get(shortcutKeys.shortcut_snapshot), screenCut.value);
	ipcRenderer.send(bridgeEvent.CLOSE_SHORTCUT_WINDOW);
	store.set(shortcutKeys.shortcut_snapshot, screenCut.value);
}

function normalizeKey(key) {
	return key.length == 1 ? key.toUpperCase() : key;
}

let keys = new Set();
function keydown(event) {
	// 获取按下的键值
	const key = normalizeKey(event.key);
	console.log(`keydown: ${key}`);
	// 判断是否按下组合键
	if (event.ctrlKey) {
		keys.add("Control");
	}
	if (event.altKey) {
		keys.add("Alt");
	}
	if (event.shiftKey) {
		keys.add("Shift");
	}
	keys.add(key);

	screenCut.value = [...keys.values()].join("+");
	console.log(`keydown screenCut: ${screenCut.value}`);
	preKeys = [...keys.values()];
}

let timerId = null;
let preKeys = [];
function keyup(event) {
	const key = normalizeKey(event.key);
	keys.delete(key);

	if (timerId == null) {
		timerId = setTimeout(() => {
			const curKeys = [...keys.values()];
			if (curKeys.length == 0) {
				//! 当前没有一个key按下，说明就是确认按键
				screenCut.value = preKeys.join("+");
			} else {
				//! 如果只是抬起一部分将对应key移除
				preKeys = curKeys;
				screenCut.value = curKeys.join("+");
			}
			timerId = null;
		}, 200);
	}
}
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 30px;
	position: relative;
	width: 100vw;
	height: 100vh;
	box-sizing: border-box;


	.center {
		position: relative;
	}

	.bottom {
		text-align: right;
	}
}
</style>
