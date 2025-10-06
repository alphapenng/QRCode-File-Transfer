const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

/**
 * 注册文件相关的 IPC 处理器
 */
function registerFileHandlers() {
  /**
   * 文件选择对话框
   */
  ipcMain.handle('file:select', async (event) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: '所有文件', extensions: ['*'] },
          { name: '文本文件', extensions: ['txt', 'md', 'json'] },
          { name: 'Office 文档', extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] },
          { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] }
        ]
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      const stats = await fs.stat(filePath);
      
      // 检查文件大小（1MB = 1048576 字节）
      const maxSize = 1048576; // 1MB
      if (stats.size > maxSize) {
        return {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: `文件大小超过限制（最大 1MB），当前文件大小：${(stats.size / 1024 / 1024).toFixed(2)}MB`
        };
      }

      return {
        success: true,
        filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        fileType: path.extname(filePath)
      };
    } catch (error) {
      console.error('File select error:', error);
      return {
        success: false,
        error: 'FILE_SELECT_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 读取文件内容
   */
  ipcMain.handle('file:read', async (event, filePath) => {
    try {
      // 验证文件路径
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }

      // 读取文件
      const buffer = await fs.readFile(filePath);
      
      return {
        success: true,
        data: buffer,
        size: buffer.length
      };
    } catch (error) {
      console.error('File read error:', error);
      return {
        success: false,
        error: 'FILE_READ_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 文件保存对话框
   */
  ipcMain.handle('file:save-dialog', async (event, defaultFileName) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultFileName || 'untitled',
        filters: [
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      return {
        success: true,
        filePath: result.filePath
      };
    } catch (error) {
      console.error('Save dialog error:', error);
      return {
        success: false,
        error: 'SAVE_DIALOG_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 保存文件
   */
  ipcMain.handle('file:save', async (event, { filePath, data }) => {
    try {
      // 验证参数
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }

      if (!data) {
        throw new Error('No data to save');
      }

      // 将 ArrayBuffer 转换为 Buffer
      const buffer = Buffer.from(data);

      // 写入文件
      await fs.writeFile(filePath, buffer);

      return {
        success: true,
        filePath,
        size: buffer.length
      };
    } catch (error) {
      console.error('File save error:', error);
      return {
        success: false,
        error: 'FILE_SAVE_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 获取文件信息
   */
  ipcMain.handle('file:info', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        info: {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory()
        }
      };
    } catch (error) {
      console.error('File info error:', error);
      return {
        success: false,
        error: 'FILE_INFO_ERROR',
        message: error.message
      };
    }
  });
}

/**
 * 注销文件相关的 IPC 处理器
 */
function unregisterFileHandlers() {
  ipcMain.removeHandler('file:select');
  ipcMain.removeHandler('file:read');
  ipcMain.removeHandler('file:save-dialog');
  ipcMain.removeHandler('file:save');
  ipcMain.removeHandler('file:info');
}

module.exports = {
  registerFileHandlers,
  unregisterFileHandlers
};

