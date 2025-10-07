/**
 * 压缩工具模块
 * 使用 pako 库实现 gzip 压缩和解压缩
 */

import pako from 'pako';

/**
 * 压缩数据（gzip）
 * @param {Uint8Array|ArrayBuffer|string} data - 要压缩的数据
 * @param {Object} options - 压缩选项
 * @param {number} options.level - 压缩级别 (0-9)，默认 6
 * @returns {Uint8Array} 压缩后的数据
 */
export function compress(data, options = {}) {
  try {
    // 确保数据是 Uint8Array
    let uint8Data;
    
    if (typeof data === 'string') {
      // 字符串转 Uint8Array
      const encoder = new TextEncoder();
      uint8Data = encoder.encode(data);
    } else if (data instanceof ArrayBuffer) {
      uint8Data = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      uint8Data = data;
    } else {
      throw new Error('不支持的数据类型，必须是 string、ArrayBuffer 或 Uint8Array');
    }

    // 压缩选项
    const compressOptions = {
      level: options.level !== undefined ? options.level : 6, // 压缩级别 (0-9)
      ...options
    };

    // 使用 pako 压缩
    const compressed = pako.gzip(uint8Data, compressOptions);
    
    return compressed;
  } catch (error) {
    throw new Error(`压缩失败: ${error.message}`);
  }
}

/**
 * 解压缩数据（gzip）
 * @param {Uint8Array|ArrayBuffer} compressedData - 压缩的数据
 * @param {Object} options - 解压选项
 * @param {boolean} options.to - 输出格式 ('string' 或 'uint8array')，默认 'uint8array'
 * @returns {Uint8Array|string} 解压后的数据
 */
export function decompress(compressedData, options = {}) {
  try {
    // 确保数据是 Uint8Array
    let uint8Data;
    
    if (compressedData instanceof ArrayBuffer) {
      uint8Data = new Uint8Array(compressedData);
    } else if (compressedData instanceof Uint8Array) {
      uint8Data = compressedData;
    } else {
      throw new Error('不支持的数据类型，必须是 ArrayBuffer 或 Uint8Array');
    }

    // 使用 pako 解压
    const decompressed = pako.ungzip(uint8Data);

    // 根据选项返回不同格式
    if (options.to === 'string') {
      const decoder = new TextDecoder();
      return decoder.decode(decompressed);
    }

    return decompressed;
  } catch (error) {
    throw new Error(`解压失败: ${error.message}`);
  }
}

/**
 * 压缩字符串
 * @param {string} str - 要压缩的字符串
 * @param {Object} options - 压缩选项
 * @returns {Uint8Array} 压缩后的数据
 */
export function compressString(str, options = {}) {
  return compress(str, options);
}

/**
 * 解压缩为字符串
 * @param {Uint8Array|ArrayBuffer} compressedData - 压缩的数据
 * @returns {string} 解压后的字符串
 */
export function decompressToString(compressedData) {
  return decompress(compressedData, { to: 'string' });
}

/**
 * 计算压缩率
 * @param {number} originalSize - 原始大小（字节）
 * @param {number} compressedSize - 压缩后大小（字节）
 * @returns {Object} 压缩率信息
 */
export function getCompressionRatio(originalSize, compressedSize) {
  if (originalSize === 0) {
    return {
      ratio: 0,
      percentage: 0,
      saved: 0,
      savedPercentage: 0
    };
  }

  const ratio = compressedSize / originalSize;
  const percentage = ratio * 100;
  const saved = originalSize - compressedSize;
  const savedPercentage = (saved / originalSize) * 100;

  return {
    ratio: parseFloat(ratio.toFixed(4)),
    percentage: parseFloat(percentage.toFixed(2)),
    saved,
    savedPercentage: parseFloat(savedPercentage.toFixed(2))
  };
}

/**
 * 检查数据是否已压缩（gzip 格式）
 * @param {Uint8Array|ArrayBuffer} data - 要检查的数据
 * @returns {boolean} 是否为 gzip 格式
 */
export function isGzipCompressed(data) {
  try {
    // 确保数据是 Uint8Array
    let uint8Data;
    
    if (data instanceof ArrayBuffer) {
      uint8Data = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      uint8Data = data;
    } else {
      return false;
    }

    // gzip 文件的魔数是 0x1f 0x8b
    if (uint8Data.length < 2) {
      return false;
    }

    return uint8Data[0] === 0x1f && uint8Data[1] === 0x8b;
  } catch (error) {
    return false;
  }
}

/**
 * 压缩并获取详细信息
 * @param {Uint8Array|ArrayBuffer|string} data - 要压缩的数据
 * @param {Object} options - 压缩选项
 * @returns {Object} 压缩结果和统计信息
 */
export function compressWithStats(data, options = {}) {
  // 获取原始大小
  let originalSize;
  if (typeof data === 'string') {
    originalSize = new TextEncoder().encode(data).length;
  } else if (data instanceof ArrayBuffer) {
    originalSize = data.byteLength;
  } else if (data instanceof Uint8Array) {
    originalSize = data.length;
  } else {
    throw new Error('不支持的数据类型');
  }

  // 压缩
  const startTime = performance.now();
  const compressed = compress(data, options);
  const endTime = performance.now();

  // 计算统计信息
  const compressedSize = compressed.length;
  const compressionRatio = getCompressionRatio(originalSize, compressedSize);
  const compressionTime = endTime - startTime;

  return {
    data: compressed,
    originalSize,
    compressedSize,
    compressionTime: parseFloat(compressionTime.toFixed(2)),
    ...compressionRatio
  };
}

/**
 * 解压并获取详细信息
 * @param {Uint8Array|ArrayBuffer} compressedData - 压缩的数据
 * @param {Object} options - 解压选项
 * @returns {Object} 解压结果和统计信息
 */
export function decompressWithStats(compressedData, options = {}) {
  // 获取压缩数据大小
  const compressedSize = compressedData instanceof ArrayBuffer 
    ? compressedData.byteLength 
    : compressedData.length;

  // 解压
  const startTime = performance.now();
  const decompressed = decompress(compressedData, options);
  const endTime = performance.now();

  // 计算统计信息
  const decompressedSize = decompressed instanceof Uint8Array 
    ? decompressed.length 
    : new TextEncoder().encode(decompressed).length;
  const decompressionTime = endTime - startTime;
  const compressionRatio = getCompressionRatio(decompressedSize, compressedSize);

  return {
    data: decompressed,
    compressedSize,
    decompressedSize,
    decompressionTime: parseFloat(decompressionTime.toFixed(2)),
    ...compressionRatio
  };
}

/**
 * 批量压缩多个数据块
 * @param {Array} dataArray - 数据数组
 * @param {Object} options - 压缩选项
 * @returns {Array} 压缩后的数据数组
 */
export function compressBatch(dataArray, options = {}) {
  return dataArray.map(data => compress(data, options));
}

/**
 * 批量解压多个数据块
 * @param {Array} compressedArray - 压缩数据数组
 * @param {Object} options - 解压选项
 * @returns {Array} 解压后的数据数组
 */
export function decompressBatch(compressedArray, options = {}) {
  return compressedArray.map(data => decompress(data, options));
}

/**
 * 获取推荐的压缩级别
 * @param {number} fileSize - 文件大小（字节）
 * @param {string} priority - 优先级 ('speed' 或 'size')
 * @returns {number} 推荐的压缩级别 (0-9)
 */
export function getRecommendedCompressionLevel(fileSize, priority = 'balanced') {
  // 小文件（< 10KB）
  if (fileSize < 10240) {
    return priority === 'speed' ? 1 : 6;
  }
  
  // 中等文件（10KB - 100KB）
  if (fileSize < 102400) {
    return priority === 'speed' ? 3 : 6;
  }
  
  // 大文件（100KB - 1MB）
  if (fileSize < 1048576) {
    return priority === 'speed' ? 4 : 7;
  }
  
  // 超大文件（> 1MB）
  return priority === 'speed' ? 5 : 8;
}

