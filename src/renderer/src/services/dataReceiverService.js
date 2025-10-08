/**
 * 数据接收服务模块
 * 处理分片数据解析、验证和收集
 */

import { decodeChunk, validateChunk, ChunkCollector } from '../../../shared/utils/protocolUtils.js';

/**
 * 接收器状态
 */
export const ReceiverState = {
  IDLE: 'idle',           // 空闲
  RECEIVING: 'receiving', // 接收中
  PAUSED: 'paused',       // 暂停
  COMPLETED: 'completed', // 完成
  ERROR: 'error'          // 错误
};

/**
 * 数据接收器类
 */
export class DataReceiver {
  constructor(options = {}) {
    this.options = {
      autoValidate: true,
      ...options
    };
    
    this.state = ReceiverState.IDLE;
    this.collector = new ChunkCollector();
    
    // 回调函数
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    
    // 统计信息
    this.stats = {
      totalReceived: 0,
      validChunks: 0,
      invalidChunks: 0,
      duplicateChunks: 0,
      startTime: null,
      endTime: null
    };
  }
  
  /**
   * 开始接收
   * @returns {Object} 开始结果
   */
  start() {
    if (this.state === ReceiverState.RECEIVING) {
      return {
        success: false,
        error: 'ALREADY_RECEIVING',
        message: '已经在接收中'
      };
    }
    
    this.state = ReceiverState.RECEIVING;
    this.stats.startTime = Date.now();
    
    return {
      success: true
    };
  }
  
  /**
   * 暂停接收
   * @returns {Object} 暂停结果
   */
  pause() {
    if (this.state !== ReceiverState.RECEIVING) {
      return {
        success: false,
        error: 'NOT_RECEIVING',
        message: '当前不在接收状态'
      };
    }
    
    this.state = ReceiverState.PAUSED;
    
    return {
      success: true
    };
  }
  
  /**
   * 恢复接收
   * @returns {Object} 恢复结果
   */
  resume() {
    if (this.state !== ReceiverState.PAUSED) {
      return {
        success: false,
        error: 'NOT_PAUSED',
        message: '当前不在暂停状态'
      };
    }
    
    this.state = ReceiverState.RECEIVING;
    
    return {
      success: true
    };
  }
  
  /**
   * 重置接收器
   * @returns {Object} 重置结果
   */
  reset() {
    this.state = ReceiverState.IDLE;
    this.collector = new ChunkCollector();
    this.stats = {
      totalReceived: 0,
      validChunks: 0,
      invalidChunks: 0,
      duplicateChunks: 0,
      startTime: null,
      endTime: null
    };
    
    return {
      success: true
    };
  }
  
  /**
   * 解析分片数据
   * @param {string} data - 分片数据（JSON 字符串）
   * @returns {Object} 解析结果
   */
  parseChunk(data) {
    try {
      const chunk = decodeChunk(data);
      
      return {
        success: true,
        chunk
      };
    } catch (error) {
      return {
        success: false,
        error: 'PARSE_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 验证分片数据
   * @param {Object} chunk - 分片对象
   * @returns {Object} 验证结果
   */
  validateChunk(chunk) {
    const validation = validateChunk(chunk);
    
    return {
      success: validation.valid,
      errors: validation.errors
    };
  }
  
  /**
   * 接收分片数据
   * @param {string} data - 分片数据（JSON 字符串）
   * @returns {Object} 接收结果
   */
  receiveChunk(data) {
    if (this.state !== ReceiverState.RECEIVING) {
      return {
        success: false,
        error: 'NOT_RECEIVING',
        message: '当前不在接收状态'
      };
    }
    
    try {
      this.stats.totalReceived++;
      
      // 1. 解析分片
      const parseResult = this.parseChunk(data);
      
      if (!parseResult.success) {
        this.stats.invalidChunks++;
        this._emitError('PARSE_ERROR', parseResult.message);
        return parseResult;
      }
      
      const chunk = parseResult.chunk;
      
      // 2. 验证分片（如果启用）
      if (this.options.autoValidate) {
        const validateResult = this.validateChunk(chunk);
        
        if (!validateResult.success) {
          this.stats.invalidChunks++;
          this._emitError('VALIDATION_ERROR', validateResult.errors.join(', '));
          return {
            success: false,
            error: 'VALIDATION_ERROR',
            message: validateResult.errors.join(', ')
          };
        }
      }
      
      // 3. 添加到收集器
      const addResult = this.collector.addChunk(chunk);
      
      if (!addResult.success) {
        if (addResult.error.includes('已存在')) {
          this.stats.duplicateChunks++;
        } else {
          this.stats.invalidChunks++;
        }
        return addResult;
      }
      
      this.stats.validChunks++;
      
      // 4. 触发进度事件
      this._emitProgress({
        index: addResult.index,
        total: addResult.total,
        progress: addResult.progress
      });
      
      // 5. 检查是否完成
      if (this.collector.isComplete()) {
        this._handleComplete();
      }
      
      return {
        success: true,
        index: addResult.index,
        total: addResult.total,
        progress: addResult.progress
      };
    } catch (error) {
      this.stats.invalidChunks++;
      this._emitError('RECEIVE_ERROR', error.message);
      return {
        success: false,
        error: 'RECEIVE_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 获取接收进度
   * @returns {Object} 进度信息
   */
  getProgress() {
    const collectorStats = this.collector.getStats();
    
    return {
      received: collectorStats.receivedChunks,
      total: collectorStats.totalChunks,
      progress: collectorStats.progress,
      isComplete: this.collector.isComplete()
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
      validRate: this.stats.totalReceived > 0
        ? ((this.stats.validChunks / this.stats.totalReceived) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * 获取当前状态
   * @returns {Object} 状态信息
   */
  getState() {
    return {
      state: this.state,
      progress: this.getProgress(),
      stats: this.getStats()
    };
  }
  
  /**
   * 重建文件
   * @returns {Object} 重建结果
   */
  reconstructFile() {
    if (!this.collector.isComplete()) {
      return {
        success: false,
        error: 'NOT_COMPLETE',
        message: '数据接收未完成'
      };
    }
    
    try {
      const result = this.collector.reconstructFile();
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'RECONSTRUCT_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    switch (event) {
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
   * 移除回调函数
   * @param {string} event - 事件名称
   */
  off(event) {
    switch (event) {
      case 'progress':
        this.onProgress = null;
        break;
      case 'complete':
        this.onComplete = null;
        break;
      case 'error':
        this.onError = null;
        break;
    }
  }
  
  /**
   * 触发进度事件
   * @private
   */
  _emitProgress(data) {
    if (this.onProgress) {
      try {
        this.onProgress(data);
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    }
  }
  
  /**
   * 处理完成
   * @private
   */
  _handleComplete() {
    this.stats.endTime = Date.now();
    this.state = ReceiverState.COMPLETED;
    
    if (this.onComplete) {
      try {
        const reconstructResult = this.reconstructFile();
        
        this.onComplete({
          success: reconstructResult.success,
          data: reconstructResult.data,
          fileInfo: reconstructResult.fileInfo,
          stats: this.getStats()
        });
      } catch (error) {
        this._emitError('COMPLETE_ERROR', error.message);
      }
    }
  }
  
  /**
   * 触发错误事件
   * @private
   */
  _emitError(error, message) {
    this.state = ReceiverState.ERROR;
    
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
 * 导出接收器状态
 */
export { ReceiverState as DataReceiverState };

