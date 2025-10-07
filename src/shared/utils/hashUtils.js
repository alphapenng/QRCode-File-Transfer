/**
 * 校验工具模块
 * 提供 CRC32 和 SHA256 校验功能
 */

import CRC32 from 'crc-32';
import { sha256 } from 'js-sha256';

/**
 * 计算 CRC32 校验值
 * @param {Uint8Array|ArrayBuffer|string} data - 要计算校验值的数据
 * @returns {string} CRC32 校验值（十六进制字符串）
 */
export function calculateCRC32(data) {
  try {
    let uint8Array;

    // 转换为 Uint8Array
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      uint8Array = encoder.encode(data);
    } else if (data instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      uint8Array = data;
    } else {
      throw new Error('不支持的数据类型，必须是 string、ArrayBuffer 或 Uint8Array');
    }

    // 计算 CRC32
    const crc = CRC32.buf(uint8Array);
    
    // 转换为无符号整数并转为十六进制
    const unsignedCrc = crc >>> 0;
    return unsignedCrc.toString(16).padStart(8, '0');
  } catch (error) {
    throw new Error(`CRC32 计算失败: ${error.message}`);
  }
}

/**
 * 验证 CRC32 校验值
 * @param {Uint8Array|ArrayBuffer|string} data - 要验证的数据
 * @param {string} expectedCrc - 期望的 CRC32 值
 * @returns {boolean} 是否匹配
 */
export function verifyCRC32(data, expectedCrc) {
  try {
    const actualCrc = calculateCRC32(data);
    return actualCrc.toLowerCase() === expectedCrc.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * 计算 SHA256 哈希值
 * @param {Uint8Array|ArrayBuffer|string} data - 要计算哈希值的数据
 * @returns {string} SHA256 哈希值（十六进制字符串）
 */
export function calculateSHA256(data) {
  try {
    let uint8Array;

    // 转换为 Uint8Array
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      uint8Array = encoder.encode(data);
    } else if (data instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      uint8Array = data;
    } else {
      throw new Error('不支持的数据类型，必须是 string、ArrayBuffer 或 Uint8Array');
    }

    // 计算 SHA256
    return sha256(uint8Array);
  } catch (error) {
    throw new Error(`SHA256 计算失败: ${error.message}`);
  }
}

/**
 * 验证 SHA256 哈希值
 * @param {Uint8Array|ArrayBuffer|string} data - 要验证的数据
 * @param {string} expectedHash - 期望的 SHA256 值
 * @returns {boolean} 是否匹配
 */
export function verifySHA256(data, expectedHash) {
  try {
    const actualHash = calculateSHA256(data);
    return actualHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * 计算文件的 CRC32 校验值
 * @param {File} file - 文件对象
 * @returns {Promise<string>} CRC32 校验值
 */
export async function calculateFileCRC32(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const crc = calculateCRC32(arrayBuffer);
        resolve(crc);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 计算文件的 SHA256 哈希值
 * @param {File} file - 文件对象
 * @returns {Promise<string>} SHA256 哈希值
 */
export async function calculateFileSHA256(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const hash = calculateSHA256(arrayBuffer);
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 批量计算 CRC32 校验值
 * @param {Array} dataArray - 数据数组
 * @returns {string[]} CRC32 校验值数组
 */
export function calculateCRC32Batch(dataArray) {
  if (!Array.isArray(dataArray)) {
    throw new Error('参数必须是数组');
  }

  return dataArray.map(data => calculateCRC32(data));
}

/**
 * 批量计算 SHA256 哈希值
 * @param {Array} dataArray - 数据数组
 * @returns {string[]} SHA256 哈希值数组
 */
export function calculateSHA256Batch(dataArray) {
  if (!Array.isArray(dataArray)) {
    throw new Error('参数必须是数组');
  }

  return dataArray.map(data => calculateSHA256(data));
}

/**
 * 计算并获取统计信息
 * @param {Uint8Array|ArrayBuffer|string} data - 要计算的数据
 * @param {string} algorithm - 算法类型 ('crc32' 或 'sha256')
 * @returns {Object} 计算结果和统计信息
 */
export function calculateHashWithStats(data, algorithm = 'sha256') {
  let dataSize;

  if (typeof data === 'string') {
    dataSize = new TextEncoder().encode(data).length;
  } else if (data instanceof ArrayBuffer) {
    dataSize = data.byteLength;
  } else if (data instanceof Uint8Array) {
    dataSize = data.length;
  } else {
    throw new Error('不支持的数据类型');
  }

  const startTime = performance.now();
  let hash;

  if (algorithm === 'crc32') {
    hash = calculateCRC32(data);
  } else if (algorithm === 'sha256') {
    hash = calculateSHA256(data);
  } else {
    throw new Error('不支持的算法类型，必须是 "crc32" 或 "sha256"');
  }

  const endTime = performance.now();
  const calculationTime = endTime - startTime;

  return {
    hash,
    algorithm,
    dataSize,
    hashLength: hash.length,
    calculationTime: parseFloat(calculationTime.toFixed(2))
  };
}

/**
 * 验证数据完整性
 * @param {Uint8Array|ArrayBuffer|string} data - 要验证的数据
 * @param {Object} checksums - 校验值对象
 * @param {string} checksums.crc32 - CRC32 校验值（可选）
 * @param {string} checksums.sha256 - SHA256 哈希值（可选）
 * @returns {Object} 验证结果
 */
export function verifyIntegrity(data, checksums) {
  const result = {
    valid: true,
    crc32: null,
    sha256: null,
    errors: []
  };

  // 验证 CRC32
  if (checksums.crc32) {
    try {
      const crc32Valid = verifyCRC32(data, checksums.crc32);
      result.crc32 = crc32Valid;
      if (!crc32Valid) {
        result.valid = false;
        result.errors.push('CRC32 校验失败');
      }
    } catch (error) {
      result.crc32 = false;
      result.valid = false;
      result.errors.push(`CRC32 验证错误: ${error.message}`);
    }
  }

  // 验证 SHA256
  if (checksums.sha256) {
    try {
      const sha256Valid = verifySHA256(data, checksums.sha256);
      result.sha256 = sha256Valid;
      if (!sha256Valid) {
        result.valid = false;
        result.errors.push('SHA256 校验失败');
      }
    } catch (error) {
      result.sha256 = false;
      result.valid = false;
      result.errors.push(`SHA256 验证错误: ${error.message}`);
    }
  }

  return result;
}

/**
 * 生成数据指纹（包含多种校验值）
 * @param {Uint8Array|ArrayBuffer|string} data - 要生成指纹的数据
 * @returns {Object} 数据指纹
 */
export function generateFingerprint(data) {
  let dataSize;

  if (typeof data === 'string') {
    dataSize = new TextEncoder().encode(data).length;
  } else if (data instanceof ArrayBuffer) {
    dataSize = data.byteLength;
  } else if (data instanceof Uint8Array) {
    dataSize = data.length;
  } else {
    throw new Error('不支持的数据类型');
  }

  const crc32 = calculateCRC32(data);
  const sha256 = calculateSHA256(data);

  return {
    crc32,
    sha256,
    dataSize,
    timestamp: Date.now(),
    version: '1.0'
  };
}

/**
 * 比较两个数据是否相同（通过哈希值）
 * @param {Uint8Array|ArrayBuffer|string} data1 - 第一个数据
 * @param {Uint8Array|ArrayBuffer|string} data2 - 第二个数据
 * @param {string} algorithm - 算法类型，默认 'sha256'
 * @returns {boolean} 是否相同
 */
export function compareData(data1, data2, algorithm = 'sha256') {
  try {
    let hash1, hash2;

    if (algorithm === 'crc32') {
      hash1 = calculateCRC32(data1);
      hash2 = calculateCRC32(data2);
    } else if (algorithm === 'sha256') {
      hash1 = calculateSHA256(data1);
      hash2 = calculateSHA256(data2);
    } else {
      throw new Error('不支持的算法类型');
    }

    return hash1 === hash2;
  } catch (error) {
    return false;
  }
}

