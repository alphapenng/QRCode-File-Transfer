/*
 * @Description: 
 * @Author: alphapenng
 * @Github: 
 * @Date: 2025-10-06 00:21:49
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-06 00:25:24
 * @FilePath: \qrcode-app\src\main\index.js
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // 安全配置 - 将在任务 1.1.5 中完善
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
    // 窗口样式
    backgroundColor: '#ffffff',
    show: false, // 先隐藏，等待加载完成
    autoHideMenuBar: true
  });

  // 开发环境：加载 Vite 开发服务器
  // 生产环境：加载打包后的文件
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron 初始化完成后创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 特定：点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出前的清理工作
app.on('before-quit', () => {
  // 清理工作将在后续任务中添加
});

// 开发环境：监听文件变化
if (process.env.VITE_DEV_SERVER_URL) {
  // 热重载支持
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../../node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

