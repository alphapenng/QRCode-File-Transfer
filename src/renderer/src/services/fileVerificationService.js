/**
 * 文件校验服务模块
 * 提供文件完整性验证和哈希校验功能
 */

import { calculateHash } from '../../../shared/utils/hashUtils.js';

/**
 * 校验结果类型
 */
export const VerificationResult = {
  SUCCESS: 'success',
  HASH_MISMATCH: 'hash_mismatch',
  SIZE_MISMATCH: 'size_mismatch',
  INVALID_DATA: 'invalid_data',
  MISSING_INFO: 'missing_info'
};

/**
 * 文件校验服务类
 */
export class FileVerificationService {
  constructor() {
    this.stats = {
      totalVerifications: 0,
      successCount: 0,
      failureCount: 0
    };
  }
  
  /**
   * 验证文件完整性
   * @param {Uint8Array} data - 文件数据
   * @param {Object} fileInfo - 文件信息
   * @param {string} fileInfo.name - 文件名
   * @param {number} fileInfo.size - 文件大小
   * @param {string} fileInfo.hash - 文件哈希值
   * @param {string} fileInfo.type - 文件类型
   * @returns {Promise<Object>} 验证结果
   */
  async verifyFile(data, fileInfo) {
    this.stats.totalVerifications++;
    
    try {
      // 1. 验证参数
      const paramValidation = this._validateParameters(data, fileInfo);
      if (!paramValidation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: paramValidation.result,
          message: paramValidation.message,
          details: paramValidation.details
        };
      }
      
      // 2. 验证数据大小
      const sizeValidation = this._validateSize(data, fileInfo.size);
      if (!sizeValidation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: VerificationResult.SIZE_MISMATCH,
          message: sizeValidation.message,
          details: sizeValidation.details
        };
      }
      
      // 3. 验证哈希值
      const hashValidation = await this._validateHash(data, fileInfo.hash);
      if (!hashValidation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: VerificationResult.HASH_MISMATCH,
          message: hashValidation.message,
          details: hashValidation.details
        };
      }
      
      // 验证成功
      this.stats.successCount++;
      
      return {
        success: true,
        result: VerificationResult.SUCCESS,
        message: '文件验证成功',
        details: {
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type,
          hash: fileInfo.hash,
          verified: true
        }
      };
    } catch (error) {
      this.stats.failureCount++;
      return {
        success: false,
        result: VerificationResult.INVALID_DATA,
        message: '验证过程发生错误: ' + error.message,
        details: {
          error: error.message
        }
      };
    }
  }
  
  /**
   * 快速验证（仅验证大小）
   * @param {Uint8Array} data - 文件数据
   * @param {number} expectedSize - 期望的文件大小
   * @returns {Object} 验证结果
   */
  quickVerify(data, expectedSize) {
    this.stats.totalVerifications++;
    
    const sizeValidation = this._validateSize(data, expectedSize);
    
    if (sizeValidation.valid) {
      this.stats.successCount++;
      return {
        success: true,
        result: VerificationResult.SUCCESS,
        message: '快速验证成功',
        details: {
          size: data.length,
          expectedSize: expectedSize
        }
      };
    } else {
      this.stats.failureCount++;
      return {
        success: false,
        result: VerificationResult.SIZE_MISMATCH,
        message: sizeValidation.message,
        details: sizeValidation.details
      };
    }
  }
  
  /**
   * 验证哈希值
   * @param {Uint8Array} data - 文件数据
   * @param {string} expectedHash - 期望的哈希值
   * @returns {Promise<Object>} 验证结果
   */
  async verifyHash(data, expectedHash) {
    this.stats.totalVerifications++;
    
    try {
      const hashValidation = await this._validateHash(data, expectedHash);
      
      if (hashValidation.valid) {
        this.stats.successCount++;
        return {
          success: true,
          result: VerificationResult.SUCCESS,
          message: '哈希验证成功',
          details: hashValidation.details
        };
      } else {
        this.stats.failureCount++;
        return {
          success: false,
          result: VerificationResult.HASH_MISMATCH,
          message: hashValidation.message,
          details: hashValidation.details
        };
      }
    } catch (error) {
      this.stats.failureCount++;
      return {
        success: false,
        result: VerificationResult.INVALID_DATA,
        message: '哈希验证失败: ' + error.message,
        details: {
          error: error.message
        }
      };
    }
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const successRate = this.stats.totalVerifications > 0
      ? ((this.stats.successCount / this.stats.totalVerifications) * 100).toFixed(2) + '%'
      : '0%';
    
    return {
      totalVerifications: this.stats.totalVerifications,
      successCount: this.stats.successCount,
      failureCount: this.stats.failureCount,
      successRate: successRate
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalVerifications: 0,
      successCount: 0,
      failureCount: 0
    };
  }
  
  /**
   * 验证参数
   * @private
   */
  _validateParameters(data, fileInfo) {
    // 验证数据
    if (!data || !(data instanceof Uint8Array)) {
      return {
        valid: false,
        result: VerificationResult.INVALID_DATA,
        message: '无效的文件数据',
        details: {
          dataType: typeof data,
          isUint8Array: data instanceof Uint8Array
        }
      };
    }
    
    // 验证文件信息
    if (!fileInfo) {
      return {
        valid: false,
        result: VerificationResult.MISSING_INFO,
        message: '缺少文件信息',
        details: {}
      };
    }
    
    // 验证必需字段
    const requiredFields = ['name', 'size', 'hash'];
    const missingFields = requiredFields.filter(field => !fileInfo[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        result: VerificationResult.MISSING_INFO,
        message: '文件信息不完整',
        details: {
          missingFields: missingFields
        }
      };
    }
    
    return {
      valid: true
    };
  }
  
  /**
   * 验证文件大小
   * @private
   */
  _validateSize(data, expectedSize) {
    const actualSize = data.length;
    
    if (actualSize !== expectedSize) {
      return {
        valid: false,
        message: '文件大小不匹配',
        details: {
          actualSize: actualSize,
          expectedSize: expectedSize,
          difference: actualSize - expectedSize
        }
      };
    }
    
    return {
      valid: true,
      details: {
        size: actualSize
      }
    };
  }
  
  /**
   * 验证哈希值
   * @private
   */
  async _validateHash(data, expectedHash) {
    // 计算实际哈希值
    const actualHash = await calculateHash(data);
    
    if (actualHash !== expectedHash) {
      return {
        valid: false,
        message: '文件哈希值不匹配',
        details: {
          actualHash: actualHash,
          expectedHash: expectedHash
        }
      };
    }
    
    return {
      valid: true,
      details: {
        hash: actualHash,
        algorithm: 'SHA-256'
      }
    };
  }
}

/**
 * 创建文件校验服务实例
 * @returns {FileVerificationService} 文件校验服务实例
 */
export function createVerificationService() {
  return new FileVerificationService();
}

/**
 * 导出校验结果类型
 */
export { VerificationResult as FileVerificationResult };

