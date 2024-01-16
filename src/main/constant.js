/**
 * ipcRenderer与ipcMain通信事件
 */
export const bridgeEvent = {
  /** Home Page ipcRenderer to ipcMain: 进入屏幕截图 */
  ENTER_SCREEN_CUT: 'ENTER_SCREEN_CUT',
  /** Cut Page ipcRenderer to ipcMain: 截取当前屏幕 */
  CUT_CURRENT_SCREEN: 'CUT_CURRENT_SCREEN',
  /** Cut Page ipcRenderer to ipcMain: 获取当前屏幕截图 */
  GET_CURRENT_SCREEN_IMAGE: 'GET_CURRENT_SCREEN_IMAGE',
  /** ipcMain to Cut Page ipcRenderer: 确认屏幕裁剪区域 */
  CONFIRM_CUT_SCREEN_REGION: 'CONFIRM_CUT_SCREEN_REGION',
  /** Cut Page ipcRender to ipcMain: 完成屏幕裁剪区域 */
  FINISH_CUT_SCREEN_REGION: 'FINISH_CUT_SCREEN_REGION',
  /** ipcMain to Home Page ipcRender: 获取屏幕裁剪区域截图 */
  GET_CUT_IMAGE_INFO: 'GET_CUT_IMAGE_INFO',
  /** Cut Page ipcRender to ipcMain: 停止检查鼠标移动  */
  STOP_CHECK_MOUSE_MOVE: 'STOP_CHECK_MOUSE_MOVE',
  /** ipcMain: 退出屏幕截图 */
  EXIT_SCREEN_CUT: 'EXIT_SCREEN_CUT'
}
