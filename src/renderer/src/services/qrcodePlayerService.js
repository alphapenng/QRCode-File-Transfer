/**
 * 二维码播放器服务模块
 * 处理二维码序列的播放、控制和进度管理
 */

/**
 * 播放器状态
 */
export const PlayerState = {
  IDLE: 'idle',           // 空闲
  PLAYING: 'playing',     // 播放中
  PAUSED: 'paused',       // 暂停
  STOPPED: 'stopped',     // 停止
  COMPLETED: 'completed'  // 完成
};

/**
 * 播放器选项
 */
export const PLAYER_OPTIONS = {
  // 播放速度（每秒显示的二维码数量）
  speed: 5,
  
  // 是否循环播放
  loop: false,
  
  // 是否自动播放
  autoPlay: false
};

/**
 * 二维码播放器类
 */
export class QRCodePlayer {
  constructor(options = {}) {
    this.options = {
      speed: 5,
      loop: false,
      autoPlay: false,
      ...options
    };
    
    this.qrCodes = [];
    this.currentIndex = 0;
    this.state = PlayerState.IDLE;
    this.timerId = null;
    
    // 回调函数
    this.onFrameChange = null;
    this.onStateChange = null;
    this.onComplete = null;
    this.onError = null;
    
    // 统计信息
    this.stats = {
      totalFrames: 0,
      playedFrames: 0,
      startTime: null,
      pauseTime: null,
      totalPauseTime: 0
    };
  }
  
  /**
   * 加载二维码序列
   * @param {Array<string>} qrCodes - 二维码数组（Data URL）
   * @returns {Object} 加载结果
   */
  load(qrCodes) {
    if (!Array.isArray(qrCodes) || qrCodes.length === 0) {
      return {
        success: false,
        error: 'INVALID_QRCODES',
        message: '二维码数组无效或为空'
      };
    }
    
    this.qrCodes = qrCodes;
    this.currentIndex = 0;
    this.state = PlayerState.IDLE;
    this.stats.totalFrames = qrCodes.length;
    this.stats.playedFrames = 0;
    
    this._emitStateChange(PlayerState.IDLE);
    
    return {
      success: true,
      totalFrames: qrCodes.length
    };
  }
  
  /**
   * 播放
   * @returns {Object} 播放结果
   */
  play() {
    if (this.qrCodes.length === 0) {
      return {
        success: false,
        error: 'NO_QRCODES',
        message: '没有加载二维码'
      };
    }
    
    if (this.state === PlayerState.PLAYING) {
      return {
        success: false,
        error: 'ALREADY_PLAYING',
        message: '已经在播放中'
      };
    }
    
    // 如果已完成，重置到开始
    if (this.state === PlayerState.COMPLETED) {
      this.currentIndex = 0;
      this.stats.playedFrames = 0;
    }
    
    // 如果从暂停恢复，计算暂停时间
    if (this.state === PlayerState.PAUSED && this.stats.pauseTime) {
      this.stats.totalPauseTime += Date.now() - this.stats.pauseTime;
      this.stats.pauseTime = null;
    }
    
    // 记录开始时间
    if (!this.stats.startTime) {
      this.stats.startTime = Date.now();
    }
    
    this.state = PlayerState.PLAYING;
    this._emitStateChange(PlayerState.PLAYING);
    
    // 立即显示当前帧
    this._showCurrentFrame();
    
    // 开始定时器
    this._startTimer();
    
    return {
      success: true,
      state: this.state
    };
  }
  
  /**
   * 暂停
   * @returns {Object} 暂停结果
   */
  pause() {
    if (this.state !== PlayerState.PLAYING) {
      return {
        success: false,
        error: 'NOT_PLAYING',
        message: '当前不在播放状态'
      };
    }
    
    this._stopTimer();
    this.state = PlayerState.PAUSED;
    this.stats.pauseTime = Date.now();
    this._emitStateChange(PlayerState.PAUSED);
    
    return {
      success: true,
      state: this.state
    };
  }
  
  /**
   * 停止
   * @returns {Object} 停止结果
   */
  stop() {
    if (this.state === PlayerState.IDLE || this.state === PlayerState.STOPPED) {
      return {
        success: false,
        error: 'NOT_STARTED',
        message: '播放器未启动'
      };
    }
    
    this._stopTimer();
    this.currentIndex = 0;
    this.state = PlayerState.STOPPED;
    this._emitStateChange(PlayerState.STOPPED);
    
    // 重置统计
    this.stats.startTime = null;
    this.stats.pauseTime = null;
    this.stats.totalPauseTime = 0;
    this.stats.playedFrames = 0;
    
    return {
      success: true,
      state: this.state
    };
  }
  
  /**
   * 跳转到指定帧
   * @param {number} index - 帧索引
   * @returns {Object} 跳转结果
   */
  seekTo(index) {
    if (index < 0 || index >= this.qrCodes.length) {
      return {
        success: false,
        error: 'INVALID_INDEX',
        message: `无效的帧索引: ${index}`
      };
    }
    
    const wasPlaying = this.state === PlayerState.PLAYING;
    
    if (wasPlaying) {
      this._stopTimer();
    }
    
    this.currentIndex = index;
    this._showCurrentFrame();
    
    if (wasPlaying) {
      this._startTimer();
    }
    
    return {
      success: true,
      currentIndex: this.currentIndex
    };
  }
  
  /**
   * 设置播放速度
   * @param {number} speed - 速度（每秒帧数）
   * @returns {Object} 设置结果
   */
  setSpeed(speed) {
    if (speed <= 0 || speed > 60) {
      return {
        success: false,
        error: 'INVALID_SPEED',
        message: '速度必须在 1-60 之间'
      };
    }
    
    const wasPlaying = this.state === PlayerState.PLAYING;
    
    if (wasPlaying) {
      this._stopTimer();
    }
    
    this.options.speed = speed;
    
    if (wasPlaying) {
      this._startTimer();
    }
    
    return {
      success: true,
      speed: this.options.speed
    };
  }
  
  /**
   * 获取当前状态
   * @returns {Object} 状态信息
   */
  getState() {
    return {
      state: this.state,
      currentIndex: this.currentIndex,
      totalFrames: this.qrCodes.length,
      progress: this.qrCodes.length > 0
        ? ((this.currentIndex / this.qrCodes.length) * 100).toFixed(2) + '%'
        : '0%',
      speed: this.options.speed,
      loop: this.options.loop
    };
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const now = Date.now();
    const elapsedTime = this.stats.startTime
      ? now - this.stats.startTime - this.stats.totalPauseTime
      : 0;
    
    return {
      ...this.stats,
      elapsedTime,
      elapsedTimeFormatted: this._formatTime(elapsedTime),
      averageSpeed: elapsedTime > 0
        ? ((this.stats.playedFrames / elapsedTime) * 1000).toFixed(2)
        : '0'
    };
  }
  
  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    switch (event) {
      case 'frameChange':
        this.onFrameChange = callback;
        break;
      case 'stateChange':
        this.onStateChange = callback;
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
      case 'frameChange':
        this.onFrameChange = null;
        break;
      case 'stateChange':
        this.onStateChange = null;
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
   * 开始定时器
   * @private
   */
  _startTimer() {
    const interval = 1000 / this.options.speed;
    
    this.timerId = setInterval(() => {
      this._nextFrame();
    }, interval);
  }
  
  /**
   * 停止定时器
   * @private
   */
  _stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  /**
   * 下一帧
   * @private
   */
  _nextFrame() {
    this.currentIndex++;
    this.stats.playedFrames++;
    
    if (this.currentIndex >= this.qrCodes.length) {
      if (this.options.loop) {
        // 循环播放
        this.currentIndex = 0;
        this._showCurrentFrame();
      } else {
        // 播放完成
        this._stopTimer();
        this.state = PlayerState.COMPLETED;
        this._emitStateChange(PlayerState.COMPLETED);
        this._emitComplete();
      }
    } else {
      this._showCurrentFrame();
    }
  }
  
  /**
   * 显示当前帧
   * @private
   */
  _showCurrentFrame() {
    if (this.currentIndex < this.qrCodes.length) {
      const qrCode = this.qrCodes[this.currentIndex];
      this._emitFrameChange(qrCode, this.currentIndex);
    }
  }
  
  /**
   * 触发帧变化事件
   * @private
   */
  _emitFrameChange(qrCode, index) {
    if (this.onFrameChange) {
      try {
        this.onFrameChange({
          qrCode,
          index,
          total: this.qrCodes.length,
          progress: ((index / this.qrCodes.length) * 100).toFixed(2)
        });
      } catch (error) {
        this._emitError(error);
      }
    }
  }
  
  /**
   * 触发状态变化事件
   * @private
   */
  _emitStateChange(state) {
    if (this.onStateChange) {
      try {
        this.onStateChange({
          state,
          currentIndex: this.currentIndex,
          totalFrames: this.qrCodes.length
        });
      } catch (error) {
        this._emitError(error);
      }
    }
  }
  
  /**
   * 触发完成事件
   * @private
   */
  _emitComplete() {
    if (this.onComplete) {
      try {
        this.onComplete({
          totalFrames: this.qrCodes.length,
          stats: this.getStats()
        });
      } catch (error) {
        this._emitError(error);
      }
    }
  }
  
  /**
   * 触发错误事件
   * @private
   */
  _emitError(error) {
    if (this.onError) {
      this.onError({
        error: error.message || error,
        state: this.state
      });
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
 * 导出播放器状态
 */
export { PlayerState as QRCodePlayerState };

