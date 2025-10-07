/**
 * 压缩工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  compress,
  decompress,
  compressString,
  decompressToString,
  getCompressionRatio,
  isGzipCompressed,
  compressWithStats,
  decompressWithStats,
  compressBatch,
  decompressBatch,
  getRecommendedCompressionLevel
} from '../src/shared/utils/compressionUtils.js';

describe('压缩工具测试', () => {
  describe('compress 和 decompress', () => {
    test('应该正确压缩和解压 Uint8Array', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const compressed = compress(original);
      const decompressed = decompress(compressed);
      
      expect(decompressed).toEqual(original);
    });
    
    test('应该正确压缩和解压 ArrayBuffer', () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < 10; i++) {
        view[i] = i + 1;
      }
      
      const compressed = compress(buffer);
      const decompressed = decompress(compressed);
      
      expect(decompressed).toEqual(view);
    });
    
    test('应该正确压缩和解压字符串', () => {
      const original = 'Hello, World! 你好，世界！';
      const compressed = compress(original);
      const decompressed = decompress(compressed, { to: 'string' });
      
      expect(decompressed).toBe(original);
    });
    
    test('压缩后的数据应该更小（对于重复数据）', () => {
      const original = new Uint8Array(1000).fill(65); // 1000 个 'A'
      const compressed = compress(original);
      
      expect(compressed.length).toBeLessThan(original.length);
    });
  });
  
  describe('compressString 和 decompressToString', () => {
    test('应该正确压缩和解压字符串', () => {
      const original = 'This is a test string with some repeated content. ' +
                       'This is a test string with some repeated content.';
      const compressed = compressString(original);
      const decompressed = decompressToString(compressed);
      
      expect(decompressed).toBe(original);
    });
    
    test('应该支持 Unicode 字符', () => {
      const original = '你好世界 🌍 Hello World 🚀';
      const compressed = compressString(original);
      const decompressed = decompressToString(compressed);
      
      expect(decompressed).toBe(original);
    });
    
    test('应该支持空字符串', () => {
      const original = '';
      const compressed = compressString(original);
      const decompressed = decompressToString(compressed);
      
      expect(decompressed).toBe(original);
    });
  });
  
  describe('压缩级别', () => {
    test('不同压缩级别应该产生不同大小的结果', () => {
      const data = new Uint8Array(1000).fill(65);
      
      const compressed1 = compress(data, { level: 1 });
      const compressed9 = compress(data, { level: 9 });
      
      // 高压缩级别应该产生更小的结果
      expect(compressed9.length).toBeLessThanOrEqual(compressed1.length);
    });
  });
  
  describe('getCompressionRatio', () => {
    test('应该正确计算压缩率', () => {
      const ratio = getCompressionRatio(1000, 500);
      
      expect(ratio.ratio).toBe(0.5);
      expect(ratio.percentage).toBe(50);
      expect(ratio.saved).toBe(500);
      expect(ratio.savedPercentage).toBe(50);
    });
    
    test('应该处理原始大小为 0 的情况', () => {
      const ratio = getCompressionRatio(0, 0);
      
      expect(ratio.ratio).toBe(0);
      expect(ratio.percentage).toBe(0);
      expect(ratio.saved).toBe(0);
      expect(ratio.savedPercentage).toBe(0);
    });
    
    test('应该处理压缩后更大的情况', () => {
      const ratio = getCompressionRatio(100, 150);
      
      expect(ratio.ratio).toBe(1.5);
      expect(ratio.percentage).toBe(150);
      expect(ratio.saved).toBe(-50);
      expect(ratio.savedPercentage).toBe(-50);
    });
  });
  
  describe('isGzipCompressed', () => {
    test('应该识别 gzip 压缩的数据', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const compressed = compress(data);
      
      expect(isGzipCompressed(compressed)).toBe(true);
    });
    
    test('应该识别未压缩的数据', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      
      expect(isGzipCompressed(data)).toBe(false);
    });
    
    test('应该处理空数据', () => {
      const data = new Uint8Array([]);
      
      expect(isGzipCompressed(data)).toBe(false);
    });
    
    test('应该处理单字节数据', () => {
      const data = new Uint8Array([0x1f]);
      
      expect(isGzipCompressed(data)).toBe(false);
    });
  });
  
  describe('compressWithStats', () => {
    test('应该返回压缩统计信息', () => {
      const data = new Uint8Array(1000).fill(65);
      const result = compressWithStats(data);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('compressedSize');
      expect(result).toHaveProperty('compressionTime');
      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('saved');
      expect(result).toHaveProperty('savedPercentage');
      
      expect(result.originalSize).toBe(1000);
      expect(result.compressedSize).toBeLessThan(1000);
      expect(result.compressionTime).toBeGreaterThanOrEqual(0);
    });
    
    test('应该支持字符串输入', () => {
      const data = 'Hello, World!'.repeat(100);
      const result = compressWithStats(data);
      
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeGreaterThan(0);
    });
  });
  
  describe('decompressWithStats', () => {
    test('应该返回解压统计信息', () => {
      const original = new Uint8Array(1000).fill(65);
      const compressed = compress(original);
      const result = decompressWithStats(compressed);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('compressedSize');
      expect(result).toHaveProperty('decompressedSize');
      expect(result).toHaveProperty('decompressionTime');
      expect(result).toHaveProperty('ratio');
      
      expect(result.decompressedSize).toBe(1000);
      expect(result.decompressionTime).toBeGreaterThanOrEqual(0);
      expect(result.data).toEqual(original);
    });
  });
  
  describe('批量操作', () => {
    test('compressBatch 应该压缩多个数据块', () => {
      const dataArray = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Uint8Array([7, 8, 9])
      ];
      
      const compressed = compressBatch(dataArray);
      
      expect(compressed.length).toBe(3);
      compressed.forEach(data => {
        expect(isGzipCompressed(data)).toBe(true);
      });
    });
    
    test('decompressBatch 应该解压多个数据块', () => {
      const dataArray = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Uint8Array([7, 8, 9])
      ];
      
      const compressed = compressBatch(dataArray);
      const decompressed = decompressBatch(compressed);
      
      expect(decompressed.length).toBe(3);
      decompressed.forEach((data, index) => {
        expect(data).toEqual(dataArray[index]);
      });
    });
  });
  
  describe('getRecommendedCompressionLevel', () => {
    test('应该为小文件推荐较低的压缩级别（速度优先）', () => {
      const level = getRecommendedCompressionLevel(5000, 'speed');
      expect(level).toBeLessThanOrEqual(3);
    });
    
    test('应该为大文件推荐较高的压缩级别（大小优先）', () => {
      const level = getRecommendedCompressionLevel(500000, 'size');
      expect(level).toBeGreaterThanOrEqual(6);
    });
    
    test('应该为不同大小的文件返回不同的级别', () => {
      const level1 = getRecommendedCompressionLevel(5000);
      const level2 = getRecommendedCompressionLevel(50000);
      const level3 = getRecommendedCompressionLevel(500000);
      
      // 文件越大，推荐的压缩级别可能越高
      expect(level3).toBeGreaterThanOrEqual(level1);
    });
  });
  
  describe('错误处理', () => {
    test('compress 应该拒绝不支持的数据类型', () => {
      expect(() => {
        compress({ invalid: 'data' });
      }).toThrow();
    });
    
    test('decompress 应该拒绝不支持的数据类型', () => {
      expect(() => {
        decompress('invalid data');
      }).toThrow();
    });
    
    test('decompress 应该拒绝无效的压缩数据', () => {
      const invalidData = new Uint8Array([1, 2, 3, 4, 5]);
      
      expect(() => {
        decompress(invalidData);
      }).toThrow();
    });
  });
  
  describe('往返测试', () => {
    test('大数据压缩和解压应该保持一致', () => {
      const original = new Uint8Array(100000);
      for (let i = 0; i < original.length; i++) {
        original[i] = i % 256;
      }
      
      const compressed = compress(original);
      const decompressed = decompress(compressed);
      
      expect(decompressed).toEqual(original);
    });
    
    test('长字符串压缩和解压应该保持一致', () => {
      const original = 'Lorem ipsum dolor sit amet, '.repeat(1000);
      const compressed = compressString(original);
      const decompressed = decompressToString(compressed);
      
      expect(decompressed).toBe(original);
    });
  });
});

