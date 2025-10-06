const { ipcMain, app, shell } = require('electron');
const configManager = require('../config');

/**
 * 注册系统相关的 IPC 处理器
 */
function registerSystemHandlers() {
  /**
   * 获取应用版本信息
   */
  ipcMain.handle('system:get-version', async () => {
    try {
      return {
        success: true,
        version: app.getVersion(),
        name: app.getName(),
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node
      };
    } catch (error) {
      console.error('Get version error:', error);
      return {
        success: false,
        error: 'GET_VERSION_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 获取应用路径
   */
  ipcMain.handle('system:get-path', async (event, name) => {
    try {
      const pathValue = app.getPath(name);
      return {
        success: true,
        path: pathValue
      };
    } catch (error) {
      console.error('Get path error:', error);
      return {
        success: false,
        error: 'GET_PATH_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 在文件管理器中显示文件
   */
  ipcMain.handle('system:show-item-in-folder', async (event, fullPath) => {
    try {
      shell.showItemInFolder(fullPath);
      return { success: true };
    } catch (error) {
      console.error('Show item in folder error:', error);
      return {
        success: false,
        error: 'SHOW_ITEM_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 在默认浏览器中打开 URL
   */
  ipcMain.handle('system:open-external', async (event, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Open external error:', error);
      return {
        success: false,
        error: 'OPEN_EXTERNAL_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 获取配置
   */
  ipcMain.handle('config:get', async (event, key) => {
    try {
      const value = configManager.get(key);
      return {
        success: true,
        value
      };
    } catch (error) {
      console.error('Get config error:', error);
      return {
        success: false,
        error: 'GET_CONFIG_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 设置配置
   */
  ipcMain.handle('config:set', async (event, key, value) => {
    try {
      configManager.set(key, value);
      await configManager.save();
      return { success: true };
    } catch (error) {
      console.error('Set config error:', error);
      return {
        success: false,
        error: 'SET_CONFIG_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 获取所有配置
   */
  ipcMain.handle('config:get-all', async () => {
    try {
      const config = configManager.getAll();
      return {
        success: true,
        config
      };
    } catch (error) {
      console.error('Get all config error:', error);
      return {
        success: false,
        error: 'GET_ALL_CONFIG_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 重置配置
   */
  ipcMain.handle('config:reset', async () => {
    try {
      await configManager.reset();
      return { success: true };
    } catch (error) {
      console.error('Reset config error:', error);
      return {
        success: false,
        error: 'RESET_CONFIG_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 添加最近使用的文件
   */
  ipcMain.handle('config:add-recent-file', async (event, filePath) => {
    try {
      configManager.addRecentFile(filePath);
      await configManager.save();
      return { success: true };
    } catch (error) {
      console.error('Add recent file error:', error);
      return {
        success: false,
        error: 'ADD_RECENT_FILE_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 获取最近使用的文件
   */
  ipcMain.handle('config:get-recent-files', async () => {
    try {
      const files = configManager.getRecentFiles();
      return {
        success: true,
        files
      };
    } catch (error) {
      console.error('Get recent files error:', error);
      return {
        success: false,
        error: 'GET_RECENT_FILES_ERROR',
        message: error.message
      };
    }
  });

  /**
   * 清除最近使用的文件
   */
  ipcMain.handle('config:clear-recent-files', async () => {
    try {
      configManager.clearRecentFiles();
      await configManager.save();
      return { success: true };
    } catch (error) {
      console.error('Clear recent files error:', error);
      return {
        success: false,
        error: 'CLEAR_RECENT_FILES_ERROR',
        message: error.message
      };
    }
  });
}

/**
 * 注销系统相关的 IPC 处理器
 */
function unregisterSystemHandlers() {
  ipcMain.removeHandler('system:get-version');
  ipcMain.removeHandler('system:get-path');
  ipcMain.removeHandler('system:show-item-in-folder');
  ipcMain.removeHandler('system:open-external');
  ipcMain.removeHandler('config:get');
  ipcMain.removeHandler('config:set');
  ipcMain.removeHandler('config:get-all');
  ipcMain.removeHandler('config:reset');
  ipcMain.removeHandler('config:add-recent-file');
  ipcMain.removeHandler('config:get-recent-files');
  ipcMain.removeHandler('config:clear-recent-files');
}

module.exports = {
  registerSystemHandlers,
  unregisterSystemHandlers
};

