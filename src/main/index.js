import { app, BrowserWindow, screen, globalShortcut, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import run from './autoUpdater'
import { useMainWin, useCutWin, useShortcutWin } from './window'
import { shortcutKeys, bridgeEvent } from './constant'
import { useStore } from './store'

const { createMainWin, showMainWin } = useMainWin()
const { createCutWin } = useCutWin()
const store = useStore()
useShortcutWin()

log.initialize()
let checkMouseMoveTimer = null
let { checkForUpdatesAndNotify } = run(onUpdateMessage)
let mainWin = null

function onUpdateMessage(msg) {
  log.info(msg)
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

  mainWin = createMainWin()

  function updateShortcutKey(event, oldKey, newKey) {
    log.info("updateShortcutKey: ", `oldKey=${oldKey},newKey=${newKey}`)
    globalShortcut.unregister(oldKey);
    globalShortcut.register(newKey, enterScreenCut);
  }

  ipcMain.on(bridgeEvent.STOP_CHECK_MOUSE_MOVE, stopCheckMouseMove)
  ipcMain.on(bridgeEvent.ENTER_SCREEN_CUT, enterScreenCut)
  ipcMain.on(bridgeEvent.UPDATE_SHORTCUT_KEY, updateShortcutKey);
  globalShortcut.register(store.get(shortcutKeys.shortcut_snapshot), enterScreenCut)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin = createMainWin()
    }
  })

  checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

function startCheckMouseMove() {
  let cutWindow = null
  function createCutWindowByCursorPos() {
    const cursorPos = screen.getCursorScreenPoint()
    //! 获取光标所在的屏幕
    const currentScreen = screen.getDisplayNearestPoint(cursorPos)
    if (cutWindow == null) {
      cutWindow = createCutWin(mainWin, currentScreen, exitScreenCut)
      return
    }
    //! 获取截图窗口屏幕
    const windowScreen = screen.getDisplayMatching(cutWindow.getBounds())
    //! 如果光标所在屏幕与cutWindow 不是同一个屏幕就将cutWindow销毁，然后在光标屏幕创建cutWindow
    if (currentScreen.id !== windowScreen.id) {
      cutWindow.destroy()
      cutWindow = createCutWin(mainWin, currentScreen, exitScreenCut)
    }
  }

  checkMouseMoveTimer = setInterval(createCutWindowByCursorPos, 200)
}

function stopCheckMouseMove() {
  if (checkMouseMoveTimer) {
    clearInterval(checkMouseMoveTimer)
    checkMouseMoveTimer = null
  }
}

function enterScreenCut() {
  stopCheckMouseMove()
  startCheckMouseMove()
}

function exitScreenCut() {
  stopCheckMouseMove()
  showMainWin()
}
