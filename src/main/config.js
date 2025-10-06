const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;

/**
 * 应用配置管理
 */
class ConfigManager {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.config = null;
  }

  /**
   * 加载配置
   */
  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
      console.log('Config loaded:', this.configPath);
    } catch (error) {
      // 如果配置文件不存在，使用默认配置
      if (error.code === 'ENOENT') {
        console.log('Config file not found, using defaults');
        this.config = this.getDefaultConfig();
        await this.save();
      } else {
        console.error('Error loading config:', error);
        this.config = this.getDefaultConfig();
      }
    }
    return this.config;
  }

  /**
   * 保存配置
   */
  async save() {
    try {
      // 确保目录存在
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });

      // 写入配置文件
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf-8'
      );
      console.log('Config saved:', this.configPath);
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      // 窗口配置
      window: {
        width: 1000,
        height: 700,
        x: undefined,
        y: undefined
      },
      // 传输配置
      transfer: {
        chunkSize: 2048,           // 每个二维码的数据大小（字节）
        maxFileSize: 1048576,      // 最大文件大小（1MB）
        compressionEnabled: true,   // 是否启用压缩
        qrCodeSize: 400,           // 二维码尺寸（像素）
        displayDuration: 500       // 二维码显示时长（毫秒）
      },
      // 应用配置
      app: {
        autoCheckUpdate: true,
        language: 'zh-CN',
        theme: 'light'
      },
      // 最近使用的文件
      recentFiles: []
    };
  }

  /**
   * 获取配置项
   */
  get(key, defaultValue = undefined) {
    if (!this.config) {
      return defaultValue;
    }

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * 设置配置项
   */
  set(key, value) {
    if (!this.config) {
      this.config = this.getDefaultConfig();
    }

    const keys = key.split('.');
    let target = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }

    target[keys[keys.length - 1]] = value;
  }

  /**
   * 获取所有配置
   */
  getAll() {
    return this.config || this.getDefaultConfig();
  }

  /**
   * 重置配置
   */
  async reset() {
    this.config = this.getDefaultConfig();
    await this.save();
  }

  /**
   * 添加最近使用的文件
   */
  addRecentFile(filePath) {
    if (!this.config) {
      this.config = this.getDefaultConfig();
    }

    const recentFiles = this.config.recentFiles || [];
    
    // 移除已存在的相同路径
    const index = recentFiles.indexOf(filePath);
    if (index > -1) {
      recentFiles.splice(index, 1);
    }

    // 添加到开头
    recentFiles.unshift(filePath);

    // 限制最多保存 10 个
    if (recentFiles.length > 10) {
      recentFiles.pop();
    }

    this.config.recentFiles = recentFiles;
  }

  /**
   * 获取最近使用的文件
   */
  getRecentFiles() {
    return this.get('recentFiles', []);
  }

  /**
   * 清除最近使用的文件
   */
  clearRecentFiles() {
    this.set('recentFiles', []);
  }
}

// 导出单例
module.exports = new ConfigManager();

