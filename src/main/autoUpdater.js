import { dialog } from 'electron'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
let isNewest = true
let newestVersion = null

function normalSpeed(bytesPerSecond) {
  let units = [1, 2 ** 10, 2 ** 20, 2 ** 30, 2 ** 40]
  let unitNames = ['b', 'kb', 'mb', 'gb', 'tb']
  let idx = 0
  while (idx + 1 < units.length && bytesPerSecond > units[idx + 1]) {
    idx = idx + 1
  }
  let value = (bytesPerSecond / units[idx]).toFixed(2)
  let name = unitNames[idx]
  return `${value}${name}/s`
}

function normalSpeedPercent(percent) {
  return `${percent.toFixed(2)}%`
}

function run(onMessage) {
  log.info('App starting...')

  autoUpdater.on('checking-for-update', () => {
    onMessage('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    onMessage('Update available.')
    isNewest = false
    newestVersion = info.version
  })
  autoUpdater.on('update-not-available', (info) => {
    onMessage('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    onMessage('Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + normalSpeed(progressObj.bytesPerSecond)
    log_message = log_message + ' - Downloaded ' + normalSpeedPercent(progressObj.percent)
    onMessage(log_message)
  })
  autoUpdater.on('update-downloaded', () => {
    onMessage('Update downloaded')
    const optionIdx = dialog.showMessageBoxSync({
      type: 'info',
      title: 'Update',
      message: '发现新版本，点击确认Ok更新',
      buttons: ['OK']
    })
    if (optionIdx == 0) {
      onMessage('quitAndInstall')
      //! 下载完后立即更新
      autoUpdater.quitAndInstall()
    }
  })

  return { checkForUpdatesAndNotify: autoUpdater.checkForUpdatesAndNotify.bind(autoUpdater) }
}

export default run

export function versionDesc() {
  if (isNewest) {
    return `已是最新版本`
  }
  return `发现新版本${newestVersion}`
}
