/**
 * 分片协议工具模块
 * 定义和处理文件传输的分片数据结构
 */

import { compress, decompress } from './compressionUtils.js';
import { uint8ArrayToBase64, base64ToUint8Array } from './encodingUtils.js';
import { calculateCRC32, calculateSHA256 } from './hashUtils.js';

/**
 * 协议版本
 */
export const PROTOCOL_VERSION = '1.0';

/**
 * 分片类型
 */
export const ChunkType = {
  FILE_HEADER: 'FILE_HEADER',    // 文件头信息
  FILE_DATA: 'FILE_DATA',        // 文件数据分片
  FILE_FOOTER: 'FILE_FOOTER'     // 文件尾信息
};

/**
 * 创建文件头分片
 * @param {Object} fileInfo - 文件信息
 * @param {string} fileInfo.fileName - 文件名
 * @param {number} fileInfo.fileSize - 文件大小
 * @param {string} fileInfo.fileType - 文件类型
 * @param {string} fileInfo.sha256 - 文件 SHA256 哈希
 * @param {number} totalChunks - 总分片数
 * @returns {Object} 文件头分片
 */
export function createFileHeader(fileInfo, totalChunks) {
  const header = {
    version: PROTOCOL_VERSION,
    type: ChunkType.FILE_HEADER,
    timestamp: Date.now(),
    fileInfo: {
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.type,
      sha256: fileInfo.sha256
    },
    totalChunks,
    chunkSize: 2048 // 默认分片大小
  };

  return header;
}

/**
 * 创建数据分片
 * @param {Uint8Array} data - 原始数据
 * @param {number} index - 分片索引
 * @param {number} total - 总分片数
 * @param {Object} options - 配置选项
 * @param {boolean} options.compress - 是否压缩，默认 true
 * @returns {Object} 数据分片
 */
export function createDataChunk(data, index, total, options = {}) {
  const { compress: shouldCompress = true } = options;

  // 压缩数据
  let processedData = data;
  let compressed = false;

  if (shouldCompress) {
    try {
      const compressedData = compress(data);
      // 只有压缩后更小才使用压缩数据
      if (compressedData.length < data.length) {
        processedData = compressedData;
        compressed = true;
      }
    } catch (error) {
      console.warn('压缩失败，使用原始数据:', error);
    }
  }

  // 编码为 Base64
  const base64Data = uint8ArrayToBase64(processedData);

  // 计算校验值
  const crc32 = calculateCRC32(processedData);

  const chunk = {
    version: PROTOCOL_VERSION,
    type: ChunkType.FILE_DATA,
    index,
    total,
    data: base64Data,
    crc32,
    compressed,
    size: processedData.length,
    originalSize: data.length
  };

  return chunk;
}

/**
 * 创建文件尾分片
 * @param {Object} summary - 传输摘要
 * @param {number} summary.totalChunks - 总分片数
 * @param {number} summary.totalSize - 总大小
 * @param {string} summary.sha256 - 文件 SHA256
 * @returns {Object} 文件尾分片
 */
export function createFileFooter(summary) {
  const footer = {
    version: PROTOCOL_VERSION,
    type: ChunkType.FILE_FOOTER,
    timestamp: Date.now(),
    summary: {
      totalChunks: summary.totalChunks,
      totalSize: summary.totalSize,
      sha256: summary.sha256
    }
  };

  return footer;
}

/**
 * 封装分片为 JSON 字符串
 * @param {Object} chunk - 分片对象
 * @returns {string} JSON 字符串
 */
export function encodeChunk(chunk) {
  try {
    return JSON.stringify(chunk);
  } catch (error) {
    throw new Error(`分片编码失败: ${error.message}`);
  }
}

/**
 * 解析 JSON 字符串为分片对象
 * @param {string} jsonString - JSON 字符串
 * @returns {Object} 分片对象
 */
export function decodeChunk(jsonString) {
  try {
    const chunk = JSON.parse(jsonString);
    
    // 验证版本
    if (chunk.version !== PROTOCOL_VERSION) {
      throw new Error(`协议版本不匹配: ${chunk.version}`);
    }

    return chunk;
  } catch (error) {
    throw new Error(`分片解码失败: ${error.message}`);
  }
}

/**
 * 验证分片数据
 * @param {Object} chunk - 分片对象
 * @returns {Object} 验证结果
 */
export function validateChunk(chunk) {
  const result = {
    valid: true,
    errors: []
  };

  // 检查必需字段
  if (!chunk.version) {
    result.valid = false;
    result.errors.push('缺少版本号');
  }

  if (!chunk.type) {
    result.valid = false;
    result.errors.push('缺少分片类型');
  }

  // 根据类型验证
  if (chunk.type === ChunkType.FILE_DATA) {
    if (chunk.index === undefined) {
      result.valid = false;
      result.errors.push('缺少分片索引');
    }

    if (!chunk.total) {
      result.valid = false;
      result.errors.push('缺少总分片数');
    }

    if (!chunk.data) {
      result.valid = false;
      result.errors.push('缺少数据');
    }

    if (!chunk.crc32) {
      result.valid = false;
      result.errors.push('缺少 CRC32 校验值');
    }
  }

  return result;
}

/**
 * 验证数据分片的 CRC32
 * @param {Object} chunk - 数据分片
 * @returns {boolean} 是否通过验证
 */
export function verifyChunkCRC32(chunk) {
  try {
    if (chunk.type !== ChunkType.FILE_DATA) {
      throw new Error('只能验证数据分片');
    }

    // 解码数据
    const data = base64ToUint8Array(chunk.data);

    // 计算 CRC32
    const actualCrc32 = calculateCRC32(data);

    // 比较
    return actualCrc32.toLowerCase() === chunk.crc32.toLowerCase();
  } catch (error) {
    console.error('CRC32 验证失败:', error);
    return false;
  }
}

/**
 * 解压数据分片
 * @param {Object} chunk - 数据分片
 * @returns {Uint8Array} 解压后的数据
 */
export function extractChunkData(chunk) {
  try {
    if (chunk.type !== ChunkType.FILE_DATA) {
      throw new Error('只能提取数据分片');
    }

    // 解码 Base64
    let data = base64ToUint8Array(chunk.data);

    // 解压缩
    if (chunk.compressed) {
      data = decompress(data);
    }

    return data;
  } catch (error) {
    throw new Error(`提取分片数据失败: ${error.message}`);
  }
}

/**
 * 创建完整的传输包
 * @param {Uint8Array} fileData - 文件数据
 * @param {Object} fileInfo - 文件信息
 * @param {Object} options - 配置选项
 * @param {number} options.chunkSize - 分片大小，默认 2048
 * @param {boolean} options.compress - 是否压缩，默认 true
 * @returns {Object[]} 传输包数组
 */
export function createTransferPackage(fileData, fileInfo, options = {}) {
  const { chunkSize = 2048, compress: shouldCompress = true } = options;

  const packages = [];

  // 计算总分片数
  const totalChunks = Math.ceil(fileData.length / chunkSize);

  // 计算文件 SHA256
  const sha256 = calculateSHA256(fileData);

  // 1. 创建文件头
  const header = createFileHeader(
    { ...fileInfo, sha256 },
    totalChunks
  );
  packages.push(header);

  // 2. 创建数据分片
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileData.length);
    const chunkData = fileData.slice(start, end);

    const dataChunk = createDataChunk(
      chunkData,
      i,
      totalChunks,
      { compress: shouldCompress }
    );

    packages.push(dataChunk);
  }

  // 3. 创建文件尾
  const footer = createFileFooter({
    totalChunks,
    totalSize: fileData.length,
    sha256
  });
  packages.push(footer);

  return packages;
}

/**
 * 分片收集器
 */
export class ChunkCollector {
  constructor() {
    this.header = null;
    this.chunks = new Map();
    this.footer = null;
    this.totalChunks = 0;
  }

  /**
   * 添加分片
   * @param {Object} chunk - 分片对象
   * @returns {Object} 添加结果
   */
  addChunk(chunk) {
    // 验证分片
    const validation = validateChunk(chunk);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // 根据类型处理
    if (chunk.type === ChunkType.FILE_HEADER) {
      this.header = chunk;
      this.totalChunks = chunk.totalChunks;
      return {
        success: true,
        type: 'header',
        message: '文件头已接收'
      };
    }

    if (chunk.type === ChunkType.FILE_DATA) {
      // 验证 CRC32
      if (!verifyChunkCRC32(chunk)) {
        return {
          success: false,
          error: `分片 ${chunk.index} CRC32 校验失败`
        };
      }

      // 检查重复
      if (this.chunks.has(chunk.index)) {
        return {
          success: true,
          type: 'duplicate',
          message: `分片 ${chunk.index} 已存在`
        };
      }

      // 保存分片
      this.chunks.set(chunk.index, chunk);

      return {
        success: true,
        type: 'data',
        index: chunk.index,
        total: chunk.total,
        received: this.chunks.size,
        progress: (this.chunks.size / chunk.total * 100).toFixed(2)
      };
    }

    if (chunk.type === ChunkType.FILE_FOOTER) {
      this.footer = chunk;
      return {
        success: true,
        type: 'footer',
        message: '文件尾已接收'
      };
    }

    return {
      success: false,
      error: '未知的分片类型'
    };
  }

  /**
   * 检查是否完成
   * @returns {boolean}
   */
  isComplete() {
    return this.header !== null &&
           this.footer !== null &&
           this.chunks.size === this.totalChunks;
  }

  /**
   * 获取缺失的分片索引
   * @returns {number[]}
   */
  getMissingChunks() {
    if (!this.header) {
      return [];
    }

    const missing = [];
    for (let i = 0; i < this.totalChunks; i++) {
      if (!this.chunks.has(i)) {
        missing.push(i);
      }
    }
    return missing;
  }

  /**
   * 重建文件数据
   * @returns {Uint8Array}
   */
  reconstructFile() {
    if (!this.isComplete()) {
      throw new Error('数据不完整，无法重建文件');
    }

    // 计算总长度
    let totalLength = 0;
    for (let i = 0; i < this.totalChunks; i++) {
      const chunk = this.chunks.get(i);
      const data = extractChunkData(chunk);
      totalLength += data.length;
    }

    // 合并数据
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (let i = 0; i < this.totalChunks; i++) {
      const chunk = this.chunks.get(i);
      const data = extractChunkData(chunk);
      result.set(data, offset);
      offset += data.length;
    }

    return result;
  }

  /**
   * 验证文件完整性
   * @param {Uint8Array} fileData - 重建的文件数据
   * @returns {boolean}
   */
  verifyFile(fileData) {
    if (!this.header || !this.footer) {
      return false;
    }

    // 验证大小
    if (fileData.length !== this.header.fileInfo.fileSize) {
      console.error('文件大小不匹配');
      return false;
    }

    // 验证 SHA256
    const actualSha256 = calculateSHA256(fileData);
    if (actualSha256 !== this.header.fileInfo.sha256) {
      console.error('SHA256 校验失败');
      return false;
    }

    return true;
  }

  /**
   * 获取传输统计
   * @returns {Object}
   */
  getStats() {
    return {
      hasHeader: this.header !== null,
      hasFooter: this.footer !== null,
      totalChunks: this.totalChunks,
      receivedChunks: this.chunks.size,
      missingChunks: this.getMissingChunks().length,
      progress: this.totalChunks > 0 
        ? (this.chunks.size / this.totalChunks * 100).toFixed(2)
        : 0,
      isComplete: this.isComplete()
    };
  }

  /**
   * 重置收集器
   */
  reset() {
    this.header = null;
    this.chunks.clear();
    this.footer = null;
    this.totalChunks = 0;
  }
}

