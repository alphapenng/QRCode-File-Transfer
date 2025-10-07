/**
 * 编码工具模块
 * 提供 Base64 编码/解码功能
 */

/**
 * 将 Uint8Array 编码为 Base64 字符串
 * @param {Uint8Array} uint8Array - 要编码的数据
 * @returns {string} Base64 字符串
 */
export function uint8ArrayToBase64(uint8Array) {
  if (!(uint8Array instanceof Uint8Array)) {
    throw new Error('参数必须是 Uint8Array');
  }

  // 使用浏览器原生 API
  if (typeof btoa !== 'undefined') {
    // 将 Uint8Array 转换为二进制字符串
    let binaryString = '';
    const len = uint8Array.length;
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
  }

  // Node.js 环境
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(uint8Array).toString('base64');
  }

  throw new Error('当前环境不支持 Base64 编码');
}

/**
 * 将 Base64 字符串解码为 Uint8Array
 * @param {string} base64String - Base64 字符串
 * @returns {Uint8Array} 解码后的数据
 */
export function base64ToUint8Array(base64String) {
  if (typeof base64String !== 'string') {
    throw new Error('参数必须是字符串');
  }

  // 使用浏览器原生 API
  if (typeof atob !== 'undefined') {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
  }

  // Node.js 环境
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64String, 'base64'));
  }

  throw new Error('当前环境不支持 Base64 解码');
}

/**
 * 将 ArrayBuffer 编码为 Base64 字符串
 * @param {ArrayBuffer} arrayBuffer - 要编码的数据
 * @returns {string} Base64 字符串
 */
export function arrayBufferToBase64(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    throw new Error('参数必须是 ArrayBuffer');
  }

  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8ArrayToBase64(uint8Array);
}

/**
 * 将 Base64 字符串解码为 ArrayBuffer
 * @param {string} base64String - Base64 字符串
 * @returns {ArrayBuffer} 解码后的数据
 */
export function base64ToArrayBuffer(base64String) {
  const uint8Array = base64ToUint8Array(base64String);
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  );
}

/**
 * 将字符串编码为 Base64
 * @param {string} str - 要编码的字符串
 * @param {string} encoding - 字符编码，默认 'utf-8'
 * @returns {string} Base64 字符串
 */
export function stringToBase64(str, encoding = 'utf-8') {
  if (typeof str !== 'string') {
    throw new Error('参数必须是字符串');
  }

  // 使用 TextEncoder 将字符串转换为 Uint8Array
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);
  return uint8ArrayToBase64(uint8Array);
}

/**
 * 将 Base64 字符串解码为字符串
 * @param {string} base64String - Base64 字符串
 * @param {string} encoding - 字符编码，默认 'utf-8'
 * @returns {string} 解码后的字符串
 */
export function base64ToString(base64String, encoding = 'utf-8') {
  const uint8Array = base64ToUint8Array(base64String);
  
  // 使用 TextDecoder 将 Uint8Array 转换为字符串
  const decoder = new TextDecoder(encoding);
  return decoder.decode(uint8Array);
}

/**
 * 验证 Base64 字符串格式
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否为有效的 Base64 字符串
 */
export function isValidBase64(str) {
  if (typeof str !== 'string') {
    return false;
  }

  // Base64 字符集：A-Z, a-z, 0-9, +, /, =
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  // 检查格式
  if (!base64Regex.test(str)) {
    return false;
  }

  // 检查长度（必须是 4 的倍数）
  if (str.length % 4 !== 0) {
    return false;
  }

  return true;
}

/**
 * 计算 Base64 编码后的大小
 * @param {number} originalSize - 原始数据大小（字节）
 * @returns {number} Base64 编码后的大小（字节）
 */
export function getBase64Size(originalSize) {
  // Base64 编码会增加约 33% 的大小
  // 公式：Math.ceil(originalSize / 3) * 4
  return Math.ceil(originalSize / 3) * 4;
}

/**
 * 计算 Base64 解码后的大小
 * @param {string} base64String - Base64 字符串
 * @returns {number} 解码后的大小（字节）
 */
export function getDecodedSize(base64String) {
  if (!isValidBase64(base64String)) {
    throw new Error('无效的 Base64 字符串');
  }

  const len = base64String.length;
  let padding = 0;

  // 计算填充字符数量
  if (base64String.endsWith('==')) {
    padding = 2;
  } else if (base64String.endsWith('=')) {
    padding = 1;
  }

  // 公式：(len / 4) * 3 - padding
  return (len / 4) * 3 - padding;
}

/**
 * 分块编码大数据
 * @param {Uint8Array|ArrayBuffer} data - 要编码的数据
 * @param {number} chunkSize - 每块的大小（字节），默认 1MB
 * @returns {string[]} Base64 字符串数组
 */
export function encodeInChunks(data, chunkSize = 1048576) {
  // 确保数据是 Uint8Array
  let uint8Array;
  if (data instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(data);
  } else if (data instanceof Uint8Array) {
    uint8Array = data;
  } else {
    throw new Error('参数必须是 Uint8Array 或 ArrayBuffer');
  }

  const chunks = [];
  const totalChunks = Math.ceil(uint8Array.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, uint8Array.length);
    const chunk = uint8Array.slice(start, end);
    chunks.push(uint8ArrayToBase64(chunk));
  }

  return chunks;
}

/**
 * 解码分块数据
 * @param {string[]} base64Chunks - Base64 字符串数组
 * @returns {Uint8Array} 解码后的完整数据
 */
export function decodeChunks(base64Chunks) {
  if (!Array.isArray(base64Chunks)) {
    throw new Error('参数必须是数组');
  }

  // 解码所有块
  const decodedChunks = base64Chunks.map(chunk => base64ToUint8Array(chunk));

  // 计算总长度
  const totalLength = decodedChunks.reduce((sum, chunk) => sum + chunk.length, 0);

  // 合并所有块
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of decodedChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * URL 安全的 Base64 编码
 * @param {Uint8Array|ArrayBuffer|string} data - 要编码的数据
 * @returns {string} URL 安全的 Base64 字符串
 */
export function encodeBase64Url(data) {
  let base64;
  
  if (typeof data === 'string') {
    base64 = stringToBase64(data);
  } else if (data instanceof Uint8Array) {
    base64 = uint8ArrayToBase64(data);
  } else if (data instanceof ArrayBuffer) {
    base64 = arrayBufferToBase64(data);
  } else {
    throw new Error('不支持的数据类型');
  }

  // 替换 URL 不安全的字符
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * URL 安全的 Base64 解码
 * @param {string} base64UrlString - URL 安全的 Base64 字符串
 * @returns {Uint8Array} 解码后的数据
 */
export function decodeBase64Url(base64UrlString) {
  if (typeof base64UrlString !== 'string') {
    throw new Error('参数必须是字符串');
  }

  // 还原标准 Base64 字符
  let base64 = base64UrlString
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // 添加填充字符
  const padding = base64.length % 4;
  if (padding > 0) {
    base64 += '='.repeat(4 - padding);
  }

  return base64ToUint8Array(base64);
}

/**
 * 编码并获取统计信息
 * @param {Uint8Array|ArrayBuffer|string} data - 要编码的数据
 * @returns {Object} 编码结果和统计信息
 */
export function encodeWithStats(data) {
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

  const startTime = performance.now();
  let encoded;
  
  if (typeof data === 'string') {
    encoded = stringToBase64(data);
  } else if (data instanceof Uint8Array) {
    encoded = uint8ArrayToBase64(data);
  } else {
    encoded = arrayBufferToBase64(data);
  }
  
  const endTime = performance.now();
  const encodedSize = encoded.length;
  const encodingTime = endTime - startTime;
  const overhead = encodedSize - originalSize;
  const overheadPercentage = (overhead / originalSize) * 100;

  return {
    data: encoded,
    originalSize,
    encodedSize,
    encodingTime: parseFloat(encodingTime.toFixed(2)),
    overhead,
    overheadPercentage: parseFloat(overheadPercentage.toFixed(2))
  };
}

