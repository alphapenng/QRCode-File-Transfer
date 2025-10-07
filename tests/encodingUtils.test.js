/**
 * 编码工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  stringToBase64,
  base64ToString,
  isValidBase64,
  getBase64Size,
  getDecodedSize,
  encodeInChunks,
  decodeChunks,
  encodeBase64Url,
  decodeBase64Url,
  encodeWithStats
} from '../src/shared/utils/encodingUtils.js';

describe('编码工具测试', () => {
  describe('Uint8Array 和 Base64 互转', () => {
    test('应该正确编码 Uint8Array 为 Base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const base64 = uint8ArrayToBase64(data);
      
      expect(typeof base64).toBe('string');
      expect(base64).toBe('SGVsbG8=');
    });
    
    test('应该正确解码 Base64 为 Uint8Array', () => {
      const base64 = 'SGVsbG8=';
      const data = base64ToUint8Array(base64);
      
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });
    
    test('编码和解码应该是可逆的', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const base64 = uint8ArrayToBase64(original);
      const decoded = base64ToUint8Array(base64);
      
      expect(decoded).toEqual(original);
    });
    
    test('应该处理空数组', () => {
      const data = new Uint8Array([]);
      const base64 = uint8ArrayToBase64(data);
      const decoded = base64ToUint8Array(base64);
      
      expect(decoded).toEqual(data);
    });
  });
  
  describe('ArrayBuffer 和 Base64 互转', () => {
    test('应该正确编码 ArrayBuffer 为 Base64', () => {
      const buffer = new ArrayBuffer(5);
      const view = new Uint8Array(buffer);
      view.set([72, 101, 108, 108, 111]); // "Hello"
      
      const base64 = arrayBufferToBase64(buffer);
      expect(base64).toBe('SGVsbG8=');
    });
    
    test('应该正确解码 Base64 为 ArrayBuffer', () => {
      const base64 = 'SGVsbG8=';
      const buffer = base64ToArrayBuffer(base64);
      
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBe(5);
      
      const view = new Uint8Array(buffer);
      expect(view).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });
    
    test('编码和解码应该是可逆的', () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < 10; i++) {
        view[i] = i + 1;
      }
      
      const base64 = arrayBufferToBase64(buffer);
      const decoded = base64ToArrayBuffer(base64);
      
      expect(new Uint8Array(decoded)).toEqual(view);
    });
  });
  
  describe('字符串和 Base64 互转', () => {
    test('应该正确编码字符串为 Base64', () => {
      const str = 'Hello, World!';
      const base64 = stringToBase64(str);
      
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });
    
    test('应该正确解码 Base64 为字符串', () => {
      const str = 'Hello, World!';
      const base64 = stringToBase64(str);
      const decoded = base64ToString(base64);
      
      expect(decoded).toBe(str);
    });
    
    test('应该支持 Unicode 字符', () => {
      const str = '你好，世界！🌍';
      const base64 = stringToBase64(str);
      const decoded = base64ToString(base64);
      
      expect(decoded).toBe(str);
    });
    
    test('应该支持空字符串', () => {
      const str = '';
      const base64 = stringToBase64(str);
      const decoded = base64ToString(base64);
      
      expect(decoded).toBe(str);
    });
    
    test('应该支持特殊字符', () => {
      const str = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\';
      const base64 = stringToBase64(str);
      const decoded = base64ToString(base64);
      
      expect(decoded).toBe(str);
    });
  });
  
  describe('isValidBase64', () => {
    test('应该识别有效的 Base64 字符串', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true);
      expect(isValidBase64('SGVsbG8gV29ybGQh')).toBe(true);
      expect(isValidBase64('')).toBe(true);
    });
    
    test('应该识别无效的 Base64 字符串', () => {
      expect(isValidBase64('Hello!')).toBe(false);
      expect(isValidBase64('SGVsbG8')).toBe(false); // 长度不是 4 的倍数
      expect(isValidBase64('SGVs bG8=')).toBe(false); // 包含空格
      expect(isValidBase64('SGVsbG8===')).toBe(false); // 填充字符过多
    });
    
    test('应该拒绝非字符串参数', () => {
      expect(isValidBase64(123)).toBe(false);
      expect(isValidBase64(null)).toBe(false);
      expect(isValidBase64(undefined)).toBe(false);
    });
  });
  
  describe('getBase64Size', () => {
    test('应该正确计算 Base64 编码后的大小', () => {
      expect(getBase64Size(3)).toBe(4);
      expect(getBase64Size(6)).toBe(8);
      expect(getBase64Size(9)).toBe(12);
      expect(getBase64Size(10)).toBe(16);
    });
    
    test('应该处理 0 大小', () => {
      expect(getBase64Size(0)).toBe(0);
    });
  });
  
  describe('getDecodedSize', () => {
    test('应该正确计算解码后的大小', () => {
      expect(getDecodedSize('SGVsbG8=')).toBe(5); // "Hello"
      expect(getDecodedSize('SGVsbG8gV29ybGQh')).toBe(12); // "Hello World!"
    });
    
    test('应该处理不同的填充情况', () => {
      expect(getDecodedSize('YQ==')).toBe(1); // "a"
      expect(getDecodedSize('YWI=')).toBe(2); // "ab"
      expect(getDecodedSize('YWJj')).toBe(3); // "abc"
    });
    
    test('应该拒绝无效的 Base64 字符串', () => {
      expect(() => getDecodedSize('Invalid!')).toThrow();
    });
  });
  
  describe('分块编码和解码', () => {
    test('应该正确分块编码数据', () => {
      const data = new Uint8Array(10000);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      
      const chunks = encodeInChunks(data, 1000);
      
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBe(10);
      chunks.forEach(chunk => {
        expect(typeof chunk).toBe('string');
        expect(isValidBase64(chunk)).toBe(true);
      });
    });
    
    test('应该正确解码分块数据', () => {
      const original = new Uint8Array(10000);
      for (let i = 0; i < original.length; i++) {
        original[i] = i % 256;
      }
      
      const chunks = encodeInChunks(original, 1000);
      const decoded = decodeChunks(chunks);
      
      expect(decoded).toEqual(original);
    });
    
    test('应该处理单个块', () => {
      const data = new Uint8Array([1, 2, 3]);
      const chunks = encodeInChunks(data, 1000);
      
      expect(chunks.length).toBe(1);
      
      const decoded = decodeChunks(chunks);
      expect(decoded).toEqual(data);
    });
  });
  
  describe('URL 安全的 Base64', () => {
    test('应该编码为 URL 安全的 Base64', () => {
      const data = new Uint8Array([255, 254, 253]);
      const urlSafe = encodeBase64Url(data);
      
      expect(urlSafe).not.toContain('+');
      expect(urlSafe).not.toContain('/');
      expect(urlSafe).not.toContain('=');
    });
    
    test('应该解码 URL 安全的 Base64', () => {
      const original = new Uint8Array([255, 254, 253]);
      const urlSafe = encodeBase64Url(original);
      const decoded = decodeBase64Url(urlSafe);
      
      expect(decoded).toEqual(original);
    });
    
    test('应该支持字符串编码', () => {
      const str = 'Hello, World!';
      const urlSafe = encodeBase64Url(str);
      const decoded = decodeBase64Url(urlSafe);
      const decodedStr = base64ToString(uint8ArrayToBase64(decoded));
      
      expect(decodedStr).toBe(str);
    });
  });
  
  describe('encodeWithStats', () => {
    test('应该返回编码统计信息', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const result = encodeWithStats(data);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('encodedSize');
      expect(result).toHaveProperty('encodingTime');
      expect(result).toHaveProperty('overhead');
      expect(result).toHaveProperty('overheadPercentage');
      
      expect(result.originalSize).toBe(5);
      expect(result.encodedSize).toBeGreaterThan(5);
      expect(result.overhead).toBeGreaterThan(0);
      expect(result.encodingTime).toBeGreaterThanOrEqual(0);
    });
    
    test('应该支持字符串输入', () => {
      const str = 'Hello, World!';
      const result = encodeWithStats(str);
      
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.encodedSize).toBeGreaterThan(result.originalSize);
    });
    
    test('应该支持 ArrayBuffer 输入', () => {
      const buffer = new ArrayBuffer(10);
      const result = encodeWithStats(buffer);
      
      expect(result.originalSize).toBe(10);
      expect(result.encodedSize).toBeGreaterThan(10);
    });
  });
  
  describe('错误处理', () => {
    test('uint8ArrayToBase64 应该拒绝非 Uint8Array 参数', () => {
      expect(() => uint8ArrayToBase64('invalid')).toThrow();
      expect(() => uint8ArrayToBase64(123)).toThrow();
    });
    
    test('base64ToUint8Array 应该拒绝非字符串参数', () => {
      expect(() => base64ToUint8Array(123)).toThrow();
      expect(() => base64ToUint8Array(null)).toThrow();
    });
    
    test('arrayBufferToBase64 应该拒绝非 ArrayBuffer 参数', () => {
      expect(() => arrayBufferToBase64('invalid')).toThrow();
      expect(() => arrayBufferToBase64(new Uint8Array([1, 2, 3]))).toThrow();
    });
    
    test('stringToBase64 应该拒绝非字符串参数', () => {
      expect(() => stringToBase64(123)).toThrow();
      expect(() => stringToBase64(null)).toThrow();
    });
  });
  
  describe('往返测试', () => {
    test('大数据编码和解码应该保持一致', () => {
      const original = new Uint8Array(100000);
      for (let i = 0; i < original.length; i++) {
        original[i] = i % 256;
      }
      
      const base64 = uint8ArrayToBase64(original);
      const decoded = base64ToUint8Array(base64);
      
      expect(decoded).toEqual(original);
    });
    
    test('长字符串编码和解码应该保持一致', () => {
      const original = 'Lorem ipsum dolor sit amet, '.repeat(1000);
      const base64 = stringToBase64(original);
      const decoded = base64ToString(base64);
      
      expect(decoded).toBe(original);
    });
  });
});

