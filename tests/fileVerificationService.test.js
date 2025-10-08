/**
 * 文件校验服务测试
 * 
 * 注意：这些测试将在任务 1.6.1 中配置测试框架后运行
 * 当前仅作为测试用例的占位符
 */

import {
  VerificationResult,
  FileVerificationService,
  createVerificationService,
  FileVerificationResult
} from '../src/renderer/src/services/fileVerificationService.js';

describe('文件校验服务测试', () => {
  describe('常量定义', () => {
    test('应该定义校验结果类型', () => {
      expect(VerificationResult.SUCCESS).toBe('success');
      expect(VerificationResult.HASH_MISMATCH).toBe('hash_mismatch');
      expect(VerificationResult.SIZE_MISMATCH).toBe('size_mismatch');
      expect(VerificationResult.INVALID_DATA).toBe('invalid_data');
      expect(VerificationResult.MISSING_INFO).toBe('missing_info');
    });
    
    test('应该导出校验结果类型', () => {
      expect(FileVerificationResult).toBe(VerificationResult);
    });
  });
  
  describe('FileVerificationService', () => {
    let service;
    
    beforeEach(() => {
      service = new FileVerificationService();
    });
    
    test('应该创建文件校验服务', () => {
      expect(service).toBeDefined();
      expect(service.stats.totalVerifications).toBe(0);
      expect(service.stats.successCount).toBe(0);
      expect(service.stats.failureCount).toBe(0);
    });
    
    describe('verifyFile', () => {
      test('应该验证有效的文件', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const fileInfo = {
          name: 'test.txt',
          size: 5,
          hash: await calculateHash(data),
          type: 'text/plain'
        };
        
        const result = await service.verifyFile(data, fileInfo);
        
        expect(result.success).toBe(true);
        expect(result.result).toBe(VerificationResult.SUCCESS);
        expect(result.details.verified).toBe(true);
      });
      
      test('应该拒绝无效的数据', async () => {
        const result = await service.verifyFile(null, {
          name: 'test.txt',
          size: 5,
          hash: 'abc123',
          type: 'text/plain'
        });
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.INVALID_DATA);
      });
      
      test('应该拒绝缺少文件信息', async () => {
        const data = new Uint8Array([1, 2, 3]);
        
        const result = await service.verifyFile(data, null);
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.MISSING_INFO);
      });
      
      test('应该拒绝文件信息不完整', async () => {
        const data = new Uint8Array([1, 2, 3]);
        const fileInfo = {
          name: 'test.txt'
          // 缺少 size 和 hash
        };
        
        const result = await service.verifyFile(data, fileInfo);
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.MISSING_INFO);
        expect(result.details.missingFields).toContain('size');
        expect(result.details.missingFields).toContain('hash');
      });
      
      test('应该检测文件大小不匹配', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const fileInfo = {
          name: 'test.txt',
          size: 10, // 错误的大小
          hash: await calculateHash(data),
          type: 'text/plain'
        };
        
        const result = await service.verifyFile(data, fileInfo);
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.SIZE_MISMATCH);
        expect(result.details.actualSize).toBe(5);
        expect(result.details.expectedSize).toBe(10);
      });
      
      test('应该检测哈希值不匹配', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const fileInfo = {
          name: 'test.txt',
          size: 5,
          hash: 'invalid_hash', // 错误的哈希
          type: 'text/plain'
        };
        
        const result = await service.verifyFile(data, fileInfo);
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.HASH_MISMATCH);
        expect(result.details.actualHash).toBeDefined();
        expect(result.details.expectedHash).toBe('invalid_hash');
      });
    });
    
    describe('quickVerify', () => {
      test('应该快速验证文件大小', () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        
        const result = service.quickVerify(data, 5);
        
        expect(result.success).toBe(true);
        expect(result.result).toBe(VerificationResult.SUCCESS);
        expect(result.details.size).toBe(5);
      });
      
      test('应该检测大小不匹配', () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        
        const result = service.quickVerify(data, 10);
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.SIZE_MISMATCH);
      });
    });
    
    describe('verifyHash', () => {
      test('应该验证哈希值', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const hash = await calculateHash(data);
        
        const result = await service.verifyHash(data, hash);
        
        expect(result.success).toBe(true);
        expect(result.result).toBe(VerificationResult.SUCCESS);
        expect(result.details.hash).toBe(hash);
      });
      
      test('应该检测哈希值不匹配', async () => {
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        
        const result = await service.verifyHash(data, 'invalid_hash');
        
        expect(result.success).toBe(false);
        expect(result.result).toBe(VerificationResult.HASH_MISMATCH);
      });
    });
    
    describe('getStats', () => {
      test('应该获取统计信息', () => {
        const stats = service.getStats();
        
        expect(stats.totalVerifications).toBe(0);
        expect(stats.successCount).toBe(0);
        expect(stats.failureCount).toBe(0);
        expect(stats.successRate).toBe('0%');
      });
      
      test('应该更新统计信息', async () => {
        const data = new Uint8Array([1, 2, 3]);
        const hash = await calculateHash(data);
        
        // 成功验证
        await service.verifyHash(data, hash);
        
        // 失败验证
        await service.verifyHash(data, 'invalid_hash');
        
        const stats = service.getStats();
        
        expect(stats.totalVerifications).toBe(2);
        expect(stats.successCount).toBe(1);
        expect(stats.failureCount).toBe(1);
        expect(stats.successRate).toBe('50.00%');
      });
    });
    
    describe('resetStats', () => {
      test('应该重置统计信息', async () => {
        const data = new Uint8Array([1, 2, 3]);
        const hash = await calculateHash(data);
        
        await service.verifyHash(data, hash);
        
        service.resetStats();
        
        const stats = service.getStats();
        
        expect(stats.totalVerifications).toBe(0);
        expect(stats.successCount).toBe(0);
        expect(stats.failureCount).toBe(0);
      });
    });
  });
  
  describe('createVerificationService', () => {
    test('应该创建文件校验服务实例', () => {
      const service = createVerificationService();
      
      expect(service).toBeInstanceOf(FileVerificationService);
    });
  });
});

// 辅助函数：计算哈希值（用于测试）
async function calculateHash(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

