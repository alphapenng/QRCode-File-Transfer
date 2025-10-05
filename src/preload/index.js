const { contextBridge, ipcRenderer } = require('electron');

// 通过 contextBridge 暴露安全的 API 给渲染进程
// 详细的 API 将在任务 1.1.6 中实现
contextBridge.exposeInMainWorld('electronAPI', {
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // 占位符 API - 将在后续任务中实现
  // 文件操作 API
  file: {
    select: () => console.log('File select API - to be implemented'),
    save: () => console.log('File save API - to be implemented')
  },

  // 传输 API
  transfer: {
    send: () => console.log('Transfer send API - to be implemented'),
    receive: () => console.log('Transfer receive API - to be implemented')
  }
});

// 监听来自主进程的消息
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded');
  console.log('Node version:', process.versions.node);
  console.log('Chrome version:', process.versions.chrome);
  console.log('Electron version:', process.versions.electron);
});

