/*
 * @Description: Electron 主进程
 * @Author: alphapenng
 * @Github:
 * @Date: 2025-10-06 00:21:49
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-06 13:32:38
 * @FilePath: \qrcode-app\src\main\index.js
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerFileHandlers, unregisterFileHandlers } = require('./ipc/fileHandlers');
const { registerTransferHandlers, unregisterTransferHandlers } = require('./ipc/transferHandlers');
const { registerSystemHandlers, unregisterSystemHandlers } = require('./ipc/systemHandlers');
const configManager = require('./config');

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow = null;

/**
 * 创建主窗口
 */
function createWindow() {
  // 从配置中获取窗口位置和大小
  const windowConfig = configManager.get('window', {
    width: 1000,
    height: 700,
    x: undefined,
    y: undefined
  });

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: windowConfig.width || 1000,
    height: windowConfig.height || 700,
    x: windowConfig.x,
    y: windowConfig.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // 安全配置
      contextIsolation: true,        // 启用上下文隔离
      nodeIntegration: false,         // 禁用 Node.js 集成
      sandbox: true,                  // 启用沙箱
      webSecurity: true,              // 启用 Web 安全
      allowRunningInsecureContent: false,  // 禁止运行不安全内容
      preload: path.join(__dirname, '../preload/index.js')
    },
    // 窗口样式
    backgroundColor: '#ffffff',
    show: false,                      // 先隐藏，等待加载完成
    autoHideMenuBar: true,            // 自动隐藏菜单栏
    title: '码上传报',
    icon: path.join(__dirname, '../../assets/icon.png')  // 应用图标（如果存在）
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

  // 窗口关闭前保存窗口状态
  mainWindow.on('close', () => {
    // 保存窗口位置和大小
    const bounds = mainWindow.getBounds();
    configManager.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
    console.log('Window bounds saved:', bounds);
  });

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    // 注销 IPC 处理器
    unregisterFileHandlers();
    unregisterTransferHandlers();
    unregisterSystemHandlers();
    mainWindow = null;
  });

  // 注册 IPC 处理器
  registerFileHandlers();
  registerTransferHandlers(mainWindow);
  registerSystemHandlers();

  // 监听渲染进程的错误
  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
    // 可以在这里添加错误恢复逻辑
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.warn('Renderer process is unresponsive');
  });

  mainWindow.webContents.on('responsive', () => {
    console.log('Renderer process is responsive again');
  });
}

// Electron 初始化完成后创建窗口
app.whenReady().then(async () => {
  // 加载配置
  await configManager.load();

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
app.on('before-quit', async (event) => {
  console.log('Application is quitting...');

  // 阻止默认退出行为，等待配置保存完成
  event.preventDefault();

  try {
    // 保存配置（同步等待）
    await configManager.save();
    console.log('Config saved successfully before quit');
  } catch (err) {
    console.error('Error saving config on quit:', err);
  }

  // 注销所有 IPC 处理器
  if (mainWindow) {
    unregisterFileHandlers();
    unregisterTransferHandlers();
    unregisterSystemHandlers();
  }

  // 配置保存完成后，真正退出应用
  app.exit(0);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // 在生产环境中，可以在这里记录错误日志
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // 在生产环境中，可以在这里记录错误日志
});

// 禁用硬件加速（可选，如果遇到渲染问题）
// app.disableHardwareAcceleration();

// 设置应用用户模型 ID（Windows）
if (process.platform === 'win32') {
  app.setAppUserModelId('com.qrcode.filetransfer');
}

// 单实例锁定（防止多开）
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，说明已经有实例在运行
  app.quit();
} else {
  // 当第二个实例尝试启动时，聚焦到第一个实例的窗口
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

