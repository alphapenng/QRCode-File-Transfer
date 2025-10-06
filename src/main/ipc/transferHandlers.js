const { ipcMain } = require('electron');

/**
 * 注册传输相关的 IPC 处理器
 */
function registerTransferHandlers(mainWindow) {
  /**
   * 发送进度更新
   */
  ipcMain.handle('transfer:send-progress', async (event, progress) => {
    try {
      // 向渲染进程发送进度更新
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transfer:progress-update', progress);
      }

      return { success: true };
    } catch (error) {
      console.error('Send progress error:', error);
      return {
        success: false,
        error: 'SEND_PROGRESS_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 接收进度更新
   */
  ipcMain.handle('transfer:receive-progress', async (event, progress) => {
    try {
      // 向渲染进程发送进度更新
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transfer:progress-update', progress);
      }

      return { success: true };
    } catch (error) {
      console.error('Receive progress error:', error);
      return {
        success: false,
        error: 'RECEIVE_PROGRESS_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 传输完成通知
   */
  ipcMain.handle('transfer:complete', async (event, data) => {
    try {
      // 向渲染进程发送完成通知
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transfer:complete', data);
      }

      return { success: true };
    } catch (error) {
      console.error('Transfer complete error:', error);
      return {
        success: false,
        error: 'TRANSFER_COMPLETE_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 传输错误通知
   */
  ipcMain.handle('transfer:error', async (event, errorData) => {
    try {
      // 向渲染进程发送错误通知
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transfer:error', errorData);
      }

      return { success: true };
    } catch (error) {
      console.error('Transfer error notification error:', error);
      return {
        success: false,
        error: 'TRANSFER_ERROR_NOTIFICATION_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 取消传输
   */
  ipcMain.handle('transfer:cancel', async (event) => {
    try {
      // 向渲染进程发送取消通知
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('transfer:cancelled');
      }

      return { success: true };
    } catch (error) {
      console.error('Transfer cancel error:', error);
      return {
        success: false,
        error: 'TRANSFER_CANCEL_ERROR',
        message: error.message
      };
    }
  });
}

/**
 * 注销传输相关的 IPC 处理器
 */
function unregisterTransferHandlers() {
  ipcMain.removeHandler('transfer:send-progress');
  ipcMain.removeHandler('transfer:receive-progress');
  ipcMain.removeHandler('transfer:complete');
  ipcMain.removeHandler('transfer:error');
  ipcMain.removeHandler('transfer:cancel');
}

module.exports = {
  registerTransferHandlers,
  unregisterTransferHandlers
};

