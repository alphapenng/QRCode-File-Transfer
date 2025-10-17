/**
 * 数据分片服务模块
 * 处理数据分片、分片管理和传输包创建
 */

import {
  createFileHeader,
  createDataChunk,
  createFileFooter,
  createTransferPackage,
  encodeChunk,
  decodeChunk,
  validateChunk,
  ChunkCollector
} from '@shared/utils/protocolUtils.js';
import { splitIntoChunks } from '@shared/utils/fileUtils.js';

/**
 * 分片选项
 */
export const CHUNK_OPTIONS = {
  // 分片大小（字节）
  // 注意：考虑到 JSON 编码开销和二维码容量限制
  // 实际数据 -> 压缩 -> Base64(+33%) -> JSON包装(+200 bytes) -> 需要 < 2953 bytes (QR L级)
  // 建议：1024 bytes 原始数据 -> 约 1400 bytes JSON
  chunkSize: 1024,

  // 是否压缩分片
  compress: true,

  // 是否编码为 JSON
  encode: true,

  // 是否验证分片
  validate: true
};

/**
 * 创建文件传输包
 * @param {Object} fileInfo - 文件信息
 * @param {Uint8Array} fileData - 文件数据（已预处理）
 * @param {Object} options - 分片选项
 * @returns {Object} 传输包结果
 */
export function createFileTransferPackage(fileInfo, fileData, options = {}) {
  try {
    const {
      chunkSize = 2048,
      compress = true
    } = options;
    
    const startTime = performance.now();
    
    // 使用 protocolUtils 创建传输包
    const transferPackage = createTransferPackage(fileData, fileInfo, {
      chunkSize,
      compress
    });
    
    const endTime = performance.now();
    
    return {
      success: true,
      package: transferPackage,
      stats: {
        totalChunks: transferPackage[0].totalChunks,
        chunkSize,
        fileSize: fileData.length,
        creationTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Create file transfer package error:', error);
    return {
      success: false,
      error: 'CREATE_TRANSFER_PACKAGE_ERROR',
      message: error.message
    };
  }
}

/**
 * 编码分片为 JSON 字符串
 * @param {Array<Object>} chunks - 分片数组
 * @param {Object} options - 编码选项
 * @returns {Object} 编码结果
 */
export function encodeChunks(chunks, options = {}) {
  try {
    const {
      validate = true
    } = options;
    
    const startTime = performance.now();
    const encodedChunks = [];
    const errors = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // 验证分片（如果需要）
      if (validate) {
        const validation = validateChunk(chunk);
        if (!validation.valid) {
          errors.push({
            index: i,
            error: 'INVALID_CHUNK',
            message: validation.errors.join(', ')
          });
          continue;
        }
      }
      
      // 编码分片
      try {
        const encoded = encodeChunk(chunk);
        encodedChunks.push(encoded);
      } catch (error) {
        errors.push({
          index: i,
          error: 'ENCODE_ERROR',
          message: error.message
        });
      }
    }
    
    const endTime = performance.now();
    
    return {
      success: errors.length === 0,
      encodedChunks,
      errors,
      stats: {
        total: chunks.length,
        succeeded: encodedChunks.length,
        failed: errors.length,
        encodingTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Encode chunks error:', error);
    return {
      success: false,
      error: 'ENCODE_CHUNKS_ERROR',
      message: error.message
    };
  }
}

/**
 * 解码 JSON 字符串为分片
 * @param {Array<string>} encodedChunks - 编码的分片数组
 * @param {Object} options - 解码选项
 * @returns {Object} 解码结果
 */
export function decodeChunks(encodedChunks, options = {}) {
  try {
    const {
      validate = true
    } = options;
    
    const startTime = performance.now();
    const chunks = [];
    const errors = [];
    
    for (let i = 0; i < encodedChunks.length; i++) {
      const encoded = encodedChunks[i];
      
      // 解码分片
      try {
        const chunk = decodeChunk(encoded);
        
        // 验证分片（如果需要）
        if (validate) {
          const validation = validateChunk(chunk);
          if (!validation.valid) {
            errors.push({
              index: i,
              error: 'INVALID_CHUNK',
              message: validation.errors.join(', ')
            });
            continue;
          }
        }
        
        chunks.push(chunk);
      } catch (error) {
        errors.push({
          index: i,
          error: 'DECODE_ERROR',
          message: error.message
        });
      }
    }
    
    const endTime = performance.now();
    
    return {
      success: errors.length === 0,
      chunks,
      errors,
      stats: {
        total: encodedChunks.length,
        succeeded: chunks.length,
        failed: errors.length,
        decodingTime: (endTime - startTime).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Decode chunks error:', error);
    return {
      success: false,
      error: 'DECODE_CHUNKS_ERROR',
      message: error.message
    };
  }
}

/**
 * 分片管理器类
 */
export class ChunkManager {
  constructor(options = {}) {
    this.options = {
      chunkSize: 2048,
      compress: true,
      validate: true,
      ...options
    };
    
    this.transferPackage = null;
    this.encodedChunks = null;
    this.currentIndex = 0;
    this.stats = {
      totalChunks: 0,
      sentChunks: 0,
      failedChunks: 0
    };
  }
  
  /**
   * 初始化分片管理器
   * @param {Object} fileInfo - 文件信息
   * @param {Uint8Array} fileData - 文件数据
   * @returns {Object} 初始化结果
   */
  initialize(fileInfo, fileData) {
    try {
      // 创建传输包
      const packageResult = createFileTransferPackage(
        fileInfo,
        fileData,
        this.options
      );

      if (!packageResult.success) {
        return {
          success: false,
          error: packageResult.error,
          message: packageResult.message
        };
      }

      // transferPackage 是一个数组：[header, ...dataChunks, footer]
      this.transferPackage = packageResult.package;

      // 编码所有分片（包括 header、data chunks、footer）
      const encodeResult = encodeChunks(
        this.transferPackage,  // 直接传递整个数组
        { validate: this.options.validate }
      );

      if (!encodeResult.success) {
        return {
          success: false,
          error: 'ENCODE_CHUNKS_ERROR',
          message: `编码失败: ${encodeResult.errors.length} 个分片`
        };
      }

      console.log('encodeResult:', encodeResult);
      this.encodedChunks = encodeResult.encodedChunks;
      this.currentIndex = 0;
      this.stats = {
        totalChunks: this.encodedChunks.length,
        sentChunks: 0,
        failedChunks: 0
      };

      return {
        success: true,
        totalChunks: this.stats.totalChunks,
        chunkSize: this.options.chunkSize
      };
    } catch (error) {
      console.error('Initialize chunk manager error:', error);
      return {
        success: false,
        error: 'INITIALIZE_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * 获取下一个分片
   * @returns {Object} 分片结果
   */
  getNextChunk() {
    if (!this.encodedChunks) {
      return {
        success: false,
        error: 'NOT_INITIALIZED',
        message: '分片管理器未初始化'
      };
    }
    
    if (this.currentIndex >= this.encodedChunks.length) {
      return {
        success: false,
        error: 'NO_MORE_CHUNKS',
        message: '没有更多分片',
        completed: true
      };
    }
    
    const chunk = this.encodedChunks[this.currentIndex];
    const index = this.currentIndex;
    
    this.currentIndex++;
    this.stats.sentChunks++;
    
    return {
      success: true,
      chunk,
      index,
      total: this.stats.totalChunks,
      progress: ((this.currentIndex / this.stats.totalChunks) * 100).toFixed(2)
    };
  }
  
  /**
   * 获取指定索引的分片
   * @param {number} index - 分片索引
   * @returns {Object} 分片结果
   */
  getChunkByIndex(index) {
    if (!this.encodedChunks) {
      return {
        success: false,
        error: 'NOT_INITIALIZED',
        message: '分片管理器未初始化'
      };
    }
    
    if (index < 0 || index >= this.encodedChunks.length) {
      return {
        success: false,
        error: 'INVALID_INDEX',
        message: `无效的分片索引: ${index}`
      };
    }
    
    return {
      success: true,
      chunk: this.encodedChunks[index],
      index,
      total: this.stats.totalChunks
    };
  }
  
  /**
   * 重置到指定位置
   * @param {number} index - 起始索引
   * @returns {Object} 重置结果
   */
  reset(index = 0) {
    if (!this.encodedChunks) {
      return {
        success: false,
        error: 'NOT_INITIALIZED',
        message: '分片管理器未初始化'
      };
    }
    
    if (index < 0 || index > this.encodedChunks.length) {
      return {
        success: false,
        error: 'INVALID_INDEX',
        message: `无效的起始索引: ${index}`
      };
    }
    
    this.currentIndex = index;
    
    return {
      success: true,
      currentIndex: this.currentIndex,
      totalChunks: this.stats.totalChunks
    };
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      currentIndex: this.currentIndex,
      progress: this.stats.totalChunks > 0
        ? ((this.currentIndex / this.stats.totalChunks) * 100).toFixed(2) + '%'
        : '0%',
      completed: this.currentIndex >= this.stats.totalChunks
    };
  }
  
  /**
   * 是否完成
   * @returns {boolean}
   */
  isCompleted() {
    return this.currentIndex >= this.stats.totalChunks;
  }
}

/**
 * 导出 ChunkCollector（用于接收端）
 */
export { ChunkCollector };

