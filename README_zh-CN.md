# qrcode-tools

简体中文 | [English](./README.md)

非常适合新手入门Electron的学习项目，它是一款简单好用的二维码识别工具(基于:Electron + Vue实现),虽然它很小但是基本囊括Electron项目开发的全部流程。

## 🛠️ 推荐配置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 🖥️ 快速开始

### 安装

```bash
$ yarn
```

### 开发

```bash
$ yarn dev
```

### 构建

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## ✨ 特性
- 截图识别二维码
- 上传识别二维码
- 根据字符生成二维码

## 🎯 效果
- 截图识别二维码
  ![截图识别二维码](./docs/截图识别二维码.gif)

- 上传识别二维码
  ![上传识别二维码](./docs/上传识别二维码.gif)

-根据字符生成二维码
  ![根据字符生成二维码](./docs/根据字符生成二维码.gif)

## 📝 TODO
- [x] 支持多屏截图
- [x] 支持截图识别二维码
- [x] 根据内容生成二维码
- [x] 支持上传图片识别二维码
- [x] 支持修改快捷键操作
- [x] 支持自动检测更新
- [x] 更换图标

## 📸 截图实现流程
![](./docs/截图过程.png)

## 📚 使用说明
- 快捷键
  - 截图：Ctrl + Alt + C (默认快捷键)
  - 退出：Esc
- 完成截图：鼠标双击

