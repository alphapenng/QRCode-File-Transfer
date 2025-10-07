/**
 * 分片协议工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  PROTOCOL_VERSION,
  ChunkType,
  createFileHeader,
  createDataChunk,
  createFileFooter,
  encodeChunk,
  decodeChunk,
  validateChunk,
  verifyChunkCRC32,
  extractChunkData,
  createTransferPackage,
  ChunkCollector
} from '../src/shared/utils/protocolUtils.js';

describe('分片协议工具测试', () => {
  describe('协议常量', () => {
    test('应该定义协议版本', () => {
      expect(PROTOCOL_VERSION).toBe('1.0');
    });
    
    test('应该定义分片类型', () => {
      expect(ChunkType.FILE_HEADER).toBe('FILE_HEADER');
      expect(ChunkType.FILE_DATA).toBe('FILE_DATA');
      expect(ChunkType.FILE_FOOTER).toBe('FILE_FOOTER');
    });
  });
  
  describe('文件头创建', () => {
    test('应该创建文件头', () => {
      const fileInfo = {
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        sha256: 'abc123'
      };
      
      const header = createFileHeader(fileInfo, 10);
      
      expect(header.version).toBe(PROTOCOL_VERSION);
      expect(header.type).toBe(ChunkType.FILE_HEADER);
      expect(header.fileInfo.fileName).toBe('test.txt');
      expect(header.fileInfo.fileSize).toBe(1024);
      expect(header.totalChunks).toBe(10);
      expect(header.timestamp).toBeDefined();
    });
  });
  
  describe('数据分片创建', () => {
    test('应该创建数据分片', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 5);
      
      expect(chunk.version).toBe(PROTOCOL_VERSION);
      expect(chunk.type).toBe(ChunkType.FILE_DATA);
      expect(chunk.index).toBe(0);
      expect(chunk.total).toBe(5);
      expect(chunk.data).toBeDefined();
      expect(chunk.crc32).toBeDefined();
      expect(chunk.size).toBeGreaterThan(0);
      expect(chunk.originalSize).toBe(5);
    });
    
    test('应该支持禁用压缩', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 5, { compress: false });
      
      expect(chunk.compressed).toBe(false);
    });
    
    test('应该处理大数据', () => {
      const data = new Uint8Array(2048);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      
      const chunk = createDataChunk(data, 0, 1);
      
      expect(chunk.data).toBeDefined();
      expect(chunk.crc32).toBeDefined();
    });
  });
  
  describe('文件尾创建', () => {
    test('应该创建文件尾', () => {
      const summary = {
        totalChunks: 10,
        totalSize: 10240,
        sha256: 'abc123'
      };
      
      const footer = createFileFooter(summary);
      
      expect(footer.version).toBe(PROTOCOL_VERSION);
      expect(footer.type).toBe(ChunkType.FILE_FOOTER);
      expect(footer.summary.totalChunks).toBe(10);
      expect(footer.summary.totalSize).toBe(10240);
      expect(footer.summary.sha256).toBe('abc123');
      expect(footer.timestamp).toBeDefined();
    });
  });
  
  describe('分片编码和解码', () => {
    test('应该编码分片为 JSON', () => {
      const chunk = {
        version: PROTOCOL_VERSION,
        type: ChunkType.FILE_DATA,
        index: 0,
        total: 5,
        data: 'test',
        crc32: 'abc123'
      };
      
      const encoded = encodeChunk(chunk);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
    
    test('应该解码 JSON 为分片', () => {
      const chunk = {
        version: PROTOCOL_VERSION,
        type: ChunkType.FILE_DATA,
        index: 0,
        total: 5,
        data: 'test',
        crc32: 'abc123'
      };
      
      const encoded = encodeChunk(chunk);
      const decoded = decodeChunk(encoded);
      
      expect(decoded.version).toBe(chunk.version);
      expect(decoded.type).toBe(chunk.type);
      expect(decoded.index).toBe(chunk.index);
      expect(decoded.data).toBe(chunk.data);
    });
    
    test('应该拒绝无效的 JSON', () => {
      expect(() => decodeChunk('invalid json')).toThrow();
    });
    
    test('应该拒绝版本不匹配', () => {
      const chunk = {
        version: '2.0',
        type: ChunkType.FILE_DATA
      };
      
      const encoded = JSON.stringify(chunk);
      expect(() => decodeChunk(encoded)).toThrow();
    });
  });
  
  describe('分片验证', () => {
    test('应该验证有效的数据分片', () => {
      const chunk = {
        version: PROTOCOL_VERSION,
        type: ChunkType.FILE_DATA,
        index: 0,
        total: 5,
        data: 'test',
        crc32: 'abc123'
      };
      
      const result = validateChunk(chunk);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('应该检测缺少版本号', () => {
      const chunk = {
        type: ChunkType.FILE_DATA
      };
      
      const result = validateChunk(chunk);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('应该检测缺少必需字段', () => {
      const chunk = {
        version: PROTOCOL_VERSION,
        type: ChunkType.FILE_DATA
        // 缺少 index, total, data, crc32
      };
      
      const result = validateChunk(chunk);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('CRC32 验证', () => {
    test('应该验证正确的 CRC32', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 1);
      
      const isValid = verifyChunkCRC32(chunk);
      
      expect(isValid).toBe(true);
    });
    
    test('应该拒绝错误的 CRC32', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 1);
      chunk.crc32 = '00000000'; // 错误的 CRC32
      
      const isValid = verifyChunkCRC32(chunk);
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('数据提取', () => {
    test('应该提取未压缩的数据', () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(originalData, 0, 1, { compress: false });
      
      const extractedData = extractChunkData(chunk);
      
      expect(extractedData).toEqual(originalData);
    });
    
    test('应该提取压缩的数据', () => {
      const originalData = new Uint8Array(1000);
      for (let i = 0; i < originalData.length; i++) {
        originalData[i] = i % 256;
      }
      
      const chunk = createDataChunk(originalData, 0, 1, { compress: true });
      const extractedData = extractChunkData(chunk);
      
      expect(extractedData).toEqual(originalData);
    });
  });
  
  describe('传输包创建', () => {
    test('应该创建完整的传输包', () => {
      const fileData = new Uint8Array(5000);
      for (let i = 0; i < fileData.length; i++) {
        fileData[i] = i % 256;
      }
      
      const fileInfo = {
        fileName: 'test.bin',
        fileSize: 5000,
        fileType: 'application/octet-stream'
      };
      
      const packages = createTransferPackage(fileData, fileInfo, {
        chunkSize: 2048,
        compress: true
      });
      
      // 应该包含：1个文件头 + 3个数据分片 + 1个文件尾
      expect(packages.length).toBe(5);
      expect(packages[0].type).toBe(ChunkType.FILE_HEADER);
      expect(packages[1].type).toBe(ChunkType.FILE_DATA);
      expect(packages[packages.length - 1].type).toBe(ChunkType.FILE_FOOTER);
    });
  });
  
  describe('分片收集器', () => {
    test('应该创建收集器', () => {
      const collector = new ChunkCollector();
      
      expect(collector.header).toBeNull();
      expect(collector.footer).toBeNull();
      expect(collector.chunks.size).toBe(0);
    });
    
    test('应该添加文件头', () => {
      const collector = new ChunkCollector();
      const header = createFileHeader({
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        sha256: 'abc123'
      }, 5);
      
      const result = collector.addChunk(header);
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('header');
      expect(collector.header).not.toBeNull();
    });
    
    test('应该添加数据分片', () => {
      const collector = new ChunkCollector();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 5);
      
      const result = collector.addChunk(chunk);
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('data');
      expect(collector.chunks.size).toBe(1);
    });
    
    test('应该检测重复分片', () => {
      const collector = new ChunkCollector();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 5);
      
      collector.addChunk(chunk);
      const result = collector.addChunk(chunk);
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('duplicate');
    });
    
    test('应该检测 CRC32 错误', () => {
      const collector = new ChunkCollector();
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const chunk = createDataChunk(data, 0, 5);
      chunk.crc32 = '00000000'; // 错误的 CRC32
      
      const result = collector.addChunk(chunk);
      
      expect(result.success).toBe(false);
    });
    
    test('应该检查完成状态', () => {
      const collector = new ChunkCollector();
      const fileData = new Uint8Array([1, 2, 3, 4, 5]);
      const fileInfo = {
        fileName: 'test.bin',
        fileSize: 5,
        fileType: 'application/octet-stream'
      };
      
      const packages = createTransferPackage(fileData, fileInfo, {
        chunkSize: 2,
        compress: false
      });
      
      expect(collector.isComplete()).toBe(false);
      
      packages.forEach(pkg => collector.addChunk(pkg));
      
      expect(collector.isComplete()).toBe(true);
    });
    
    test('应该获取缺失的分片', () => {
      const collector = new ChunkCollector();
      const header = createFileHeader({
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        sha256: 'abc123'
      }, 5);
      
      collector.addChunk(header);
      
      const data = new Uint8Array([1, 2, 3]);
      collector.addChunk(createDataChunk(data, 0, 5));
      collector.addChunk(createDataChunk(data, 2, 5));
      
      const missing = collector.getMissingChunks();
      
      expect(missing).toEqual([1, 3, 4]);
    });
    
    test('应该重建文件', () => {
      const collector = new ChunkCollector();
      const originalData = new Uint8Array([1, 2, 3, 4, 5]);
      const fileInfo = {
        fileName: 'test.bin',
        fileSize: 5,
        fileType: 'application/octet-stream'
      };
      
      const packages = createTransferPackage(originalData, fileInfo, {
        chunkSize: 2,
        compress: false
      });
      
      packages.forEach(pkg => collector.addChunk(pkg));
      
      const reconstructed = collector.reconstructFile();
      
      expect(reconstructed).toEqual(originalData);
    });
    
    test('应该验证文件完整性', () => {
      const collector = new ChunkCollector();
      const originalData = new Uint8Array([1, 2, 3, 4, 5]);
      const fileInfo = {
        fileName: 'test.bin',
        fileSize: 5,
        fileType: 'application/octet-stream'
      };
      
      const packages = createTransferPackage(originalData, fileInfo, {
        chunkSize: 2,
        compress: false
      });
      
      packages.forEach(pkg => collector.addChunk(pkg));
      
      const reconstructed = collector.reconstructFile();
      const isValid = collector.verifyFile(reconstructed);
      
      expect(isValid).toBe(true);
    });
    
    test('应该获取统计信息', () => {
      const collector = new ChunkCollector();
      const header = createFileHeader({
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        sha256: 'abc123'
      }, 5);
      
      collector.addChunk(header);
      
      const stats = collector.getStats();
      
      expect(stats.hasHeader).toBe(true);
      expect(stats.hasFooter).toBe(false);
      expect(stats.totalChunks).toBe(5);
      expect(stats.receivedChunks).toBe(0);
    });
    
    test('应该重置收集器', () => {
      const collector = new ChunkCollector();
      const header = createFileHeader({
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        sha256: 'abc123'
      }, 5);
      
      collector.addChunk(header);
      collector.reset();
      
      expect(collector.header).toBeNull();
      expect(collector.chunks.size).toBe(0);
    });
  });
});

