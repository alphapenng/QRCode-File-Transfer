/**
 * 文件处理工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  splitIntoChunks,
  mergeChunks,
  getFileExtension,
  validateFileSize,
  validateFileType,
  formatFileSize,
  calculateChunkCount,
  getChunkInfo,
  arrayBufferToUint8Array,
  uint8ArrayToArrayBuffer
} from '../src/shared/utils/fileUtils.js';

describe('文件处理工具测试', () => {
  describe('splitIntoChunks', () => {
    test('应该正确分片数据', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const chunks = splitIntoChunks(data, 3);
      
      expect(chunks.length).toBe(4);
      expect(chunks[0]).toEqual(new Uint8Array([1, 2, 3]));
      expect(chunks[1]).toEqual(new Uint8Array([4, 5, 6]));
      expect(chunks[2]).toEqual(new Uint8Array([7, 8, 9]));
      expect(chunks[3]).toEqual(new Uint8Array([10]));
    });
    
    test('应该处理空数据', () => {
      const data = new Uint8Array([]);
      const chunks = splitIntoChunks(data, 1024);
      
      expect(chunks.length).toBe(0);
    });
    
    test('应该处理单个分片', () => {
      const data = new Uint8Array([1, 2, 3]);
      const chunks = splitIntoChunks(data, 10);
      
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toEqual(data);
    });
  });
  
  describe('mergeChunks', () => {
    test('应该正确合并分片', () => {
      const chunks = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Uint8Array([7, 8, 9]),
        new Uint8Array([10])
      ];
      
      const result = mergeChunks(chunks);
      
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    });
    
    test('应该处理空分片数组', () => {
      const chunks = [];
      const result = mergeChunks(chunks);
      
      expect(result).toEqual(new Uint8Array([]));
    });
    
    test('应该处理单个分片', () => {
      const chunks = [new Uint8Array([1, 2, 3])];
      const result = mergeChunks(chunks);
      
      expect(result).toEqual(new Uint8Array([1, 2, 3]));
    });
  });
  
  describe('分片和合并的往返测试', () => {
    test('分片后合并应该得到原始数据', () => {
      const original = new Uint8Array(10000);
      for (let i = 0; i < original.length; i++) {
        original[i] = i % 256;
      }
      
      const chunks = splitIntoChunks(original, 2048);
      const merged = mergeChunks(chunks);
      
      expect(merged).toEqual(original);
    });
  });
  
  describe('getFileExtension', () => {
    test('应该正确提取文件扩展名', () => {
      expect(getFileExtension('document.txt')).toBe('txt');
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });
    
    test('应该处理没有扩展名的文件', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('file.')).toBe('');
    });
    
    test('应该转换为小写', () => {
      expect(getFileExtension('Document.TXT')).toBe('txt');
      expect(getFileExtension('Image.PNG')).toBe('png');
    });
  });
  
  describe('validateFileSize', () => {
    test('应该验证文件大小', () => {
      const file1 = { size: 1024 };
      const file2 = { size: 2048 };
      
      expect(validateFileSize(file1, 2048)).toBe(true);
      expect(validateFileSize(file2, 2048)).toBe(true);
      expect(validateFileSize(file2, 1024)).toBe(false);
    });
  });
  
  describe('validateFileType', () => {
    test('应该验证文件类型', () => {
      const file1 = { name: 'document.txt' };
      const file2 = { name: 'image.png' };
      
      expect(validateFileType(file1, ['txt', 'md'])).toBe(true);
      expect(validateFileType(file2, ['txt', 'md'])).toBe(false);
      expect(validateFileType(file1, [])).toBe(true);
      expect(validateFileType(file1, null)).toBe(true);
    });
  });
  
  describe('formatFileSize', () => {
    test('应该格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });
    
    test('应该支持自定义小数位数', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 3)).toBe('1.500 KB');
    });
  });
  
  describe('calculateChunkCount', () => {
    test('应该正确计算分片数量', () => {
      expect(calculateChunkCount(10240, 2048)).toBe(5);
      expect(calculateChunkCount(10000, 2048)).toBe(5);
      expect(calculateChunkCount(2048, 2048)).toBe(1);
      expect(calculateChunkCount(0, 2048)).toBe(0);
    });
  });
  
  describe('getChunkInfo', () => {
    test('应该返回正确的分片信息', () => {
      const info = getChunkInfo(0, 5, 2048, 10240);
      
      expect(info.index).toBe(0);
      expect(info.start).toBe(0);
      expect(info.end).toBe(2048);
      expect(info.size).toBe(2048);
      expect(info.isLast).toBe(false);
      expect(parseFloat(info.progress)).toBe(20.00);
    });
    
    test('应该正确标识最后一个分片', () => {
      const info = getChunkInfo(4, 5, 2048, 10240);
      
      expect(info.index).toBe(4);
      expect(info.start).toBe(8192);
      expect(info.end).toBe(10240);
      expect(info.size).toBe(2048);
      expect(info.isLast).toBe(true);
      expect(parseFloat(info.progress)).toBe(100.00);
    });
    
    test('应该处理不完整的最后一个分片', () => {
      const info = getChunkInfo(4, 5, 2048, 10000);
      
      expect(info.index).toBe(4);
      expect(info.start).toBe(8192);
      expect(info.end).toBe(10000);
      expect(info.size).toBe(1808);
      expect(info.isLast).toBe(true);
    });
  });
  
  describe('ArrayBuffer 和 Uint8Array 转换', () => {
    test('应该正确转换 ArrayBuffer 到 Uint8Array', () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < 10; i++) {
        view[i] = i;
      }
      
      const uint8Array = arrayBufferToUint8Array(buffer);
      
      expect(uint8Array).toBeInstanceOf(Uint8Array);
      expect(uint8Array.length).toBe(10);
      expect(uint8Array[0]).toBe(0);
      expect(uint8Array[9]).toBe(9);
    });
    
    test('应该正确转换 Uint8Array 到 ArrayBuffer', () => {
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const buffer = uint8ArrayToArrayBuffer(uint8Array);
      
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBe(5);
      
      const view = new Uint8Array(buffer);
      expect(view[0]).toBe(1);
      expect(view[4]).toBe(5);
    });
    
    test('转换应该是可逆的', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]);
      const buffer = uint8ArrayToArrayBuffer(original);
      const result = arrayBufferToUint8Array(buffer);
      
      expect(result).toEqual(original);
    });
  });
});

