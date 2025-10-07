/**
 * 二维码工具模块
 * 提供二维码生成和解析功能
 */

import QRCode from 'qrcode';
import jsQR from 'jsqr';

/**
 * 生成二维码（Data URL 格式）
 * @param {string} data - 要编码的数据
 * @param {Object} options - 配置选项
 * @param {number} options.width - 二维码宽度，默认 400
 * @param {number} options.margin - 边距，默认 2
 * @param {string} options.errorCorrectionLevel - 纠错级别 ('L', 'M', 'Q', 'H')，默认 'M'
 * @param {string} options.color.dark - 前景色，默认 '#000000'
 * @param {string} options.color.light - 背景色，默认 '#FFFFFF'
 * @returns {Promise<string>} Data URL 格式的二维码图像
 */
export async function generateQRCode(data, options = {}) {
  try {
    const defaultOptions = {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      color: {
        ...defaultOptions.color,
        ...(options.color || {})
      }
    };

    const dataUrl = await QRCode.toDataURL(data, mergedOptions);
    return dataUrl;
  } catch (error) {
    throw new Error(`二维码生成失败: ${error.message}`);
  }
}

/**
 * 生成二维码（Canvas 格式）
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} data - 要编码的数据
 * @param {Object} options - 配置选项
 * @returns {Promise<void>}
 */
export async function generateQRCodeToCanvas(canvas, data, options = {}) {
  try {
    const defaultOptions = {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      color: {
        ...defaultOptions.color,
        ...(options.color || {})
      }
    };

    await QRCode.toCanvas(canvas, data, mergedOptions);
  } catch (error) {
    throw new Error(`二维码生成失败: ${error.message}`);
  }
}

/**
 * 批量生成二维码
 * @param {string[]} dataArray - 数据数组
 * @param {Object} options - 配置选项
 * @returns {Promise<string[]>} Data URL 数组
 */
export async function generateQRCodeBatch(dataArray, options = {}) {
  if (!Array.isArray(dataArray)) {
    throw new Error('参数必须是数组');
  }

  try {
    const promises = dataArray.map(data => generateQRCode(data, options));
    return await Promise.all(promises);
  } catch (error) {
    throw new Error(`批量生成二维码失败: ${error.message}`);
  }
}

/**
 * 从图像数据解析二维码
 * @param {ImageData} imageData - 图像数据
 * @returns {Object|null} 解析结果
 */
export function parseQRCode(imageData) {
  try {
    if (!imageData || !imageData.data) {
      throw new Error('无效的图像数据');
    }

    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (!code) {
      return null;
    }

    return {
      data: code.data,
      location: code.location,
      version: code.version,
      binaryData: code.binaryData
    };
  } catch (error) {
    throw new Error(`二维码解析失败: ${error.message}`);
  }
}

/**
 * 从 Canvas 解析二维码
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @returns {Object|null} 解析结果
 */
export function parseQRCodeFromCanvas(canvas) {
  try {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return parseQRCode(imageData);
  } catch (error) {
    throw new Error(`从 Canvas 解析二维码失败: ${error.message}`);
  }
}

/**
 * 从图像 URL 解析二维码
 * @param {string} imageUrl - 图像 URL
 * @returns {Promise<Object|null>} 解析结果
 */
export async function parseQRCodeFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = parseQRCode(imageData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('图像加载失败'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * 计算二维码容量
 * @param {string} data - 要编码的数据
 * @param {string} errorCorrectionLevel - 纠错级别
 * @returns {Object} 容量信息
 */
export function calculateQRCodeCapacity(data, errorCorrectionLevel = 'M') {
  const dataLength = new TextEncoder().encode(data).length;
  
  // 不同纠错级别的容量（字节）
  const capacities = {
    'L': 2953,  // 7% 纠错
    'M': 2331,  // 15% 纠错
    'Q': 1663,  // 25% 纠错
    'H': 1273   // 30% 纠错
  };
  
  const maxCapacity = capacities[errorCorrectionLevel] || capacities['M'];
  const usagePercentage = (dataLength / maxCapacity) * 100;
  
  return {
    dataLength,
    maxCapacity,
    usagePercentage: parseFloat(usagePercentage.toFixed(2)),
    canEncode: dataLength <= maxCapacity,
    errorCorrectionLevel
  };
}

/**
 * 获取推荐的纠错级别
 * @param {number} dataLength - 数据长度（字节）
 * @param {string} priority - 优先级 ('speed' 或 'reliability')
 * @returns {string} 推荐的纠错级别
 */
export function getRecommendedErrorCorrectionLevel(dataLength, priority = 'reliability') {
  if (priority === 'speed') {
    // 优先速度：使用较低的纠错级别
    if (dataLength <= 2953) return 'L';
    return 'M';
  } else {
    // 优先可靠性：使用较高的纠错级别
    if (dataLength <= 1273) return 'H';
    if (dataLength <= 1663) return 'Q';
    if (dataLength <= 2331) return 'M';
    return 'L';
  }
}

/**
 * 生成二维码并获取统计信息
 * @param {string} data - 要编码的数据
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 生成结果和统计信息
 */
export async function generateQRCodeWithStats(data, options = {}) {
  const startTime = performance.now();
  
  const capacity = calculateQRCodeCapacity(data, options.errorCorrectionLevel);
  
  if (!capacity.canEncode) {
    throw new Error(`数据过大，无法编码。数据长度: ${capacity.dataLength}，最大容量: ${capacity.maxCapacity}`);
  }
  
  const dataUrl = await generateQRCode(data, options);
  
  const endTime = performance.now();
  const generationTime = endTime - startTime;
  
  return {
    dataUrl,
    dataLength: capacity.dataLength,
    maxCapacity: capacity.maxCapacity,
    usagePercentage: capacity.usagePercentage,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.width || 400,
    generationTime: parseFloat(generationTime.toFixed(2))
  };
}

/**
 * 验证二维码数据
 * @param {string} data - 要验证的数据
 * @param {string} errorCorrectionLevel - 纠错级别
 * @returns {Object} 验证结果
 */
export function validateQRCodeData(data, errorCorrectionLevel = 'M') {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  if (typeof data !== 'string') {
    result.valid = false;
    result.errors.push('数据必须是字符串');
    return result;
  }
  
  if (data.length === 0) {
    result.valid = false;
    result.errors.push('数据不能为空');
    return result;
  }
  
  const capacity = calculateQRCodeCapacity(data, errorCorrectionLevel);
  
  if (!capacity.canEncode) {
    result.valid = false;
    result.errors.push(`数据过大，超出容量 ${capacity.usagePercentage.toFixed(2)}%`);
  } else if (capacity.usagePercentage > 90) {
    result.warnings.push(`数据接近容量上限 (${capacity.usagePercentage.toFixed(2)}%)`);
  }
  
  return result;
}

/**
 * 创建二维码序列（用于分片传输）
 * @param {string[]} dataArray - 数据数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Object[]>} 二维码序列
 */
export async function createQRCodeSequence(dataArray, options = {}) {
  if (!Array.isArray(dataArray)) {
    throw new Error('参数必须是数组');
  }
  
  const qrCodes = await generateQRCodeBatch(dataArray, options);
  
  return qrCodes.map((dataUrl, index) => ({
    index,
    total: dataArray.length,
    dataUrl,
    data: dataArray[index]
  }));
}

/**
 * 估算二维码生成时间
 * @param {number} count - 二维码数量
 * @param {number} avgDataLength - 平均数据长度
 * @returns {Object} 时间估算
 */
export function estimateGenerationTime(count, avgDataLength = 2048) {
  // 基于经验值：每个二维码约 5-10ms
  const avgTimePerQR = 7.5;
  const totalTime = count * avgTimePerQR;
  
  return {
    count,
    avgDataLength,
    estimatedTime: parseFloat(totalTime.toFixed(2)),
    estimatedTimeSeconds: parseFloat((totalTime / 1000).toFixed(2))
  };
}

