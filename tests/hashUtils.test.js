/**
 * 校验工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  calculateCRC32,
  verifyCRC32,
  calculateSHA256,
  verifySHA256,
  calculateFileCRC32,
  calculateFileSHA256,
  calculateCRC32Batch,
  calculateSHA256Batch,
  calculateHashWithStats,
  verifyIntegrity,
  generateFingerprint,
  compareData
} from '../src/shared/utils/hashUtils.js';

describe('校验工具测试', () => {
  describe('CRC32 计算', () => {
    test('应该正确计算字符串的 CRC32', () => {
      const data = 'Hello, World!';
      const crc = calculateCRC32(data);
      
      expect(typeof crc).toBe('string');
      expect(crc.length).toBe(8);
      expect(/^[0-9a-f]{8}$/.test(crc)).toBe(true);
    });
    
    test('应该正确计算 Uint8Array 的 CRC32', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const crc = calculateCRC32(data);
      
      expect(typeof crc).toBe('string');
      expect(crc.length).toBe(8);
    });
    
    test('应该正确计算 ArrayBuffer 的 CRC32', () => {
      const buffer = new ArrayBuffer(5);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4, 5]);
      
      const crc = calculateCRC32(buffer);
      
      expect(typeof crc).toBe('string');
      expect(crc.length).toBe(8);
    });
    
    test('相同数据应该产生相同的 CRC32', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World!';
      
      const crc1 = calculateCRC32(data1);
      const crc2 = calculateCRC32(data2);
      
      expect(crc1).toBe(crc2);
    });
    
    test('不同数据应该产生不同的 CRC32', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World?';
      
      const crc1 = calculateCRC32(data1);
      const crc2 = calculateCRC32(data2);
      
      expect(crc1).not.toBe(crc2);
    });
    
    test('应该处理空数据', () => {
      const data = new Uint8Array([]);
      const crc = calculateCRC32(data);
      
      expect(typeof crc).toBe('string');
      expect(crc.length).toBe(8);
    });
  });
  
  describe('CRC32 验证', () => {
    test('应该正确验证 CRC32', () => {
      const data = 'Hello, World!';
      const crc = calculateCRC32(data);
      
      expect(verifyCRC32(data, crc)).toBe(true);
    });
    
    test('应该拒绝错误的 CRC32', () => {
      const data = 'Hello, World!';
      const wrongCrc = '00000000';
      
      expect(verifyCRC32(data, wrongCrc)).toBe(false);
    });
    
    test('应该忽略大小写', () => {
      const data = 'Hello, World!';
      const crc = calculateCRC32(data);
      
      expect(verifyCRC32(data, crc.toUpperCase())).toBe(true);
      expect(verifyCRC32(data, crc.toLowerCase())).toBe(true);
    });
  });
  
  describe('SHA256 计算', () => {
    test('应该正确计算字符串的 SHA256', () => {
      const data = 'Hello, World!';
      const hash = calculateSHA256(data);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });
    
    test('应该正确计算 Uint8Array 的 SHA256', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const hash = calculateSHA256(data);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });
    
    test('应该正确计算 ArrayBuffer 的 SHA256', () => {
      const buffer = new ArrayBuffer(5);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4, 5]);
      
      const hash = calculateSHA256(buffer);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });
    
    test('相同数据应该产生相同的 SHA256', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World!';
      
      const hash1 = calculateSHA256(data1);
      const hash2 = calculateSHA256(data2);
      
      expect(hash1).toBe(hash2);
    });
    
    test('不同数据应该产生不同的 SHA256', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World?';
      
      const hash1 = calculateSHA256(data1);
      const hash2 = calculateSHA256(data2);
      
      expect(hash1).not.toBe(hash2);
    });
    
    test('应该处理空数据', () => {
      const data = new Uint8Array([]);
      const hash = calculateSHA256(data);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });
    
    test('应该支持 Unicode 字符', () => {
      const data = '你好，世界！🌍';
      const hash = calculateSHA256(data);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });
  });
  
  describe('SHA256 验证', () => {
    test('应该正确验证 SHA256', () => {
      const data = 'Hello, World!';
      const hash = calculateSHA256(data);
      
      expect(verifySHA256(data, hash)).toBe(true);
    });
    
    test('应该拒绝错误的 SHA256', () => {
      const data = 'Hello, World!';
      const wrongHash = '0'.repeat(64);
      
      expect(verifySHA256(data, wrongHash)).toBe(false);
    });
    
    test('应该忽略大小写', () => {
      const data = 'Hello, World!';
      const hash = calculateSHA256(data);
      
      expect(verifySHA256(data, hash.toUpperCase())).toBe(true);
      expect(verifySHA256(data, hash.toLowerCase())).toBe(true);
    });
  });
  
  describe('批量计算', () => {
    test('应该批量计算 CRC32', () => {
      const dataArray = [
        'Hello',
        'World',
        new Uint8Array([1, 2, 3])
      ];
      
      const crcs = calculateCRC32Batch(dataArray);
      
      expect(Array.isArray(crcs)).toBe(true);
      expect(crcs.length).toBe(3);
      crcs.forEach(crc => {
        expect(typeof crc).toBe('string');
        expect(crc.length).toBe(8);
      });
    });
    
    test('应该批量计算 SHA256', () => {
      const dataArray = [
        'Hello',
        'World',
        new Uint8Array([1, 2, 3])
      ];
      
      const hashes = calculateSHA256Batch(dataArray);
      
      expect(Array.isArray(hashes)).toBe(true);
      expect(hashes.length).toBe(3);
      hashes.forEach(hash => {
        expect(typeof hash).toBe('string');
        expect(hash.length).toBe(64);
      });
    });
    
    test('应该拒绝非数组参数', () => {
      expect(() => calculateCRC32Batch('not an array')).toThrow();
      expect(() => calculateSHA256Batch('not an array')).toThrow();
    });
  });
  
  describe('统计信息', () => {
    test('应该返回 CRC32 统计信息', () => {
      const data = 'Hello, World!';
      const result = calculateHashWithStats(data, 'crc32');
      
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('algorithm');
      expect(result).toHaveProperty('dataSize');
      expect(result).toHaveProperty('hashLength');
      expect(result).toHaveProperty('calculationTime');
      
      expect(result.algorithm).toBe('crc32');
      expect(result.hashLength).toBe(8);
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
    });
    
    test('应该返回 SHA256 统计信息', () => {
      const data = 'Hello, World!';
      const result = calculateHashWithStats(data, 'sha256');
      
      expect(result.algorithm).toBe('sha256');
      expect(result.hashLength).toBe(64);
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
    });
    
    test('应该默认使用 SHA256', () => {
      const data = 'Hello, World!';
      const result = calculateHashWithStats(data);
      
      expect(result.algorithm).toBe('sha256');
    });
    
    test('应该拒绝不支持的算法', () => {
      const data = 'Hello, World!';
      expect(() => calculateHashWithStats(data, 'md5')).toThrow();
    });
  });
  
  describe('完整性验证', () => {
    test('应该验证 CRC32 完整性', () => {
      const data = 'Hello, World!';
      const crc32 = calculateCRC32(data);
      
      const result = verifyIntegrity(data, { crc32 });
      
      expect(result.valid).toBe(true);
      expect(result.crc32).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('应该验证 SHA256 完整性', () => {
      const data = 'Hello, World!';
      const sha256 = calculateSHA256(data);
      
      const result = verifyIntegrity(data, { sha256 });
      
      expect(result.valid).toBe(true);
      expect(result.sha256).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('应该同时验证 CRC32 和 SHA256', () => {
      const data = 'Hello, World!';
      const crc32 = calculateCRC32(data);
      const sha256 = calculateSHA256(data);
      
      const result = verifyIntegrity(data, { crc32, sha256 });
      
      expect(result.valid).toBe(true);
      expect(result.crc32).toBe(true);
      expect(result.sha256).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('应该检测 CRC32 错误', () => {
      const data = 'Hello, World!';
      const wrongCrc32 = '00000000';
      
      const result = verifyIntegrity(data, { crc32: wrongCrc32 });
      
      expect(result.valid).toBe(false);
      expect(result.crc32).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('应该检测 SHA256 错误', () => {
      const data = 'Hello, World!';
      const wrongSha256 = '0'.repeat(64);
      
      const result = verifyIntegrity(data, { sha256: wrongSha256 });
      
      expect(result.valid).toBe(false);
      expect(result.sha256).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('数据指纹', () => {
    test('应该生成完整的数据指纹', () => {
      const data = 'Hello, World!';
      const fingerprint = generateFingerprint(data);
      
      expect(fingerprint).toHaveProperty('crc32');
      expect(fingerprint).toHaveProperty('sha256');
      expect(fingerprint).toHaveProperty('dataSize');
      expect(fingerprint).toHaveProperty('timestamp');
      expect(fingerprint).toHaveProperty('version');
      
      expect(fingerprint.crc32.length).toBe(8);
      expect(fingerprint.sha256.length).toBe(64);
      expect(fingerprint.dataSize).toBeGreaterThan(0);
      expect(fingerprint.version).toBe('1.0');
    });
    
    test('相同数据应该产生相同的指纹（除了时间戳）', () => {
      const data = 'Hello, World!';
      const fp1 = generateFingerprint(data);
      const fp2 = generateFingerprint(data);
      
      expect(fp1.crc32).toBe(fp2.crc32);
      expect(fp1.sha256).toBe(fp2.sha256);
      expect(fp1.dataSize).toBe(fp2.dataSize);
    });
  });
  
  describe('数据比较', () => {
    test('应该正确比较相同的数据', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World!';
      
      expect(compareData(data1, data2)).toBe(true);
      expect(compareData(data1, data2, 'crc32')).toBe(true);
      expect(compareData(data1, data2, 'sha256')).toBe(true);
    });
    
    test('应该正确比较不同的数据', () => {
      const data1 = 'Hello, World!';
      const data2 = 'Hello, World?';
      
      expect(compareData(data1, data2)).toBe(false);
      expect(compareData(data1, data2, 'crc32')).toBe(false);
      expect(compareData(data1, data2, 'sha256')).toBe(false);
    });
    
    test('应该支持不同数据类型的比较', () => {
      const str = 'Hello';
      const uint8 = new TextEncoder().encode('Hello');
      
      expect(compareData(str, uint8)).toBe(true);
    });
  });
  
  describe('错误处理', () => {
    test('应该拒绝不支持的数据类型', () => {
      expect(() => calculateCRC32(123)).toThrow();
      expect(() => calculateCRC32(null)).toThrow();
      expect(() => calculateSHA256(123)).toThrow();
      expect(() => calculateSHA256(null)).toThrow();
    });
  });
});

