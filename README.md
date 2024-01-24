# qrcode-tools

A screenshot tool implemented based on Electron + Vue

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Effect
![](./docs/effect-1.gif)

## TODO
- [x] 支持多屏截图
- [x] 支持截图识别二维码
- [x] 根据内容生成二维码
- [x] 支持上传图片识别二维码
- [ ] 支持修改快捷键操作
- [ ] 支持自动检测更新

## 截图实现流程
![](./docs/截图过程.png)


## 使用说明
- 快捷键
  - 截图：Ctrl + Alt + C
  - 退出：Esc
- 完成截图：鼠标双击

