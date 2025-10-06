const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * 窗口管理器
 */
class WindowManager {
  constructor() {
    this.windows = new Map();
  }

  /**
   * 创建窗口
   * @param {string} name - 窗口名称
   * @param {object} options - 窗口选项
   * @returns {BrowserWindow}
   */
  createWindow(name, options = {}) {
    // 如果窗口已存在，聚焦并返回
    if (this.windows.has(name)) {
      const existingWindow = this.windows.get(name);
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      }
    }

    // 默认窗口配置
    const defaultOptions = {
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        preload: path.join(__dirname, '../preload/index.js')
      },
      backgroundColor: '#ffffff',
      show: false,
      autoHideMenuBar: true
    };

    // 合并配置
    const windowOptions = { ...defaultOptions, ...options };

    // 创建窗口
    const window = new BrowserWindow(windowOptions);

    // 窗口加载完成后显示
    window.once('ready-to-show', () => {
      window.show();
    });

    // 窗口关闭时从 Map 中移除
    window.on('closed', () => {
      this.windows.delete(name);
    });

    // 保存窗口引用
    this.windows.set(name, window);

    return window;
  }

  /**
   * 获取窗口
   * @param {string} name - 窗口名称
   * @returns {BrowserWindow|null}
   */
  getWindow(name) {
    const window = this.windows.get(name);
    if (window && !window.isDestroyed()) {
      return window;
    }
    return null;
  }

  /**
   * 关闭窗口
   * @param {string} name - 窗口名称
   */
  closeWindow(name) {
    const window = this.getWindow(name);
    if (window) {
      window.close();
    }
  }

  /**
   * 关闭所有窗口
   */
  closeAllWindows() {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows.clear();
  }

  /**
   * 聚焦窗口
   * @param {string} name - 窗口名称
   */
  focusWindow(name) {
    const window = this.getWindow(name);
    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
    }
  }

  /**
   * 最小化窗口
   * @param {string} name - 窗口名称
   */
  minimizeWindow(name) {
    const window = this.getWindow(name);
    if (window) {
      window.minimize();
    }
  }

  /**
   * 最大化窗口
   * @param {string} name - 窗口名称
   */
  maximizeWindow(name) {
    const window = this.getWindow(name);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  }

  /**
   * 获取所有窗口
   * @returns {Map}
   */
  getAllWindows() {
    return this.windows;
  }

  /**
   * 获取窗口数量
   * @returns {number}
   */
  getWindowCount() {
    return this.windows.size;
  }
}

// 导出单例
module.exports = new WindowManager();

