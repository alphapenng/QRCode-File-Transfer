/**
 * 二维码扫描服务模块
 * 处理摄像头访问、二维码识别和扫描控制
 */

import { parseQRCode } from '../../../shared/utils/qrcodeUtils.js';

/**
 * 扫描器状态
 */
export const ScannerState = {
  IDLE: 'idle',           // 空闲
  STARTING: 'starting',   // 启动中
  SCANNING: 'scanning',   // 扫描中
  PAUSED: 'paused',       // 暂停
  STOPPED: 'stopped',     // 停止
  ERROR: 'error'          // 错误
};

/**
 * 扫描器选项
 */
export const SCANNER_OPTIONS = {
  // 视频约束
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment'  // 后置摄像头
  },
  
  // 扫描间隔（毫秒）
  scanInterval: 100,
  
  // 是否自动开始
  autoStart: false
};

/**
 * 二维码扫描器类
 */
export class QRCodeScanner {
  constructor(options = {}) {
    this.options = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment'
      },
      scanInterval: 100,
      autoStart: false,
      ...options
    };
    
    this.state = ScannerState.IDLE;
    this.videoElement = null;
    this.canvasElement = null;
    this.stream = null;
    this.scanTimer = null;
    
    // 回调函数
    this.onScan = null;
    this.onStateChange = null;
    this.onError = null;
    
    // 统计信息
    this.stats = {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      startTime: null,
      lastScanTime: null
    };
  }
  
  /**
   * 初始化扫描器
   * @param {HTMLVideoElement} videoElement - 视频元素
   * @param {HTMLCanvasElement} canvasElement - Canvas 元素（可选）
   * @returns {Object} 初始化结果
   */
  initialize(videoElement, canvasElement = null) {
    if (!videoElement) {
      return {
        success: false,
        error: 'INVALID_VIDEO_ELEMENT',
        message: '无效的视频元素'
      };
    }
    
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    
    // 如果没有提供 Canvas，创建一个
    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
    }
    
    return {
      success: true
    };
  }
  
  /**
   * 启动扫描器
   * @returns {Promise<Object>} 启动结果
   */
  async start() {
    if (this.state === ScannerState.SCANNING) {
      return {
        success: false,
        error: 'ALREADY_SCANNING',
        message: '已经在扫描中'
      };
    }
    
    if (!this.videoElement) {
      return {
        success: false,
        error: 'NOT_INITIALIZED',
        message: '扫描器未初始化'
      };
    }
    
    try {
      this._setState(ScannerState.STARTING);
      
      // 请求摄像头权限
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: this.options.video,
        audio: false
      });
      
      // 设置视频源
      this.videoElement.srcObject = this.stream;
      
      // 等待视频加载
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play()
            .then(resolve)
            .catch(reject);
        };
        
        this.videoElement.onerror = () => {
          reject(new Error('视频加载失败'));
        };
      });
      
      // 设置 Canvas 尺寸
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;
      
      // 开始扫描
      this._setState(ScannerState.SCANNING);
      this.stats.startTime = Date.now();
      this._startScanning();
      
      return {
        success: true,
        videoWidth: this.videoElement.videoWidth,
        videoHeight: this.videoElement.videoHeight
      };
    } catch (error) {
      this._handleError('START_ERROR', error.message);
      return {
        success: false,
        error: 'START_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 暂停扫描
   * @returns {Object} 暂停结果
   */
  pause() {
    if (this.state !== ScannerState.SCANNING) {
      return {
        success: false,
        error: 'NOT_SCANNING',
        message: '当前不在扫描状态'
      };
    }
    
    this._stopScanning();
    this._setState(ScannerState.PAUSED);
    
    return {
      success: true
    };
  }
  
  /**
   * 恢复扫描
   * @returns {Object} 恢复结果
   */
  resume() {
    if (this.state !== ScannerState.PAUSED) {
      return {
        success: false,
        error: 'NOT_PAUSED',
        message: '当前不在暂停状态'
      };
    }
    
    this._setState(ScannerState.SCANNING);
    this._startScanning();
    
    return {
      success: true
    };
  }
  
  /**
   * 停止扫描器
   * @returns {Object} 停止结果
   */
  stop() {
    if (this.state === ScannerState.IDLE || this.state === ScannerState.STOPPED) {
      return {
        success: false,
        error: 'NOT_STARTED',
        message: '扫描器未启动'
      };
    }
    
    this._stopScanning();
    
    // 停止视频流
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // 清除视频源
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    
    this._setState(ScannerState.STOPPED);
    
    return {
      success: true
    };
  }
  
  /**
   * 获取当前状态
   * @returns {Object} 状态信息
   */
  getState() {
    return {
      state: this.state,
      hasStream: !!this.stream,
      videoWidth: this.videoElement?.videoWidth || 0,
      videoHeight: this.videoElement?.videoHeight || 0
    };
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const now = Date.now();
    const elapsedTime = this.stats.startTime
      ? now - this.stats.startTime
      : 0;
    
    return {
      ...this.stats,
      elapsedTime,
      elapsedTimeFormatted: this._formatTime(elapsedTime),
      successRate: this.stats.totalScans > 0
        ? ((this.stats.successfulScans / this.stats.totalScans) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    switch (event) {
      case 'scan':
        this.onScan = callback;
        break;
      case 'stateChange':
        this.onStateChange = callback;
        break;
      case 'error':
        this.onError = callback;
        break;
      default:
        console.warn(`Unknown event: ${event}`);
    }
  }
  
  /**
   * 移除回调函数
   * @param {string} event - 事件名称
   */
  off(event) {
    switch (event) {
      case 'scan':
        this.onScan = null;
        break;
      case 'stateChange':
        this.onStateChange = null;
        break;
      case 'error':
        this.onError = null;
        break;
    }
  }
  
  /**
   * 开始扫描
   * @private
   */
  _startScanning() {
    this.scanTimer = setInterval(() => {
      this._scanFrame();
    }, this.options.scanInterval);
  }
  
  /**
   * 停止扫描
   * @private
   */
  _stopScanning() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }
  
  /**
   * 扫描一帧
   * @private
   */
  _scanFrame() {
    if (!this.videoElement || !this.canvasElement) {
      return;
    }
    
    try {
      // 绘制当前帧到 Canvas
      const ctx = this.canvasElement.getContext('2d');
      ctx.drawImage(
        this.videoElement,
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      
      // 获取图像数据
      const imageData = ctx.getImageData(
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      
      // 解析二维码
      const result = parseQRCode(imageData);
      
      this.stats.totalScans++;
      
      if (result) {
        this.stats.successfulScans++;
        this.stats.lastScanTime = Date.now();
        this._emitScan(result);
      } else {
        this.stats.failedScans++;
      }
    } catch (error) {
      this._handleError('SCAN_ERROR', error.message);
    }
  }
  
  /**
   * 触发扫描事件
   * @private
   */
  _emitScan(result) {
    if (this.onScan) {
      try {
        this.onScan({
          data: result.data,
          location: result.location,
          timestamp: Date.now()
        });
      } catch (error) {
        this._handleError('CALLBACK_ERROR', error.message);
      }
    }
  }
  
  /**
   * 设置状态
   * @private
   */
  _setState(state) {
    this.state = state;
    
    if (this.onStateChange) {
      this.onStateChange({ state });
    }
  }
  
  /**
   * 处理错误
   * @private
   */
  _handleError(error, message) {
    this._setState(ScannerState.ERROR);
    
    if (this.onError) {
      this.onError({ error, message });
    }
  }
  
  /**
   * 格式化时间
   * @private
   */
  _formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    } else {
      return `${remainingSeconds}秒`;
    }
  }
}

/**
 * 导出扫描器状态
 */
export { ScannerState as QRCodeScannerState };

