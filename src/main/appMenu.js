import { dialog, ipcMain } from 'electron'
import log from 'electron-log/main'
import Logger from './logger'
import path from 'path'
import fs from 'fs'
import { versionDesc } from './autoUpdater'
import { bridgeEvent } from './constant'

let logger = new Logger(log, 'main process')

function defaultMenu(app, shell) {
  const template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function () {
            if (process.platform === 'darwin') return 'Ctrl+Command+F'
            else return 'F11'
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function () {
            if (process.platform === 'darwin') return 'Alt+Command+I'
            else return 'Ctrl+Shift+I'
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow) focusedWindow.toggleDevTools()
          }
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'about',
          click: openAbout
        },
        {
          label: 'shortcut',
          click: () => {
            ipcMain.emit(bridgeEvent.OPEN_SHORTCUT_WINDOW)
          }
        }
      ]
    }
  ]

  return template
}

function openAbout() {
  logger.info('open about')
  const packagePath = path.join(__dirname, '../../package.json')
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  const dialogOptions = {
    type: 'info',
    title: 'About',
    message: `Author: ${packageData.author}\nVersion: ${packageData.version} (${versionDesc()})`,
    buttons: ['OK']
  }
  dialog.showMessageBox(dialogOptions)
}

export default defaultMenu
