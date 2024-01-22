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
import { bridgeEvent } from './constant'
import log from 'electron-log/main'
import Logger from './logger'

log.initialize()
let logger = new Logger(log, 'main process')
let mainWindow = null
let cutWindow = null
let checkMouseMoveTimer = null

function closeCutWindow() {
  cutWindow && cutWindow.close()
  cutWindow = null
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 490,
    height: 600,
    show: true,
    autoHideMenuBar: false,
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

  let url = ''
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    url = process.env['ELECTRON_RENDERER_URL']
    mainWindow.loadURL(url)
    logger.info('mainWindow: loadURL=', url)
  } else {
    url = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(url)
    logger.info('mainWindow: loadFile=', url)
  }

  mainWindow.on('closed', () => {
    closeCutWindow()
  })
}

function registerShortcut() {
  logger.info('registerShortcut')
  //! 截图快捷键
  globalShortcut.register('CommandOrControl+Alt+C', () => {
    enterScreenCut()
  })
  globalShortcut.register('Esc', () => {
    closeCutWindow()
    mainWindow.show()
  })
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

function getSize(currentScreen) {
  const { size, scaleFactor } = currentScreen
  return {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  }
}

function createCutWindow(currentScreen) {
  const { width, height } = getSize(currentScreen)
  const { bounds } = currentScreen
  cutWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
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
    parent: mainWindow,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    let url = process.env['ELECTRON_RENDERER_URL'] + '/#/cut'
    cutWindow.loadURL(url)
    logger.info('createCutWindow: loadURL=', url)
  } else {
    let url = join(__dirname, '../renderer/index.html')
    cutWindow.loadFile(url, {
      hash: '#cut'
    })
    logger.info('createCutWindow: loadFile=', url)
  }

  cutWindow.on('ready-to-show', () => {
    cutWindow.maximize()
    cutWindow.setFullScreen(true)
    cutWindow.show()
    globalShortcut.register('Enter', confirmCutScreenRegion)
  })

  return cutWindow
}

function confirmCutScreenRegion() {
  cutWindow && cutWindow.webContents.send(bridgeEvent.CONFIRM_CUT_SCREEN_REGION)
}

function createCutWindowByCursorPos() {
  const cursorPos = screen.getCursorScreenPoint()
  //! 获取光标所在的屏幕
  const currentScreen = screen.getDisplayNearestPoint(cursorPos)
  if (cutWindow == null) {
    cutWindow = createCutWindow(currentScreen)
    return
  }
  //! 获取截图窗口屏幕
  const windowScreen = screen.getDisplayMatching(cutWindow.getBounds())
  //! 如果光标所在屏幕与cutWindow 不是同一个屏幕就将cutWindow销毁，然后在光标屏幕创建cutWindow
  if (currentScreen.id !== windowScreen.id) {
    cutWindow.destroy()
    cutWindow = createCutWindow(currentScreen)
  }
}

function startCheckMouseMove() {
  checkMouseMoveTimer = setInterval(createCutWindowByCursorPos, 500)
}

function stopCheckMouseMove() {
  if (checkMouseMoveTimer) {
    clearInterval(checkMouseMoveTimer)
    checkMouseMoveTimer = null
  }
}

function enterScreenCut() {
  mainWindow.hide()
  stopCheckMouseMove()
  startCheckMouseMove()
}

function openMainListener() {
  ipcMain.on(bridgeEvent.ENTER_SCREEN_CUT, enterScreenCut)
  ipcMain.on(bridgeEvent.CUT_CURRENT_SCREEN, async (e) => {
    logger.info('CUT_CURRENT_SCREEN')
    const cursorPos = screen.getCursorScreenPoint()
    const currentScreen = screen.getDisplayNearestPoint(cursorPos)
    let sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: getSize(currentScreen)
    })
    if (cutWindow) {
      let matchSource = sources.find((it) => it.display_id == currentScreen.id)
      logger.info('send matchSource')
      e.sender.send(bridgeEvent.GET_CURRENT_SCREEN_IMAGE, matchSource)
    }
  })
  ipcMain.on(bridgeEvent.FINISH_CUT_SCREEN_REGION, async (e, cutInfo) => {
    closeCutWindow()
    logger.info('FINISH_CUT_SCREEN_REGION')
    mainWindow.webContents.send(bridgeEvent.GET_CUT_IMAGE_INFO, cutInfo)
    mainWindow.show()
  })
  ipcMain.on(bridgeEvent.STOP_CHECK_MOUSE_MOVE, () => {
    stopCheckMouseMove()
  })
  ipcMain.on(bridgeEvent.EXIT_SCREEN_CUT, async (e) => {
    closeCutWindow()
    mainWindow.show()
  })
}
