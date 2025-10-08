/**
 * 文件服务模块
 * 处理文件选择、验证和信息提取
 */

/**
 * 文件大小限制（字节）
 */
export const FILE_SIZE_LIMITS = {
  MVP: 1048576,      // 1MB (MVP 阶段)
  PHASE2: 5242880,   // 5MB (第二阶段)
  PHASE3: 10485760   // 10MB (第三阶段)
};

/**
 * 当前阶段的文件大小限制
 */
export const CURRENT_FILE_SIZE_LIMIT = FILE_SIZE_LIMITS.MVP;

/**
 * 支持的文件类型
 */
export const SUPPORTED_FILE_TYPES = {
  // 文本文件
  TEXT: ['.txt', '.md', '.json', '.xml', '.csv', '.log'],
  
  // Office 文档
  OFFICE: [
    '.doc', '.docx',   // Word
    '.xls', '.xlsx',   // Excel
    '.ppt', '.pptx',   // PowerPoint
    '.pdf'             // PDF
  ],
  
  // 图片
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  
  // 压缩文件
  ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  
  // 其他
  OTHER: ['*']
};

/**
 * 获取所有支持的文件扩展名
 */
export function getAllSupportedExtensions() {
  const extensions = [];
  for (const category in SUPPORTED_FILE_TYPES) {
    if (category !== 'OTHER') {
      extensions.push(...SUPPORTED_FILE_TYPES[category]);
    }
  }
  return extensions;
}

/**
 * 选择文件
 * @returns {Promise<Object>} 文件信息或错误
 */
export async function selectFile() {
  try {
    const result = await window.electronAPI.file.select();
    
    if (!result.success) {
      if (result.canceled) {
        return {
          success: false,
          canceled: true,
          message: '用户取消选择'
        };
      }
      
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }
    
    // 返回文件信息
    return {
      success: true,
      file: {
        path: result.filePath,
        name: result.fileName,
        size: result.fileSize,
        type: result.fileType,
        sizeFormatted: formatFileSize(result.fileSize)
      }
    };
  } catch (error) {
    console.error('Select file error:', error);
    return {
      success: false,
      error: 'SELECT_FILE_ERROR',
      message: error.message
    };
  }
}

/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @param {number} maxSize - 最大大小（字节），默认使用当前阶段限制
 * @returns {Object} 验证结果
 */
export function validateFileSize(fileSize, maxSize = CURRENT_FILE_SIZE_LIMIT) {
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: 'FILE_TOO_LARGE',
      message: `文件大小超过限制（最大 ${formatFileSize(maxSize)}），当前文件大小：${formatFileSize(fileSize)}`
    };
  }
  
  return {
    valid: true,
    size: fileSize,
    sizeFormatted: formatFileSize(fileSize),
    percentage: ((fileSize / maxSize) * 100).toFixed(2)
  };
}

/**
 * 验证文件类型
 * @param {string} fileType - 文件扩展名（如 .txt）
 * @param {Array<string>} allowedTypes - 允许的文件类型，默认为所有支持的类型
 * @returns {Object} 验证结果
 */
export function validateFileType(fileType, allowedTypes = null) {
  // 如果没有指定允许的类型，使用所有支持的类型
  if (!allowedTypes) {
    allowedTypes = getAllSupportedExtensions();
  }
  
  // 转换为小写进行比较
  const lowerFileType = fileType.toLowerCase();
  const lowerAllowedTypes = allowedTypes.map(t => t.toLowerCase());
  
  // 检查是否在允许的类型中
  const isAllowed = lowerAllowedTypes.includes(lowerFileType) || 
                    lowerAllowedTypes.includes('*');
  
  if (!isAllowed) {
    return {
      valid: false,
      error: 'UNSUPPORTED_FILE_TYPE',
      message: `不支持的文件类型：${fileType}`,
      allowedTypes
    };
  }
  
  return {
    valid: true,
    type: fileType,
    category: getFileCategory(fileType)
  };
}

/**
 * 获取文件类别
 * @param {string} fileType - 文件扩展名
 * @returns {string} 文件类别
 */
export function getFileCategory(fileType) {
  const lowerFileType = fileType.toLowerCase();
  
  for (const [category, extensions] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if (extensions.map(e => e.toLowerCase()).includes(lowerFileType)) {
      return category;
    }
  }
  
  return 'OTHER';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 文件数据或错误
 */
export async function readFile(filePath) {
  try {
    const result = await window.electronAPI.file.read(filePath);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }
    
    return {
      success: true,
      data: result.data,
      size: result.size
    };
  } catch (error) {
    console.error('Read file error:', error);
    return {
      success: false,
      error: 'READ_FILE_ERROR',
      message: error.message
    };
  }
}

/**
 * 获取文件信息
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 文件信息或错误
 */
export async function getFileInfo(filePath) {
  try {
    const result = await window.electronAPI.file.info(filePath);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        message: result.message
      };
    }
    
    return {
      success: true,
      info: {
        ...result.info,
        sizeFormatted: formatFileSize(result.info.size)
      }
    };
  } catch (error) {
    console.error('Get file info error:', error);
    return {
      success: false,
      error: 'GET_FILE_INFO_ERROR',
      message: error.message
    };
  }
}

/**
 * 完整的文件选择和验证流程
 * @param {Object} options - 选项
 * @param {number} options.maxSize - 最大文件大小
 * @param {Array<string>} options.allowedTypes - 允许的文件类型
 * @returns {Promise<Object>} 文件信息或错误
 */
export async function selectAndValidateFile(options = {}) {
  const {
    maxSize = CURRENT_FILE_SIZE_LIMIT,
    allowedTypes = null
  } = options;
  
  // 1. 选择文件
  const selectResult = await selectFile();
  
  if (!selectResult.success) {
    return selectResult;
  }
  
  const { file } = selectResult;
  
  // 2. 验证文件大小
  const sizeValidation = validateFileSize(file.size, maxSize);
  
  if (!sizeValidation.valid) {
    return {
      success: false,
      error: sizeValidation.error,
      message: sizeValidation.message
    };
  }
  
  // 3. 验证文件类型
  const typeValidation = validateFileType(file.type, allowedTypes);
  
  if (!typeValidation.valid) {
    return {
      success: false,
      error: typeValidation.error,
      message: typeValidation.message
    };
  }
  
  // 4. 返回完整的文件信息
  return {
    success: true,
    file: {
      ...file,
      category: typeValidation.category,
      validation: {
        size: sizeValidation,
        type: typeValidation
      }
    }
  };
}

/**
 * 计算文件可以分成多少个分片
 * @param {number} fileSize - 文件大小（字节）
 * @param {number} chunkSize - 分片大小（字节），默认 2048
 * @returns {number} 分片数量
 */
export function calculateChunkCount(fileSize, chunkSize = 2048) {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * 估算传输时间
 * @param {number} chunkCount - 分片数量
 * @param {number} qrPerSecond - 每秒显示的二维码数量，默认 5
 * @returns {Object} 时间估算
 */
export function estimateTransferTime(chunkCount, qrPerSecond = 5) {
  const totalSeconds = Math.ceil(chunkCount / qrPerSecond);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return {
    totalSeconds,
    minutes,
    seconds,
    formatted: minutes > 0 
      ? `${minutes} 分 ${seconds} 秒`
      : `${seconds} 秒`
  };
}

