import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  screen,
  desktopCapturer,
  globalShortcut
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow
let cutWindow

function closeCutWindow() {
  cutWindow && cutWindow.close()
  cutWindow = null
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  console.log('loadURL:', process.env['ELECTRON_RENDERER_URL'])

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    closeCutWindow()
  })
}

function registerShortcut() {
  //! 截图快捷键
  globalShortcut.register('CommandOrControl+Alt+C', () => {
    openCutScreen()
  })
  globalShortcut.register('Esc', () => {
    closeCutWindow()
    mainWindow.show()
  })
  globalShortcut.register('Enter', sendFinishCut)
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  //! 开发模式：win 环境F12 和 mac os 环境：CommandOrControl + R 打开 DevTools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow()
  registerShortcut()
  openMainListener()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

function getSize() {
  const { size, scaleFactor } = screen.getPrimaryDisplay()
  return {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  }
}

function createCutWindow() {
  const { width, height } = getSize()
  cutWindow = new BrowserWindow({
    width,
    height,
    autoHideMenuBar: true,
    useContentSize: true,
    movable: false,
    frame: false,
    resizable: false,
    hasShadow: false,
    transparent: true,
    fullscreenable: true,
    fullscreen: true,
    simpleFullscreen: true,
    alwaysOnTop: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  console.log('createCutWindow:', is.dev, process.env['ELECTRON_RENDERER_URL'])

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    let url = process.env['ELECTRON_RENDERER_URL'] + '/#/cut'
    console.log('createCutWindow: loadURL=', url)
    cutWindow.loadURL(url)
  } else {
    cutWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  cutWindow.maximize()
  cutWindow.setFullScreen(true)
}

function sendFinishCut() {
  cutWindow && cutWindow.webContents.send('FINISH_CUT')
}

function openCutScreen() {
  closeCutWindow()
  mainWindow.hide()
  createCutWindow()
  cutWindow.show()
}

function openMainListener() {
  ipcMain.on('OPEN_CUT_SCREEN', openCutScreen)
  ipcMain.on('SHOW_CUT_SCREEN', async (e) => {
    //TODO:
    let sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: getSize()
    })
    cutWindow && cutWindow.webContents.send('GET_SCREEN_IMAGE', sources[0])
  })
  ipcMain.on('FINISH_CUT_SCREEN', async (e, cutInfo) => {
    closeCutWindow()
    mainWindow.webContents.send('GET_CUT_INFO', cutInfo)
    mainWindow.show()
  })
  ipcMain.on('CLOSE_CUT_SCREEN', async (e) => {
    closeCutWindow()
    mainWindow.show()
  })
}
