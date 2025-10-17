/**
 * 二维码生成服务模块
 * 处理二维码生成、解析和管理
 */

import {
  generateQRCode,
  parseQRCode,
  generateQRCodeToCanvas,
  calculateQRCodeCapacity,
  estimateQRCodeVersion,
  QRErrorCorrectionLevel
} from '@shared/utils/qrcodeUtils.js';

/**
 * 二维码选项
 */
export const QRCODE_OPTIONS = {
  // 纠错级别
  // L(7%): 最大容量约 2953 bytes
  // M(15%): 最大容量约 2331 bytes
  // Q(25%): 最大容量约 1663 bytes
  // H(30%): 最大容量约 1273 bytes
  // 使用 L 级以获得最大容量
  errorCorrectionLevel: 'L',

  // 二维码大小（像素）
  width: 400,
  height: 400,

  // 边距
  margin: 2,

  // 颜色
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

/**
 * 生成二维码（Data URL）
 * @param {string} data - 要编码的数据
 * @param {Object} options - 二维码选项
 * @returns {Promise<Object>} 生成结果
 */
export async function generateQRCodeDataURL(data, options = {}) {
  try {
    const {
      errorCorrectionLevel = 'M',
      width = 400,
      height = 400,
      margin = 2,
      color = { dark: '#000000', light: '#FFFFFF' }
    } = options;
    
    const startTime = performance.now();
    
    // 生成二维码
    const dataURL = await generateQRCode(data, {
      errorCorrectionLevel,
      width,
      height,
      margin,
      color
    });
    
    const endTime = performance.now();
    
    return {
      success: true,
      dataURL,
      stats: {
        dataLength: data.length,
        errorCorrectionLevel,
        width,
        height,
        generationTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Generate QR code data URL error:', error);
    return {
      success: false,
      error: 'GENERATE_QRCODE_ERROR',
      message: error.message
    };
  }
}

/**
 * 生成二维码到 Canvas
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} data - 要编码的数据
 * @param {Object} options - 二维码选项
 * @returns {Promise<Object>} 生成结果
 */
export async function generateQRCodeToCanvasElement(canvas, data, options = {}) {
  try {
    const {
      errorCorrectionLevel = 'M',
      margin = 2,
      color = { dark: '#000000', light: '#FFFFFF' }
    } = options;
    
    const startTime = performance.now();
    
    // 生成二维码到 Canvas
    await generateQRCodeToCanvas(canvas, data, {
      errorCorrectionLevel,
      margin,
      color
    });
    
    const endTime = performance.now();
    
    return {
      success: true,
      canvas,
      stats: {
        dataLength: data.length,
        errorCorrectionLevel,
        width: canvas.width,
        height: canvas.height,
        generationTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Generate QR code to canvas error:', error);
    return {
      success: false,
      error: 'GENERATE_QRCODE_CANVAS_ERROR',
      message: error.message
    };
  }
}

/**
 * 解析二维码
 * @param {ImageData|HTMLImageElement|HTMLCanvasElement|string} source - 图像源
 * @returns {Promise<Object>} 解析结果
 */
export async function parseQRCodeFromSource(source) {
  try {
    const startTime = performance.now();
    
    // 解析二维码
    const data = await parseQRCode(source);
    
    const endTime = performance.now();
    
    return {
      success: true,
      data,
      stats: {
        dataLength: data.length,
        parsingTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Parse QR code error:', error);
    return {
      success: false,
      error: 'PARSE_QRCODE_ERROR',
      message: error.message
    };
  }
}

/**
 * 计算二维码容量
 * @param {string} data - 数据
 * @param {string} errorCorrectionLevel - 纠错级别
 * @returns {Object} 容量信息
 */
export function getQRCodeCapacity(data, errorCorrectionLevel = 'M') {
  try {
    const capacity = calculateQRCodeCapacity(data, errorCorrectionLevel);
    
    return {
      success: true,
      capacity,
      canEncode: capacity.canEncode,
      version: capacity.version,
      maxCapacity: capacity.maxCapacity,
      dataLength: data.length
    };
  } catch (error) {
    console.error('Get QR code capacity error:', error);
    return {
      success: false,
      error: 'CALCULATE_CAPACITY_ERROR',
      message: error.message
    };
  }
}

/**
 * 估算二维码版本
 * @param {number} dataLength - 数据长度
 * @param {string} errorCorrectionLevel - 纠错级别
 * @returns {Object} 版本信息
 */
export function estimateQRVersion(dataLength, errorCorrectionLevel = 'M') {
  try {
    const version = estimateQRCodeVersion(dataLength, errorCorrectionLevel);
    
    return {
      success: true,
      version,
      dataLength,
      errorCorrectionLevel
    };
  } catch (error) {
    console.error('Estimate QR version error:', error);
    return {
      success: false,
      error: 'ESTIMATE_VERSION_ERROR',
      message: error.message
    };
  }
}

/**
 * 二维码生成器类
 */
export class QRCodeGenerator {
  constructor(options = {}) {
    this.options = {
      errorCorrectionLevel: 'M',
      width: 400,
      height: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };
    
    this.stats = {
      totalGenerated: 0,
      totalFailed: 0,
      averageTime: 0
    };
  }
  
  /**
   * 生成二维码
   * @param {string} data - 数据
   * @param {Object} options - 选项（覆盖默认选项）
   * @returns {Promise<Object>} 生成结果
   */
  async generate(data, options = {}) {
    const mergedOptions = {
      ...this.options,
      ...options
    };
    
    const result = await generateQRCodeDataURL(data, mergedOptions);
    
    if (result.success) {
      this.stats.totalGenerated++;
      this._updateAverageTime(parseFloat(result.stats.generationTime));
    } else {
      this.stats.totalFailed++;
    }
    
    return result;
  }
  
  /**
   * 生成到 Canvas
   * @param {HTMLCanvasElement} canvas - Canvas 元素
   * @param {string} data - 数据
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 生成结果
   */
  async generateToCanvas(canvas, data, options = {}) {
    const mergedOptions = {
      ...this.options,
      ...options
    };
    
    const result = await generateQRCodeToCanvasElement(canvas, data, mergedOptions);
    
    if (result.success) {
      this.stats.totalGenerated++;
      this._updateAverageTime(parseFloat(result.stats.generationTime));
    } else {
      this.stats.totalFailed++;
    }
    
    return result;
  }
  
  /**
   * 批量生成二维码
   * @param {Array<string>} dataArray - 数据数组
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 批量生成结果
   */
  async generateBatch(dataArray, options = {}) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];
      
      try {
        const result = await this.generate(data, options);
        
        if (result.success) {
          results.push({
            index: i,
            dataURL: result.dataURL,
            stats: result.stats
          });
        } else {
          errors.push({
            index: i,
            error: result.error,
            message: result.message
          });
        }
      } catch (error) {
        errors.push({
          index: i,
          error: 'GENERATE_ERROR',
          message: error.message
        });
      }
    }
    
    return {
      success: errors.length === 0,
      total: dataArray.length,
      succeeded: results.length,
      failed: errors.length,
      results,
      errors
    };
  }
  
  /**
   * 更新平均时间
   * @private
   */
  _updateAverageTime(time) {
    const total = this.stats.totalGenerated;
    this.stats.averageTime = (
      (this.stats.averageTime * (total - 1) + time) / total
    ).toFixed(2);
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalGenerated > 0
        ? ((this.stats.totalGenerated / (this.stats.totalGenerated + this.stats.totalFailed)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalGenerated: 0,
      totalFailed: 0,
      averageTime: 0
    };
  }
  
  /**
   * 设置选项
   * @param {Object} options - 新选项
   */
  setOptions(options) {
    this.options = {
      ...this.options,
      ...options
    };
  }
  
  /**
   * 获取选项
   * @returns {Object} 当前选项
   */
  getOptions() {
    return { ...this.options };
  }
}

/**
 * 导出纠错级别常量
 */
export { QRErrorCorrectionLevel };

