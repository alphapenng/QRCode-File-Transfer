/**
 * 文件处理工具模块
 * 提供文件读取、分片、合并等功能
 */

/**
 * 读取文件为 ArrayBuffer
 * @param {File} file - 文件对象
 * @returns {Promise<ArrayBuffer>}
 */
export async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error(`文件读取失败: ${error.message}`));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 读取文件为 Base64 字符串
 * @param {File} file - 文件对象
 * @returns {Promise<string>}
 */
export async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // 移除 data URL 前缀，只保留 Base64 数据
      const base64 = event.target.result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = (error) => {
      reject(new Error(`文件读取失败: ${error.message}`));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 读取文件为文本
 * @param {File} file - 文件对象
 * @param {string} encoding - 编码格式，默认 'utf-8'
 * @returns {Promise<string>}
 */
export async function readFileAsText(file, encoding = 'utf-8') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error(`文件读取失败: ${error.message}`));
    };
    
    reader.readAsText(file, encoding);
  });
}

/**
 * 将数据分片
 * @param {ArrayBuffer|Uint8Array} data - 要分片的数据
 * @param {number} chunkSize - 每个分片的大小（字节）
 * @returns {Uint8Array[]} 分片数组
 */
export function splitIntoChunks(data, chunkSize = 2048) {
  // 确保数据是 Uint8Array
  const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data);
  
  const chunks = [];
  const totalChunks = Math.ceil(uint8Array.length / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, uint8Array.length);
    const chunk = uint8Array.slice(start, end);
    chunks.push(chunk);
  }
  
  return chunks;
}

/**
 * 合并分片
 * @param {Uint8Array[]} chunks - 分片数组
 * @returns {Uint8Array} 合并后的数据
 */
export function mergeChunks(chunks) {
  // 计算总长度
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  
  // 创建结果数组
  const result = new Uint8Array(totalLength);
  
  // 复制所有分片
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * 获取文件信息
 * @param {File} file - 文件对象
 * @returns {Object} 文件信息
 */
export function getFileInfo(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    extension: getFileExtension(file.name)
  };
}

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 扩展名（不含点号）
 */
export function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return '';
  }
  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 是否符合大小限制
 */
export function validateFileSize(file, maxSize) {
  return file.size <= maxSize;
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string[]} allowedTypes - 允许的文件类型数组（扩展名）
 * @returns {boolean} 是否符合类型限制
 */
export function validateFileType(file, allowedTypes) {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }
  
  const extension = getFileExtension(file.name);
  return allowedTypes.includes(extension);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ArrayBuffer 转 Uint8Array
 * @param {ArrayBuffer} buffer - ArrayBuffer
 * @returns {Uint8Array}
 */
export function arrayBufferToUint8Array(buffer) {
  return new Uint8Array(buffer);
}

/**
 * Uint8Array 转 ArrayBuffer
 * @param {Uint8Array} uint8Array - Uint8Array
 * @returns {ArrayBuffer}
 */
export function uint8ArrayToArrayBuffer(uint8Array) {
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  );
}

/**
 * 创建 Blob 对象
 * @param {Uint8Array|ArrayBuffer} data - 数据
 * @param {string} type - MIME 类型
 * @returns {Blob}
 */
export function createBlob(data, type = 'application/octet-stream') {
  return new Blob([data], { type });
}

/**
 * 下载文件
 * @param {Blob|Uint8Array|ArrayBuffer} data - 文件数据
 * @param {string} fileName - 文件名
 * @param {string} type - MIME 类型
 */
export function downloadFile(data, fileName, type = 'application/octet-stream') {
  // 确保数据是 Blob
  const blob = data instanceof Blob ? data : createBlob(data, type);
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 计算分片数量
 * @param {number} fileSize - 文件大小（字节）
 * @param {number} chunkSize - 分片大小（字节）
 * @returns {number} 分片数量
 */
export function calculateChunkCount(fileSize, chunkSize) {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * 获取分片信息
 * @param {number} chunkIndex - 分片索引（从 0 开始）
 * @param {number} totalChunks - 总分片数
 * @param {number} chunkSize - 分片大小
 * @param {number} fileSize - 文件总大小
 * @returns {Object} 分片信息
 */
export function getChunkInfo(chunkIndex, totalChunks, chunkSize, fileSize) {
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, fileSize);
  const size = end - start;
  const isLast = chunkIndex === totalChunks - 1;
  
  return {
    index: chunkIndex,
    start,
    end,
    size,
    isLast,
    progress: ((chunkIndex + 1) / totalChunks * 100).toFixed(2)
  };
}

