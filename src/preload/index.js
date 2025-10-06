/*
 * @Description: Electron Preload 脚本
 * @Author: alphapenng
 * @Github:
 * @Date: 2025-10-06 00:21:49
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-06 11:14:05
 * @FilePath: \qrcode-app\src\preload\index.js
 */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * 通过 contextBridge 暴露安全的 API 给渲染进程
 * 所有 API 都经过验证，确保安全性
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== 版本信息 ====================
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // ==================== 文件操作 API ====================
  file: {
    /**
     * 打开文件选择对话框
     * @returns {Promise<{success: boolean, filePath?: string, fileName?: string, fileSize?: number, fileType?: string, error?: string, message?: string}>}
     */
    select: () => ipcRenderer.invoke('file:select'),

    /**
     * 读取文件内容
     * @param {string} filePath - 文件路径
     * @returns {Promise<{success: boolean, data?: ArrayBuffer, size?: number, error?: string, message?: string}>}
     */
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),

    /**
     * 打开保存对话框
     * @param {string} defaultFileName - 默认文件名
     * @returns {Promise<{success: boolean, filePath?: string, error?: string, message?: string}>}
     */
    saveDialog: (defaultFileName) => ipcRenderer.invoke('file:save-dialog', defaultFileName),

    /**
     * 保存文件
     * @param {Object} options - 保存选项
     * @param {string} options.filePath - 文件路径
     * @param {ArrayBuffer} options.data - 文件数据
     * @returns {Promise<{success: boolean, filePath?: string, size?: number, error?: string, message?: string}>}
     */
    save: (options) => ipcRenderer.invoke('file:save', options),

    /**
     * 获取文件信息
     * @param {string} filePath - 文件路径
     * @returns {Promise<{success: boolean, info?: Object, error?: string, message?: string}>}
     */
    info: (filePath) => ipcRenderer.invoke('file:info', filePath)
  },

  // ==================== 传输相关 API ====================
  transfer: {
    /**
     * 发送进度更新
     * @param {Object} progress - 进度信息
     * @returns {Promise<{success: boolean}>}
     */
    sendProgress: (progress) => ipcRenderer.invoke('transfer:send-progress', progress),

    /**
     * 接收进度更新
     * @param {Object} progress - 进度信息
     * @returns {Promise<{success: boolean}>}
     */
    receiveProgress: (progress) => ipcRenderer.invoke('transfer:receive-progress', progress),

    /**
     * 传输完成通知
     * @param {Object} data - 完成数据
     * @returns {Promise<{success: boolean}>}
     */
    complete: (data) => ipcRenderer.invoke('transfer:complete', data),

    /**
     * 传输错误通知
     * @param {Object} errorData - 错误数据
     * @returns {Promise<{success: boolean}>}
     */
    error: (errorData) => ipcRenderer.invoke('transfer:error', errorData),

    /**
     * 取消传输
     * @returns {Promise<{success: boolean}>}
     */
    cancel: () => ipcRenderer.invoke('transfer:cancel'),

    /**
     * 监听进度更新事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onProgressUpdate: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('transfer:progress-update', listener);
      return () => ipcRenderer.removeListener('transfer:progress-update', listener);
    },

    /**
     * 监听传输完成事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onComplete: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('transfer:complete', listener);
      return () => ipcRenderer.removeListener('transfer:complete', listener);
    },

    /**
     * 监听传输错误事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onError: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('transfer:error', listener);
      return () => ipcRenderer.removeListener('transfer:error', listener);
    },

    /**
     * 监听传输取消事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onCancelled: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('transfer:cancelled', listener);
      return () => ipcRenderer.removeListener('transfer:cancelled', listener);
    }
  },

  // ==================== 系统相关 API ====================
  system: {
    /**
     * 获取应用版本信息
     * @returns {Promise<{success: boolean, version?: string, name?: string, electron?: string, chrome?: string, node?: string}>}
     */
    getVersion: () => ipcRenderer.invoke('system:get-version'),

    /**
     * 获取应用路径
     * @param {string} name - 路径名称 (home, appData, userData, temp, exe, desktop, documents, downloads, music, pictures, videos)
     * @returns {Promise<{success: boolean, path?: string}>}
     */
    getPath: (name) => ipcRenderer.invoke('system:get-path', name),

    /**
     * 在文件管理器中显示文件
     * @param {string} fullPath - 文件完整路径
     * @returns {Promise<{success: boolean}>}
     */
    showItemInFolder: (fullPath) => ipcRenderer.invoke('system:show-item-in-folder', fullPath),

    /**
     * 在默认浏览器中打开 URL
     * @param {string} url - URL 地址
     * @returns {Promise<{success: boolean}>}
     */
    openExternal: (url) => ipcRenderer.invoke('system:open-external', url)
  },

  // ==================== 配置管理 API ====================
  config: {
    /**
     * 获取配置项
     * @param {string} key - 配置键（支持点号路径，如 'window.width'）
     * @returns {Promise<{success: boolean, value?: any}>}
     */
    get: (key) => ipcRenderer.invoke('config:get', key),

    /**
     * 设置配置项
     * @param {string} key - 配置键
     * @param {any} value - 配置值
     * @returns {Promise<{success: boolean}>}
     */
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),

    /**
     * 获取所有配置
     * @returns {Promise<{success: boolean, config?: Object}>}
     */
    getAll: () => ipcRenderer.invoke('config:get-all'),

    /**
     * 重置配置
     * @returns {Promise<{success: boolean}>}
     */
    reset: () => ipcRenderer.invoke('config:reset'),

    /**
     * 添加最近使用的文件
     * @param {string} filePath - 文件路径
     * @returns {Promise<{success: boolean}>}
     */
    addRecentFile: (filePath) => ipcRenderer.invoke('config:add-recent-file', filePath),

    /**
     * 获取最近使用的文件列表
     * @returns {Promise<{success: boolean, files?: string[]}>}
     */
    getRecentFiles: () => ipcRenderer.invoke('config:get-recent-files'),

    /**
     * 清除最近使用的文件列表
     * @returns {Promise<{success: boolean}>}
     */
    clearRecentFiles: () => ipcRenderer.invoke('config:clear-recent-files')
  }
});

// 监听来自主进程的消息
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Preload script loaded');
  console.log('📦 Node version:', process.versions.node);
  console.log('🌐 Chrome version:', process.versions.chrome);
  console.log('⚡ Electron version:', process.versions.electron);
});

