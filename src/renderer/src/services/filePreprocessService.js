/**
 * 文件预处理服务模块
 * 处理文件读取、压缩和哈希计算
 */

import { compress, compressWithStats } from '@shared/utils/compressionUtils.js';
import { calculateSHA256 } from '@shared/utils/hashUtils.js';
import { readFileAsArrayBuffer } from '@shared/utils/fileUtils.js';

/**
 * 预处理选项
 */
export const PREPROCESS_OPTIONS = {
  // 是否压缩
  compress: true,
  
  // 压缩级别 (0-9)
  compressionLevel: 6,
  
  // 是否计算哈希
  calculateHash: true,
  
  // 是否显示详细统计
  showStats: true
};

/**
 * 读取文件数据
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 文件数据或错误
 */
export async function readFileData(filePath) {
  try {
    // 使用 Electron API 读取文件
    const result = await window.electronAPI.file.read(filePath);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }
    
    // 转换为 Uint8Array
    const uint8Array = new Uint8Array(result.data);
    
    return {
      success: true,
      data: uint8Array,
      size: uint8Array.length
    };
  } catch (error) {
    console.error('Read file data error:', error);
    return {
      success: false,
      error: 'READ_FILE_DATA_ERROR',
      message: error.message
    };
  }
}

/**
 * 压缩文件数据
 * @param {Uint8Array} data - 原始数据
 * @param {Object} options - 压缩选项
 * @param {number} options.level - 压缩级别 (0-9)
 * @param {boolean} options.showStats - 是否显示统计信息
 * @returns {Object} 压缩结果
 */
export function compressFileData(data, options = {}) {
  try {
    const {
      level = 6,
      showStats = true
    } = options;
    
    if (showStats) {
      // 使用带统计的压缩
      const result = compressWithStats(data, { level });
      
      return {
        success: true,
        data: result.compressed,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        compressionTime: result.compressionTime,
        stats: result
      };
    } else {
      // 普通压缩
      const compressed = compress(data, { level });
      
      return {
        success: true,
        data: compressed,
        originalSize: data.length,
        compressedSize: compressed.length,
        compressionRatio: ((1 - compressed.length / data.length) * 100).toFixed(2)
      };
    }
  } catch (error) {
    console.error('Compress file data error:', error);
    return {
      success: false,
      error: 'COMPRESS_FILE_DATA_ERROR',
      message: error.message
    };
  }
}

/**
 * 计算文件哈希
 * @param {Uint8Array} data - 文件数据
 * @returns {Object} 哈希结果
 */
export function calculateFileHash(data) {
  try {
    const startTime = performance.now();
    const hash = calculateSHA256(data);
    const endTime = performance.now();
    
    return {
      success: true,
      hash,
      algorithm: 'SHA256',
      dataSize: data.length,
      calculationTime: (endTime - startTime).toFixed(2)
    };
  } catch (error) {
    console.error('Calculate file hash error:', error);
    return {
      success: false,
      error: 'CALCULATE_FILE_HASH_ERROR',
      message: error.message
    };
  }
}

/**
 * 完整的文件预处理流程
 * @param {string} filePath - 文件路径
 * @param {Object} options - 预处理选项
 * @param {boolean} options.compress - 是否压缩，默认 true
 * @param {number} options.compressionLevel - 压缩级别，默认 6
 * @param {boolean} options.calculateHash - 是否计算哈希，默认 true
 * @param {boolean} options.showStats - 是否显示统计，默认 true
 * @returns {Promise<Object>} 预处理结果
 */
export async function preprocessFile(filePath, options = {}) {
  const {
    compress: shouldCompress = true,
    compressionLevel = 6,
    calculateHash: shouldCalculateHash = true,
    showStats = true
  } = options;
  
  const startTime = performance.now();
  
  try {
    // 1. 读取文件数据
    const readResult = await readFileData(filePath);
    
    if (!readResult.success) {
      return {
        success: false,
        error: readResult.error,
        message: readResult.message,
        stage: 'read'
      };
    }
    
    const originalData = readResult.data;
    const originalSize = readResult.size;
    
    // 2. 计算原始文件哈希（如果需要）
    let originalHash = null;
    let hashTime = 0;
    
    if (shouldCalculateHash) {
      const hashResult = calculateFileHash(originalData);
      
      if (!hashResult.success) {
        return {
          success: false,
          error: hashResult.error,
          message: hashResult.message,
          stage: 'hash'
        };
      }
      
      originalHash = hashResult.hash;
      hashTime = parseFloat(hashResult.calculationTime);
    }
    
    // 3. 压缩数据（如果需要）
    let processedData = originalData;
    let compressed = false;
    let compressionStats = null;
    
    if (shouldCompress) {
      const compressResult = compressFileData(originalData, {
        level: compressionLevel,
        showStats
      });
      
      if (!compressResult.success) {
        return {
          success: false,
          error: compressResult.error,
          message: compressResult.message,
          stage: 'compress'
        };
      }
      
      // 只有压缩后更小才使用压缩数据
      if (compressResult.compressedSize < originalSize) {
        processedData = compressResult.data;
        compressed = true;
        compressionStats = {
          originalSize: compressResult.originalSize,
          compressedSize: compressResult.compressedSize,
          compressionRatio: compressResult.compressionRatio,
          compressionTime: compressResult.compressionTime || 0
        };
      }
    }
    
    const endTime = performance.now();
    const totalTime = (endTime - startTime).toFixed(2);
    
    // 4. 返回预处理结果
    return {
      success: true,
      data: {
        original: originalData,
        processed: processedData,
        originalSize,
        processedSize: processedData.length,
        compressed,
        hash: originalHash
      },
      stats: {
        originalSize,
        processedSize: processedData.length,
        compressed,
        compressionStats,
        hash: originalHash,
        hashTime,
        totalTime,
        sizeReduction: compressed 
          ? ((1 - processedData.length / originalSize) * 100).toFixed(2) + '%'
          : '0%'
      }
    };
  } catch (error) {
    console.error('Preprocess file error:', error);
    return {
      success: false,
      error: 'PREPROCESS_FILE_ERROR',
      message: error.message,
      stage: 'unknown'
    };
  }
}

/**
 * 批量预处理文件
 * @param {Array<string>} filePaths - 文件路径数组
 * @param {Object} options - 预处理选项
 * @returns {Promise<Object>} 批量预处理结果
 */
export async function preprocessFileBatch(filePaths, options = {}) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    
    try {
      const result = await preprocessFile(filePath, options);
      
      if (result.success) {
        results.push({
          filePath,
          index: i,
          ...result
        });
      } else {
        errors.push({
          filePath,
          index: i,
          error: result.error,
          message: result.message,
          stage: result.stage
        });
      }
    } catch (error) {
      errors.push({
        filePath,
        index: i,
        error: 'PREPROCESS_ERROR',
        message: error.message
      });
    }
  }
  
  return {
    success: errors.length === 0,
    total: filePaths.length,
    succeeded: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * 验证预处理结果
 * @param {Object} preprocessResult - 预处理结果
 * @returns {Object} 验证结果
 */
export function validatePreprocessResult(preprocessResult) {
  const errors = [];
  
  if (!preprocessResult.success) {
    errors.push('预处理失败');
    return {
      valid: false,
      errors
    };
  }
  
  const { data, stats } = preprocessResult;
  
  // 检查数据
  if (!data.processed || data.processed.length === 0) {
    errors.push('处理后的数据为空');
  }
  
  // 检查大小
  if (data.processedSize > data.originalSize * 1.5) {
    errors.push('处理后的数据过大（超过原始大小的 150%）');
  }
  
  // 检查哈希
  if (stats.hash && stats.hash.length !== 64) {
    errors.push('SHA256 哈希格式不正确');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * 获取预处理摘要
 * @param {Object} preprocessResult - 预处理结果
 * @returns {Object} 摘要信息
 */
export function getPreprocessSummary(preprocessResult) {
  if (!preprocessResult.success) {
    return {
      success: false,
      error: preprocessResult.error,
      message: preprocessResult.message
    };
  }
  
  const { data, stats } = preprocessResult;
  
  return {
    success: true,
    summary: {
      originalSize: data.originalSize,
      processedSize: data.processedSize,
      compressed: data.compressed,
      sizeReduction: stats.sizeReduction,
      hash: stats.hash,
      totalTime: stats.totalTime + ' ms'
    }
  };
}

