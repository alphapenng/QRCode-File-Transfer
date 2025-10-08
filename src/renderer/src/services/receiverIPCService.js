/**
 * 接收端 IPC 服务模块
 * 集成扫描器和接收器，提供统一的文件接收接口
 */

import { QRCodeScanner } from './qrcodeScannerService.js';
import { DataReceiver } from './dataReceiverService.js';

/**
 * 接收状态
 */
export const ReceiveState = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  SCANNING: 'scanning',
  RECEIVING: 'receiving',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

/**
 * 接收端服务类
 */
export class ReceiverService {
  constructor(options = {}) {
    this.options = {
      scanInterval: 100,
      autoValidate: true,
      ...options
    };
    
    this.state = ReceiveState.IDLE;
    this.scanner = null;
    this.receiver = null;
    this.videoElement = null;
    this.canvasElement = null;
    
    // 回调函数
    this.onStateChange = null;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    
    // 统计信息
    this.stats = {
      startTime: null,
      endTime: null,
      totalScans: 0,
      validScans: 0,
      invalidScans: 0
    };
  }
  
  /**
   * 初始化接收器
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
    
    try {
      this._setState(ReceiveState.INITIALIZING);
      
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;
      
      // 创建扫描器
      this.scanner = new QRCodeScanner({
        scanInterval: this.options.scanInterval
      });
      
      // 初始化扫描器
      const scannerInitResult = this.scanner.initialize(videoElement, canvasElement);
      
      if (!scannerInitResult.success) {
        throw new Error('扫描器初始化失败: ' + scannerInitResult.message);
      }
      
      // 创建接收器
      this.receiver = new DataReceiver({
        autoValidate: this.options.autoValidate
      });
      
      // 设置扫描器回调
      this.scanner.on('scan', (data) => {
        this._handleScan(data);
      });
      
      this.scanner.on('error', (data) => {
        this._handleError('SCANNER_ERROR', data.message);
      });
      
      // 设置接收器回调
      this.receiver.on('progress', (data) => {
        this._emitProgress({
          stage: 'receive',
          message: `接收分片 ${data.index + 1}/${data.total}`,
          ...data
        });
      });
      
      this.receiver.on('complete', (data) => {
        this._handleComplete(data);
      });
      
      this.receiver.on('error', (data) => {
        this._handleError('RECEIVER_ERROR', data.message);
      });
      
      this._setState(ReceiveState.IDLE);
      
      return {
        success: true
      };
    } catch (error) {
      this._handleError('INIT_ERROR', error.message);
      return {
        success: false,
        error: 'INIT_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 开始接收
   * @returns {Promise<Object>} 开始结果
   */
  async start() {
    if (!this.scanner || !this.receiver) {
      return {
        success: false,
        error: 'NOT_INITIALIZED',
        message: '接收器未初始化'
      };
    }
    
    if (this.state === ReceiveState.SCANNING || this.state === ReceiveState.RECEIVING) {
      return {
        success: false,
        error: 'ALREADY_STARTED',
        message: '已经在接收中'
      };
    }
    
    try {
      this.stats.startTime = Date.now();
      
      // 启动扫描器
      this._setState(ReceiveState.SCANNING);
      this._emitProgress({
        stage: 'scan',
        message: '启动扫描器...',
        progress: 0
      });
      
      const scannerStartResult = await this.scanner.start();
      
      if (!scannerStartResult.success) {
        throw new Error('扫描器启动失败: ' + scannerStartResult.message);
      }
      
      // 启动接收器
      const receiverStartResult = this.receiver.start();
      
      if (!receiverStartResult.success) {
        throw new Error('接收器启动失败: ' + receiverStartResult.message);
      }
      
      this._setState(ReceiveState.RECEIVING);
      this._emitProgress({
        stage: 'scan',
        message: '等待扫描二维码...',
        progress: 0
      });
      
      return {
        success: true
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
   * 暂停接收
   * @returns {Object} 暂停结果
   */
  pause() {
    if (this.state !== ReceiveState.RECEIVING) {
      return {
        success: false,
        error: 'NOT_RECEIVING',
        message: '当前不在接收状态'
      };
    }
    
    // 暂停扫描器
    this.scanner.pause();
    
    // 暂停接收器
    this.receiver.pause();
    
    this._setState(ReceiveState.PAUSED);
    
    return {
      success: true
    };
  }
  
  /**
   * 恢复接收
   * @returns {Object} 恢复结果
   */
  resume() {
    if (this.state !== ReceiveState.PAUSED) {
      return {
        success: false,
        error: 'NOT_PAUSED',
        message: '当前不在暂停状态'
      };
    }
    
    // 恢复扫描器
    this.scanner.resume();
    
    // 恢复接收器
    this.receiver.resume();
    
    this._setState(ReceiveState.RECEIVING);
    
    return {
      success: true
    };
  }
  
  /**
   * 取消接收
   * @returns {Object} 取消结果
   */
  cancel() {
    if (this.scanner) {
      this.scanner.stop();
    }
    
    if (this.receiver) {
      this.receiver.reset();
    }
    
    this._setState(ReceiveState.CANCELLED);
    this._reset();
    
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
      scannerState: this.scanner ? this.scanner.getState() : null,
      receiverState: this.receiver ? this.receiver.getState() : null,
      stats: this.stats
    };
  }
  
  /**
   * 获取接收进度
   * @returns {Object} 进度信息
   */
  getProgress() {
    if (!this.receiver) {
      return {
        received: 0,
        total: 0,
        progress: '0%',
        isComplete: false
      };
    }
    
    return this.receiver.getProgress();
  }
  
  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    switch (event) {
      case 'stateChange':
        this.onStateChange = callback;
        break;
      case 'progress':
        this.onProgress = callback;
        break;
      case 'complete':
        this.onComplete = callback;
        break;
      case 'error':
        this.onError = callback;
        break;
      default:
        console.warn(`Unknown event: ${event}`);
    }
  }
  
  /**
   * 处理扫描
   * @private
   */
  _handleScan(data) {
    this.stats.totalScans++;
    
    // 接收分片
    const receiveResult = this.receiver.receiveChunk(data.data);
    
    if (receiveResult.success) {
      this.stats.validScans++;
    } else {
      this.stats.invalidScans++;
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
   * 触发进度事件
   * @private
   */
  _emitProgress(data) {
    if (this.onProgress) {
      this.onProgress(data);
    }
  }
  
  /**
   * 处理完成
   * @private
   */
  _handleComplete(data) {
    this.stats.endTime = Date.now();
    
    // 停止扫描器
    if (this.scanner) {
      this.scanner.stop();
    }
    
    this._setState(ReceiveState.COMPLETED);
    
    if (this.onComplete) {
      this.onComplete({
        success: data.success,
        data: data.data,
        fileInfo: data.fileInfo,
        stats: {
          ...this.stats,
          duration: this.stats.endTime - this.stats.startTime,
          receiverStats: data.stats
        }
      });
    }
  }
  
  /**
   * 处理错误
   * @private
   */
  _handleError(error, message) {
    this._setState(ReceiveState.ERROR);
    
    if (this.onError) {
      this.onError({ error, message });
    }
  }
  
  /**
   * 重置
   * @private
   */
  _reset() {
    this.stats = {
      startTime: null,
      endTime: null,
      totalScans: 0,
      validScans: 0,
      invalidScans: 0
    };
  }
}

/**
 * 导出接收状态
 */
export { ReceiveState as ReceiverReceiveState };

