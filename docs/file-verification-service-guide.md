# 文件校验服务使用指南

## 概述

`fileVerificationService.js` 提供文件完整性验证和哈希校验功能。

**文件位置**: `src/renderer/src/services/fileVerificationService.js`

**主要功能**:
- 文件完整性验证
- 哈希值校验
- 文件大小验证
- 快速验证
- 统计信息

**集成的工具**:
- `hashUtils` - 哈希计算工具

---

## 📋 常量定义

### 校验结果类型

```javascript
export const VerificationResult = {
  SUCCESS: 'success',               // 验证成功
  HASH_MISMATCH: 'hash_mismatch',   // 哈希值不匹配
  SIZE_MISMATCH: 'size_mismatch',   // 文件大小不匹配
  INVALID_DATA: 'invalid_data',     // 无效的数据
  MISSING_INFO: 'missing_info'      // 缺少文件信息
};
```

---

## 🔧 API 文档

### 文件校验服务类

#### `FileVerificationService`

文件校验服务类，提供文件验证功能。

**构造函数**:

```javascript
const service = new FileVerificationService();
```

**使用示例**:

```javascript
import { FileVerificationService } from '@/services/fileVerificationService';

const service = new FileVerificationService();
```

---

#### `verifyFile(data, fileInfo)`

验证文件完整性（包括大小和哈希值）。

**参数**:
- `data` (Uint8Array): 文件数据
- `fileInfo` (Object): 文件信息
  - `name` (string): 文件名
  - `size` (number): 文件大小
  - `hash` (string): 文件哈希值
  - `type` (string): 文件类型

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  details: Object;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]); // 文件数据
const fileInfo = {
  name: 'document.pdf',
  size: 1024,
  hash: 'abc123...',
  type: 'application/pdf'
};

const result = await service.verifyFile(data, fileInfo);

if (result.success) {
  console.log('文件验证成功');
  console.log('详情:', result.details);
} else {
  console.error('验证失败:', result.message);
  console.error('结果:', result.result);
}
```

---

#### `quickVerify(data, expectedSize)`

快速验证（仅验证文件大小）。

**参数**:
- `data` (Uint8Array): 文件数据
- `expectedSize` (number): 期望的文件大小

**返回值**: `Object`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  details: Object;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]);
const expectedSize = 1024;

const result = service.quickVerify(data, expectedSize);

if (result.success) {
  console.log('大小验证成功');
}
```

---

#### `verifyHash(data, expectedHash)`

验证哈希值。

**参数**:
- `data` (Uint8Array): 文件数据
- `expectedHash` (string): 期望的哈希值

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  details: Object;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]);
const expectedHash = 'abc123...';

const result = await service.verifyHash(data, expectedHash);

if (result.success) {
  console.log('哈希验证成功');
  console.log('哈希值:', result.details.hash);
  console.log('算法:', result.details.algorithm);
}
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalVerifications: number;
  successCount: number;
  failureCount: number;
  successRate: string;
}
```

**使用示例**:

```javascript
const stats = service.getStats();

console.log('总验证次数:', stats.totalVerifications);
console.log('成功次数:', stats.successCount);
console.log('失败次数:', stats.failureCount);
console.log('成功率:', stats.successRate);
```

---

#### `resetStats()`

重置统计信息。

**使用示例**:

```javascript
service.resetStats();
```

---

### 工厂函数

#### `createVerificationService()`

创建文件校验服务实例。

**返回值**: `FileVerificationService`

**使用示例**:

```javascript
import { createVerificationService } from '@/services/fileVerificationService';

const service = createVerificationService();
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { FileVerificationService, VerificationResult } from '@/services/fileVerificationService';

async function verifyReceivedFile(data, fileInfo) {
  // 1. 创建校验服务
  const service = new FileVerificationService();
  
  // 2. 验证文件
  const result = await service.verifyFile(data, fileInfo);
  
  // 3. 处理结果
  if (result.success) {
    console.log('✅ 文件验证成功');
    console.log('文件名:', result.details.name);
    console.log('文件大小:', result.details.size);
    console.log('哈希值:', result.details.hash);
    
    // 保存文件
    saveFile(data, fileInfo);
  } else {
    console.error('❌ 文件验证失败');
    
    switch (result.result) {
      case VerificationResult.HASH_MISMATCH:
        console.error('哈希值不匹配');
        console.error('期望:', result.details.expectedHash);
        console.error('实际:', result.details.actualHash);
        break;
      case VerificationResult.SIZE_MISMATCH:
        console.error('文件大小不匹配');
        console.error('期望:', result.details.expectedSize);
        console.error('实际:', result.details.actualSize);
        break;
      case VerificationResult.INVALID_DATA:
        console.error('无效的数据');
        break;
      case VerificationResult.MISSING_INFO:
        console.error('缺少文件信息');
        break;
    }
  }
  
  // 4. 查看统计
  const stats = service.getStats();
  console.log('统计:', stats);
}

function saveFile(data, fileInfo) {
  // 保存文件逻辑
  window.electronAPI.file.save(data, fileInfo.name);
}
```

### 示例 2: 集成到接收流程

```javascript
import { ReceiverService } from '@/services/receiverIPCService';
import { FileVerificationService, VerificationResult } from '@/services/fileVerificationService';

class FileReceiver {
  constructor() {
    this.receiver = new ReceiverService();
    this.verifier = new FileVerificationService();
    this.setupCallbacks();
  }
  
  setupCallbacks() {
    // 接收完成回调
    this.receiver.on('complete', async (data) => {
      await this.handleComplete(data);
    });
  }
  
  async handleComplete(data) {
    console.log('接收完成，开始验证...');
    
    // 验证文件
    const verifyResult = await this.verifier.verifyFile(
      data.data,
      data.fileInfo
    );
    
    if (verifyResult.success) {
      console.log('✅ 文件验证成功');
      
      // 保存文件
      this.saveFile(data.data, data.fileInfo);
      
      // 显示成功消息
      this.showSuccess(data.fileInfo);
    } else {
      console.error('❌ 文件验证失败:', verifyResult.message);
      
      // 显示错误消息
      this.showError(verifyResult);
    }
  }
  
  saveFile(data, fileInfo) {
    window.electronAPI.file.save(data, fileInfo.name);
  }
  
  showSuccess(fileInfo) {
    alert(`文件接收成功！\n文件名: ${fileInfo.name}\n大小: ${fileInfo.size} 字节`);
  }
  
  showError(verifyResult) {
    let message = '文件验证失败！\n\n';
    
    switch (verifyResult.result) {
      case VerificationResult.HASH_MISMATCH:
        message += '原因: 文件已损坏（哈希值不匹配）\n';
        message += '建议: 请重新传输文件';
        break;
      case VerificationResult.SIZE_MISMATCH:
        message += '原因: 文件大小不正确\n';
        message += '建议: 请重新传输文件';
        break;
      default:
        message += '原因: ' + verifyResult.message;
    }
    
    alert(message);
  }
}

// 使用
const fileReceiver = new FileReceiver();
```

### 示例 3: 分步验证

```javascript
import { FileVerificationService } from '@/services/fileVerificationService';

async function stepByStepVerification(data, fileInfo) {
  const service = new FileVerificationService();
  
  console.log('开始分步验证...');
  
  // 步骤 1: 快速验证大小
  console.log('步骤 1: 验证文件大小...');
  const sizeResult = service.quickVerify(data, fileInfo.size);
  
  if (!sizeResult.success) {
    console.error('大小验证失败');
    return false;
  }
  console.log('✅ 大小验证通过');
  
  // 步骤 2: 验证哈希值
  console.log('步骤 2: 验证哈希值...');
  const hashResult = await service.verifyHash(data, fileInfo.hash);
  
  if (!hashResult.success) {
    console.error('哈希验证失败');
    return false;
  }
  console.log('✅ 哈希验证通过');
  
  // 步骤 3: 完整验证
  console.log('步骤 3: 完整验证...');
  const fullResult = await service.verifyFile(data, fileInfo);
  
  if (!fullResult.success) {
    console.error('完整验证失败');
    return false;
  }
  console.log('✅ 完整验证通过');
  
  // 查看统计
  const stats = service.getStats();
  console.log('验证统计:', stats);
  
  return true;
}
```

---

## 🔄 验证流程

### 完整验证流程

```
1. 验证参数
   ├─ 检查数据有效性
   └─ 检查文件信息完整性
   ↓
2. 验证文件大小
   ├─ 比较实际大小和期望大小
   └─ 记录差异
   ↓
3. 验证哈希值
   ├─ 计算实际哈希值
   ├─ 比较实际哈希和期望哈希
   └─ 记录结果
   ↓
4. 返回验证结果
   ├─ 成功 → 返回详细信息
   └─ 失败 → 返回错误信息
```

---

## ⚠️ 注意事项

1. **验证顺序**
   - 先验证大小（快速）
   - 再验证哈希（较慢）

2. **错误处理**
   - 检查验证结果
   - 根据错误类型采取不同措施

3. **性能考虑**
   - 大文件哈希计算较慢
   - 可先使用 quickVerify

4. **统计信息**
   - 定期查看统计
   - 及时重置统计

5. **文件信息**
   - 确保文件信息完整
   - 哈希值必须正确

---

**最后更新**: 2025-10-06 18:00

