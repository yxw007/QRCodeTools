import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  screen,
  desktopCapturer,
  globalShortcut,
  Menu,
  nativeImage
} from 'electron'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import defaultMenu from './appMenu'
import Logger from './logger'
import { bridgeEvent } from './constant'
import appIcon from "../../resources/icon.png?asset"
import fs from "fs";
import { default as path, dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagePath = path.join(__dirname, '../../package.json')
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))

let logger = new Logger(log, 'main process')

function getSize(currentScreen) {
  const { size, scaleFactor } = currentScreen
  return {
    width: size.width * scaleFactor,
    height: size.height * scaleFactor
  }
}

function preventUpdateWinTitle(win) {
  win.on('page-title-updated', function (e) {
    e.preventDefault()
  });
}

export function useMainWin() {
  let mainWindow = null

  function createMainWin() {
    mainWindow = new BrowserWindow({
      width: 490,
      height: 600,
      show: true,
      autoHideMenuBar: false,
      icon: nativeImage.createFromPath(appIcon),
      title: packageData.name,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    preventUpdateWinTitle(mainWindow);
    const menuTemplate = defaultMenu(app, shell)
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

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

    startMainWinListener()

    return mainWindow
  }

  function showMainWin() {
    if (mainWindow) {
      mainWindow.show()
    }
  }

  function hideMainWin() {
    if (mainWindow) {
      mainWindow.hide()
    }
  }

  function startMainWinListener() {
    ipcMain.on(bridgeEvent.ENTER_SCREEN_CUT, hideMainWin)
    ipcMain.on(bridgeEvent.FINISH_CUT_SCREEN_REGION, async (e, cutInfo) => {
      logger.info('FINISH_CUT_SCREEN_REGION')
      mainWindow.webContents.send(bridgeEvent.GET_CUT_IMAGE_INFO, cutInfo)
      mainWindow.show()
    })
    ipcMain.on(bridgeEvent.EXIT_SCREEN_CUT, async () => {
      mainWindow.show()
    })
  }

  return {
    createMainWin,
    showMainWin,
    hideMainWin,
    startMainWinListener
  }
}

export function useCutWin() {
  let cutWindow = null

  function createCutWin(parent, currentScreen, exitScreenCut) {
    destroyCutWin()
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
      parent: parent,
      icon: nativeImage.createFromPath(appIcon),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    cutWindow.on('focus', () => {
      globalShortcut.register('Esc', () => {
        exitScreenCut()
        destroyCutWin()
      })
    })

    cutWindow.on('blur', () => {
      globalShortcut.unregister('Esc')
    })
    ipcMain.on(bridgeEvent.FINISH_CUT_SCREEN_REGION, async (e, cutInfo) => {
      destroyCutWin()
    })
    startCutWinListener()

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
    })

    return cutWindow
  }

  function destroyCutWin() {
    if (cutWindow) {
      cutWindow.destroy()
      cutWindow = null
    }
  }

  function closeCutWin() {
    cutWindow && cutWindow.close()
    cutWindow = null
  }

  function startCutWinListener() {
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
  }

  return {
    createCutWin,
    closeCutWin,
    destroyCutWin,
    startCutWinListener
  }
}

export function useShortcutWin() {
  ipcMain.removeAllListeners(bridgeEvent.OPEN_SHORTCUT_WINDOW)
  ipcMain.removeAllListeners(bridgeEvent.CLOSE_SHORTCUT_WINDOW)
  ipcMain.on(bridgeEvent.OPEN_SHORTCUT_WINDOW, openShortcutWin)
  ipcMain.on(bridgeEvent.CLOSE_SHORTCUT_WINDOW, closeShortcutWin)

  let shortcutWin = null

  function closeShortcutWin() {
    if (shortcutWin) {
      shortcutWin.destroy()
      shortcutWin = null
    }
  }

  function openShortcutWin() {
    if (shortcutWin == null) {
      shortcutWin = new BrowserWindow({
        width: 460,
        height: 160,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        resizable: false,
        minimizable: false,
        title: '修改快捷键',
        icon: nativeImage.createFromPath(appIcon),
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      //! 阻止页面标题名替换窗口标题名
      preventUpdateWinTitle(shortcutWin);
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        let url = process.env['ELECTRON_RENDERER_URL'] + '/#/shortcut'
        shortcutWin.loadURL(url)
        logger.info('openShortcutWin: loadURL=', url)
      } else {
        let url = join(__dirname, '../renderer/index.html')
        shortcutWin.loadFile(url, {
          hash: '#shortcut'
        })
        logger.info('openShortcutWin: loadFile=', url)
      }
    }
    shortcutWin.on('closed', closeShortcutWin)
  }

  return {}
}
