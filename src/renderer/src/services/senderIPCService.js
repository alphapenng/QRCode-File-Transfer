/**
 * 发送端 IPC 服务模块
 * 集成所有发送端服务，提供统一的文件传输接口
 */

import { selectAndValidateFile } from './fileService.js';
import { preprocessFile } from './filePreprocessService.js';
import { ChunkManager } from './chunkService.js';
import { QRCodeGenerator } from './qrcodeService.js';
import { QRCodePlayer } from './qrcodePlayerService.js';

/**
 * 传输状态
 */
export const TransferState = {
  IDLE: 'idle',
  SELECTING: 'selecting',
  PREPROCESSING: 'preprocessing',
  CHUNKING: 'chunking',
  GENERATING: 'generating',
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

/**
 * 发送端服务类
 */
export class SenderService {
  constructor(options = {}) {
    this.options = {
      maxFileSize: 1048576,  // 1MB
      chunkSize: 2048,
      qrCodeSpeed: 5,
      qrCodeErrorCorrectionLevel: 'M',
      ...options
    };
    
    this.state = TransferState.IDLE;
    this.currentFile = null;
    this.preprocessResult = null;
    this.chunkManager = null;
    this.qrGenerator = null;
    this.qrPlayer = null;
    this.qrCodes = [];
    
    // 回调函数
    this.onStateChange = null;
    this.onProgress = null;
    this.onQRCode = null;
    this.onComplete = null;
    this.onError = null;
    
    // 统计信息
    this.stats = {
      startTime: null,
      endTime: null,
      fileSize: 0,
      totalChunks: 0,
      currentChunk: 0
    };
  }
  
  /**
   * 选择文件
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 选择结果
   */
  async selectFile(options = {}) {
    try {
      this._setState(TransferState.SELECTING);
      
      const selectResult = await selectAndValidateFile({
        maxSize: this.options.maxFileSize,
        ...options
      });
      
      if (!selectResult.success) {
        this._setState(TransferState.IDLE);
        return selectResult;
      }
      
      this.currentFile = selectResult.file;
      this.stats.fileSize = selectResult.file.size;
      
      this._setState(TransferState.IDLE);
      this._emitProgress({
        stage: 'select',
        message: '文件选择成功',
        file: this.currentFile
      });
      
      return {
        success: true,
        file: this.currentFile
      };
    } catch (error) {
      this._handleError('SELECT_FILE_ERROR', error.message);
      return {
        success: false,
        error: 'SELECT_FILE_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 准备传输
   * @returns {Promise<Object>} 准备结果
   */
  async prepareTransfer() {
    if (!this.currentFile) {
      return {
        success: false,
        error: 'NO_FILE_SELECTED',
        message: '未选择文件'
      };
    }
    
    try {
      this.stats.startTime = Date.now();
      
      // 1. 预处理文件
      this._setState(TransferState.PREPROCESSING);
      this._emitProgress({
        stage: 'preprocess',
        message: '正在预处理文件...',
        progress: 0
      });
      
      this.preprocessResult = await preprocessFile(this.currentFile.path, {
        compress: true,
        calculateHash: true
      });
      
      if (!this.preprocessResult.success) {
        throw new Error('文件预处理失败: ' + this.preprocessResult.message);
      }
      
      this._emitProgress({
        stage: 'preprocess',
        message: '文件预处理完成',
        progress: 25,
        stats: this.preprocessResult.stats
      });
      
      // 2. 创建分片
      this._setState(TransferState.CHUNKING);
      this._emitProgress({
        stage: 'chunk',
        message: '正在创建分片...',
        progress: 25
      });
      
      this.chunkManager = new ChunkManager({
        chunkSize: this.options.chunkSize,
        compress: true
      });
      
      const initResult = this.chunkManager.initialize(
        {
          name: this.currentFile.name,
          size: this.currentFile.size,
          type: this.currentFile.type
        },
        this.preprocessResult.data.processed
      );
      
      if (!initResult.success) {
        throw new Error('分片初始化失败: ' + initResult.message);
      }
      
      this.stats.totalChunks = initResult.totalChunks;
      
      this._emitProgress({
        stage: 'chunk',
        message: '分片创建完成',
        progress: 50,
        totalChunks: initResult.totalChunks
      });
      
      // 3. 生成二维码
      this._setState(TransferState.GENERATING);
      this._emitProgress({
        stage: 'generate',
        message: '正在生成二维码...',
        progress: 50
      });
      
      this.qrGenerator = new QRCodeGenerator({
        errorCorrectionLevel: this.options.qrCodeErrorCorrectionLevel,
        width: 400,
        height: 400
      });
      
      this.qrCodes = [];
      let generatedCount = 0;
      
      while (!this.chunkManager.isCompleted()) {
        const chunkResult = this.chunkManager.getNextChunk();
        
        if (chunkResult.success) {
          const qrResult = await this.qrGenerator.generate(chunkResult.chunk);
          
          if (qrResult.success) {
            this.qrCodes.push(qrResult.dataURL);
            generatedCount++;
            
            const progress = 50 + (generatedCount / this.stats.totalChunks) * 25;
            this._emitProgress({
              stage: 'generate',
              message: `生成二维码 ${generatedCount}/${this.stats.totalChunks}`,
              progress: Math.round(progress),
              current: generatedCount,
              total: this.stats.totalChunks
            });
          }
        }
      }
      
      this._emitProgress({
        stage: 'generate',
        message: '二维码生成完成',
        progress: 75,
        totalQRCodes: this.qrCodes.length
      });
      
      // 4. 创建播放器
      this.qrPlayer = new QRCodePlayer({
        speed: this.options.qrCodeSpeed,
        loop: false
      });
      
      this.qrPlayer.load(this.qrCodes);
      
      // 设置播放器回调
      this.qrPlayer.on('frameChange', (data) => {
        this.stats.currentChunk = data.index + 1;
        this._emitProgress({
          stage: 'play',
          message: `播放二维码 ${data.index + 1}/${data.total}`,
          progress: 75 + (parseFloat(data.progress) / 100) * 25,
          current: data.index + 1,
          total: data.total
        });

        // 触发二维码更新事件
        this._emitQRCode(data.qrCode, data.index, data.total);
      });
      
      this.qrPlayer.on('complete', () => {
        this._handleComplete();
      });
      
      this._setState(TransferState.IDLE);
      this._emitProgress({
        stage: 'prepare',
        message: '准备完成，可以开始传输',
        progress: 75
      });
      
      return {
        success: true,
        totalChunks: this.stats.totalChunks,
        totalQRCodes: this.qrCodes.length
      };
    } catch (error) {
      this._handleError('PREPARE_TRANSFER_ERROR', error.message);
      return {
        success: false,
        error: 'PREPARE_TRANSFER_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 开始传输
   * @returns {Object} 传输结果
   */
  startTransfer() {
    if (!this.qrPlayer) {
      return {
        success: false,
        error: 'NOT_PREPARED',
        message: '未准备传输'
      };
    }
    
    const result = this.qrPlayer.play();
    
    if (result.success) {
      this._setState(TransferState.PLAYING);
      this._emitProgress({
        stage: 'play',
        message: '开始传输',
        progress: 75
      });
    }
    
    return result;
  }
  
  /**
   * 暂停传输
   * @returns {Object} 暂停结果
   */
  pauseTransfer() {
    if (!this.qrPlayer) {
      return {
        success: false,
        error: 'NOT_PREPARED',
        message: '未准备传输'
      };
    }
    
    const result = this.qrPlayer.pause();
    
    if (result.success) {
      this._setState(TransferState.PAUSED);
    }
    
    return result;
  }
  
  /**
   * 恢复传输
   * @returns {Object} 恢复结果
   */
  resumeTransfer() {
    if (!this.qrPlayer) {
      return {
        success: false,
        error: 'NOT_PREPARED',
        message: '未准备传输'
      };
    }
    
    const result = this.qrPlayer.play();
    
    if (result.success) {
      this._setState(TransferState.PLAYING);
    }
    
    return result;
  }
  
  /**
   * 取消传输
   * @returns {Object} 取消结果
   */
  cancelTransfer() {
    if (this.qrPlayer) {
      this.qrPlayer.stop();
    }
    
    this._setState(TransferState.CANCELLED);
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
      file: this.currentFile,
      stats: this.stats,
      playerState: this.qrPlayer ? this.qrPlayer.getState() : null
    };
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
      case 'qrcode':
        this.onQRCode = callback;
        break;
      case 'complete':
        this.onComplete = callback;
        break;
      case 'error':
        this.onError = callback;
        break;
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
   * 触发二维码更新事件
   * @private
   */
  _emitQRCode(qrCode, index, total) {
    if (this.onQRCode) {
      this.onQRCode({
        qrCode,
        index,
        total
      });
    }
  }
  
  /**
   * 处理完成
   * @private
   */
  _handleComplete() {
    this.stats.endTime = Date.now();
    this._setState(TransferState.COMPLETED);
    
    if (this.onComplete) {
      this.onComplete({
        file: this.currentFile,
        stats: {
          ...this.stats,
          duration: this.stats.endTime - this.stats.startTime
        }
      });
    }
  }
  
  /**
   * 处理错误
   * @private
   */
  _handleError(error, message) {
    this._setState(TransferState.ERROR);
    
    if (this.onError) {
      this.onError({ error, message });
    }
  }
  
  /**
   * 重置
   * @private
   */
  _reset() {
    this.currentFile = null;
    this.preprocessResult = null;
    this.chunkManager = null;
    this.qrGenerator = null;
    this.qrPlayer = null;
    this.qrCodes = [];
    this.stats = {
      startTime: null,
      endTime: null,
      fileSize: 0,
      totalChunks: 0,
      currentChunk: 0
    };
  }
}

/**
 * 导出传输状态
 */
export { TransferState as SenderTransferState };

