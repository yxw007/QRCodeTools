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
				<div class="tips">识别内容 <button>↑ 生成二维码</button></div>
				<textarea class="area"
									cols="40"
									rows="10"
									placeholder="二维码内容"
									@focusin="onFocusin">
				</textarea>
				<button class="copy">复制内容</button>
			</div>
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

const menus = ref([
	{
		name: "截图识别",
		icon: "icon-jietu",
		action: handleCutScreen
	},
	{
		name: "上传识别",
		icon: "icon-24gl-folderOpen",
		action: null
	},
]);


onMounted(() => {
	ipcRenderer.on(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

onUnmounted(() => {
	ipcRenderer.removeListener(bridgeEvent.GET_CUT_IMAGE_INFO, getCutImageInfo);
})

function getCutImageInfo(event, pic) {
	previewImage.value = pic;
}

function onFocusin(event) {
	let target = event.target;
	//! 自动聚焦，同时去掉前后空格
	target.value = target.value.trim();
	target.focus();
	target.selectionStart = target.value.length;
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
				object-fit: cover;
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

