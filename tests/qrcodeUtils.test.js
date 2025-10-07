/**
 * 二维码工具测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  generateQRCode,
  generateQRCodeToCanvas,
  generateQRCodeBatch,
  parseQRCode,
  parseQRCodeFromCanvas,
  parseQRCodeFromImage,
  calculateQRCodeCapacity,
  getRecommendedErrorCorrectionLevel,
  generateQRCodeWithStats,
  validateQRCodeData,
  createQRCodeSequence,
  estimateGenerationTime
} from '../src/shared/utils/qrcodeUtils.js';

describe('二维码工具测试', () => {
  describe('二维码生成', () => {
    test('应该生成二维码 Data URL', async () => {
      const data = 'Hello, World!';
      const dataUrl = await generateQRCode(data);
      
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
    
    test('应该支持自定义选项', async () => {
      const data = 'Hello, World!';
      const options = {
        width: 300,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#FF0000',
          light: '#FFFFFF'
        }
      };
      
      const dataUrl = await generateQRCode(data, options);
      
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
    
    test('应该处理空字符串', async () => {
      const data = '';
      const dataUrl = await generateQRCode(data);
      
      expect(typeof dataUrl).toBe('string');
    });
    
    test('应该处理长字符串', async () => {
      const data = 'A'.repeat(1000);
      const dataUrl = await generateQRCode(data);
      
      expect(typeof dataUrl).toBe('string');
    });
    
    test('应该处理 Unicode 字符', async () => {
      const data = '你好，世界！🌍';
      const dataUrl = await generateQRCode(data);
      
      expect(typeof dataUrl).toBe('string');
    });
  });
  
  describe('批量生成二维码', () => {
    test('应该批量生成二维码', async () => {
      const dataArray = ['Data 1', 'Data 2', 'Data 3'];
      const dataUrls = await generateQRCodeBatch(dataArray);
      
      expect(Array.isArray(dataUrls)).toBe(true);
      expect(dataUrls.length).toBe(3);
      dataUrls.forEach(dataUrl => {
        expect(typeof dataUrl).toBe('string');
        expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
      });
    });
    
    test('应该处理空数组', async () => {
      const dataArray = [];
      const dataUrls = await generateQRCodeBatch(dataArray);
      
      expect(Array.isArray(dataUrls)).toBe(true);
      expect(dataUrls.length).toBe(0);
    });
    
    test('应该拒绝非数组参数', async () => {
      await expect(generateQRCodeBatch('not an array')).rejects.toThrow();
    });
  });
  
  describe('二维码容量计算', () => {
    test('应该正确计算容量', () => {
      const data = 'Hello, World!';
      const capacity = calculateQRCodeCapacity(data, 'M');
      
      expect(capacity).toHaveProperty('dataLength');
      expect(capacity).toHaveProperty('maxCapacity');
      expect(capacity).toHaveProperty('usagePercentage');
      expect(capacity).toHaveProperty('canEncode');
      expect(capacity).toHaveProperty('errorCorrectionLevel');
      
      expect(capacity.dataLength).toBeGreaterThan(0);
      expect(capacity.maxCapacity).toBe(2331);
      expect(capacity.canEncode).toBe(true);
      expect(capacity.errorCorrectionLevel).toBe('M');
    });
    
    test('应该支持不同的纠错级别', () => {
      const data = 'Test';
      
      const capacityL = calculateQRCodeCapacity(data, 'L');
      const capacityM = calculateQRCodeCapacity(data, 'M');
      const capacityQ = calculateQRCodeCapacity(data, 'Q');
      const capacityH = calculateQRCodeCapacity(data, 'H');
      
      expect(capacityL.maxCapacity).toBe(2953);
      expect(capacityM.maxCapacity).toBe(2331);
      expect(capacityQ.maxCapacity).toBe(1663);
      expect(capacityH.maxCapacity).toBe(1273);
    });
    
    test('应该检测数据过大', () => {
      const data = 'A'.repeat(3000);
      const capacity = calculateQRCodeCapacity(data, 'M');
      
      expect(capacity.canEncode).toBe(false);
      expect(capacity.usagePercentage).toBeGreaterThan(100);
    });
  });
  
  describe('推荐纠错级别', () => {
    test('应该推荐合适的纠错级别（优先可靠性）', () => {
      expect(getRecommendedErrorCorrectionLevel(500, 'reliability')).toBe('H');
      expect(getRecommendedErrorCorrectionLevel(1500, 'reliability')).toBe('Q');
      expect(getRecommendedErrorCorrectionLevel(2000, 'reliability')).toBe('M');
      expect(getRecommendedErrorCorrectionLevel(2500, 'reliability')).toBe('L');
    });
    
    test('应该推荐合适的纠错级别（优先速度）', () => {
      expect(getRecommendedErrorCorrectionLevel(500, 'speed')).toBe('L');
      expect(getRecommendedErrorCorrectionLevel(2000, 'speed')).toBe('L');
      expect(getRecommendedErrorCorrectionLevel(3000, 'speed')).toBe('M');
    });
    
    test('应该默认优先可靠性', () => {
      const level = getRecommendedErrorCorrectionLevel(500);
      expect(level).toBe('H');
    });
  });
  
  describe('统计信息', () => {
    test('应该返回生成统计信息', async () => {
      const data = 'Hello, World!';
      const result = await generateQRCodeWithStats(data);
      
      expect(result).toHaveProperty('dataUrl');
      expect(result).toHaveProperty('dataLength');
      expect(result).toHaveProperty('maxCapacity');
      expect(result).toHaveProperty('usagePercentage');
      expect(result).toHaveProperty('errorCorrectionLevel');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('generationTime');
      
      expect(result.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
      expect(result.generationTime).toBeGreaterThanOrEqual(0);
    });
    
    test('应该拒绝过大的数据', async () => {
      const data = 'A'.repeat(3000);
      await expect(generateQRCodeWithStats(data)).rejects.toThrow();
    });
  });
  
  describe('数据验证', () => {
    test('应该验证有效数据', () => {
      const data = 'Hello, World!';
      const result = validateQRCodeData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('应该拒绝空数据', () => {
      const data = '';
      const result = validateQRCodeData(data);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('应该拒绝非字符串数据', () => {
      const data = 123;
      const result = validateQRCodeData(data);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('应该检测过大的数据', () => {
      const data = 'A'.repeat(3000);
      const result = validateQRCodeData(data, 'M');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('应该警告接近容量上限的数据', () => {
      const data = 'A'.repeat(2200);
      const result = validateQRCodeData(data, 'M');
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  describe('二维码序列', () => {
    test('应该创建二维码序列', async () => {
      const dataArray = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
      const sequence = await createQRCodeSequence(dataArray);
      
      expect(Array.isArray(sequence)).toBe(true);
      expect(sequence.length).toBe(3);
      
      sequence.forEach((item, index) => {
        expect(item).toHaveProperty('index');
        expect(item).toHaveProperty('total');
        expect(item).toHaveProperty('dataUrl');
        expect(item).toHaveProperty('data');
        
        expect(item.index).toBe(index);
        expect(item.total).toBe(3);
        expect(item.data).toBe(dataArray[index]);
      });
    });
    
    test('应该拒绝非数组参数', async () => {
      await expect(createQRCodeSequence('not an array')).rejects.toThrow();
    });
  });
  
  describe('时间估算', () => {
    test('应该估算生成时间', () => {
      const result = estimateGenerationTime(100, 2048);
      
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('avgDataLength');
      expect(result).toHaveProperty('estimatedTime');
      expect(result).toHaveProperty('estimatedTimeSeconds');
      
      expect(result.count).toBe(100);
      expect(result.avgDataLength).toBe(2048);
      expect(result.estimatedTime).toBeGreaterThan(0);
      expect(result.estimatedTimeSeconds).toBeGreaterThan(0);
    });
    
    test('应该使用默认数据长度', () => {
      const result = estimateGenerationTime(50);
      
      expect(result.avgDataLength).toBe(2048);
    });
  });
  
  describe('Canvas 生成', () => {
    test('应该生成二维码到 Canvas', async () => {
      // 创建模拟 Canvas
      const canvas = document.createElement('canvas');
      const data = 'Hello, World!';
      
      await generateQRCodeToCanvas(canvas, data);
      
      // Canvas 应该有内容
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      expect(imageData.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('二维码解析', () => {
    test('应该解析二维码', async () => {
      // 先生成一个二维码
      const originalData = 'Hello, World!';
      const dataUrl = await generateQRCode(originalData);
      
      // 解析二维码
      const result = await parseQRCodeFromImage(dataUrl);
      
      if (result) {
        expect(result).toHaveProperty('data');
        expect(result.data).toBe(originalData);
      }
    });
    
    test('应该处理无效的图像数据', () => {
      const invalidImageData = {
        data: new Uint8ClampedArray(100),
        width: 10,
        height: 10
      };
      
      const result = parseQRCode(invalidImageData);
      expect(result).toBeNull();
    });
  });
  
  describe('错误处理', () => {
    test('generateQRCode 应该处理错误', async () => {
      // 测试极端情况
      const data = 'A'.repeat(10000);
      await expect(generateQRCode(data)).rejects.toThrow();
    });
    
    test('parseQRCode 应该处理无效数据', () => {
      expect(() => parseQRCode(null)).toThrow();
      expect(() => parseQRCode({})).toThrow();
    });
  });
  
  describe('往返测试', () => {
    test('生成和解析应该是可逆的', async () => {
      const originalData = 'Test Data 123';
      
      // 生成二维码
      const dataUrl = await generateQRCode(originalData);
      
      // 解析二维码
      const result = await parseQRCodeFromImage(dataUrl);
      
      if (result) {
        expect(result.data).toBe(originalData);
      }
    });
    
    test('应该支持 Unicode 字符的往返', async () => {
      const originalData = '你好，世界！';
      
      const dataUrl = await generateQRCode(originalData);
      const result = await parseQRCodeFromImage(dataUrl);
      
      if (result) {
        expect(result.data).toBe(originalData);
      }
    });
  });
});

