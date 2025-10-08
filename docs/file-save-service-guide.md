# 文件保存服务使用指南

## 概述

`fileSaveService.js` 提供文件保存功能，通过 Electron IPC 与主进程通信。

**文件位置**: `src/renderer/src/services/fileSaveService.js`

**主要功能**:
- 文件保存（带对话框）
- 快速保存（不带对话框）
- 保存到默认位置
- 文件类型过滤器
- 统计信息

**依赖**:
- Electron IPC API (`window.electronAPI.file`)

---

## 📋 常量定义

### 保存结果类型

```javascript
export const SaveResult = {
  SUCCESS: 'success',           // 保存成功
  CANCELLED: 'cancelled',       // 用户取消
  ERROR: 'error',               // 保存错误
  INVALID_DATA: 'invalid_data', // 无效的数据
  INVALID_NAME: 'invalid_name'  // 无效的文件名
};
```

---

## 🔧 API 文档

### 文件保存服务类

#### `FileSaveService`

文件保存服务类，提供文件保存功能。

**构造函数**:

```javascript
const service = new FileSaveService();
```

**使用示例**:

```javascript
import { FileSaveService } from '@/services/fileSaveService';

const service = new FileSaveService();
```

---

#### `saveFile(data, defaultName, options)`

保存文件（显示保存对话框）。

**参数**:
- `data` (Uint8Array): 文件数据
- `defaultName` (string): 默认文件名
- `options` (Object): 保存选项（可选）
  - `title` (string): 对话框标题
  - `filters` (Array): 文件类型过滤器

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  filePath?: string;
  size?: number;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]); // 文件数据
const fileName = 'document.pdf';

const result = await service.saveFile(data, fileName, {
  title: '保存 PDF 文件',
  filters: [
    { name: 'PDF 文件', extensions: ['pdf'] },
    { name: '所有文件', extensions: ['*'] }
  ]
});

if (result.success) {
  console.log('文件已保存到:', result.filePath);
  console.log('文件大小:', result.size, '字节');
} else {
  console.error('保存失败:', result.message);
}
```

---

#### `quickSave(data, filePath)`

快速保存（不显示对话框）。

**参数**:
- `data` (Uint8Array): 文件数据
- `filePath` (string): 文件路径

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  filePath?: string;
  size?: number;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]);
const filePath = 'C:\\Users\\Documents\\file.txt';

const result = await service.quickSave(data, filePath);

if (result.success) {
  console.log('文件已保存');
}
```

---

#### `saveToDefault(data, fileName, defaultDir)`

保存到默认位置。

**参数**:
- `data` (Uint8Array): 文件数据
- `fileName` (string): 文件名
- `defaultDir` (string): 默认目录（可选）

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  result: string;
  message: string;
  filePath?: string;
  size?: number;
}
```

**使用示例**:

```javascript
const data = new Uint8Array([...]);
const fileName = 'report.pdf';

const result = await service.saveToDefault(data, fileName);

if (result.success) {
  console.log('文件已保存到:', result.filePath);
}
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalSaves: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
  successRate: string;
}
```

**使用示例**:

```javascript
const stats = service.getStats();

console.log('总保存次数:', stats.totalSaves);
console.log('成功次数:', stats.successCount);
console.log('失败次数:', stats.failureCount);
console.log('取消次数:', stats.cancelledCount);
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

#### `createSaveService()`

创建文件保存服务实例。

**返回值**: `FileSaveService`

**使用示例**:

```javascript
import { createSaveService } from '@/services/fileSaveService';

const service = createSaveService();
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { FileSaveService, SaveResult } from '@/services/fileSaveService';

async function saveReceivedFile(data, fileInfo) {
  // 1. 创建保存服务
  const service = new FileSaveService();
  
  // 2. 保存文件
  const result = await service.saveFile(data, fileInfo.name, {
    title: '保存接收的文件'
  });
  
  // 3. 处理结果
  if (result.success) {
    console.log('✅ 文件保存成功');
    console.log('保存位置:', result.filePath);
    console.log('文件大小:', result.size, '字节');
    
    // 显示成功消息
    alert(`文件已保存到:\n${result.filePath}`);
  } else {
    switch (result.result) {
      case SaveResult.CANCELLED:
        console.log('用户取消保存');
        break;
      case SaveResult.ERROR:
        console.error('保存失败:', result.message);
        alert('文件保存失败:\n' + result.message);
        break;
      case SaveResult.INVALID_DATA:
        console.error('无效的文件数据');
        break;
      case SaveResult.INVALID_NAME:
        console.error('无效的文件名');
        break;
    }
  }
  
  // 4. 查看统计
  const stats = service.getStats();
  console.log('保存统计:', stats);
}
```

### 示例 2: 集成到接收流程

```javascript
import { ReceiverService } from '@/services/receiverIPCService';
import { FileVerificationService } from '@/services/fileVerificationService';
import { FileSaveService, SaveResult } from '@/services/fileSaveService';

class FileReceiver {
  constructor() {
    this.receiver = new ReceiverService();
    this.verifier = new FileVerificationService();
    this.saver = new FileSaveService();
    this.setupCallbacks();
  }
  
  setupCallbacks() {
    // 接收完成回调
    this.receiver.on('complete', async (data) => {
      await this.handleComplete(data);
    });
  }
  
  async handleComplete(data) {
    console.log('接收完成，开始验证和保存...');
    
    // 1. 验证文件
    const verifyResult = await this.verifier.verifyFile(
      data.data,
      data.fileInfo
    );
    
    if (!verifyResult.success) {
      console.error('❌ 文件验证失败:', verifyResult.message);
      alert('文件验证失败:\n' + verifyResult.message);
      return;
    }
    
    console.log('✅ 文件验证成功');
    
    // 2. 保存文件
    const saveResult = await this.saver.saveFile(
      data.data,
      data.fileInfo.name,
      {
        title: '保存接收的文件'
      }
    );
    
    if (saveResult.success) {
      console.log('✅ 文件保存成功');
      this.showSuccess(data.fileInfo, saveResult.filePath);
    } else if (saveResult.result === SaveResult.CANCELLED) {
      console.log('用户取消保存');
    } else {
      console.error('❌ 文件保存失败:', saveResult.message);
      this.showError(saveResult);
    }
  }
  
  showSuccess(fileInfo, filePath) {
    alert(
      `文件接收成功！\n\n` +
      `文件名: ${fileInfo.name}\n` +
      `大小: ${fileInfo.size} 字节\n` +
      `保存位置: ${filePath}`
    );
  }
  
  showError(saveResult) {
    alert(`文件保存失败！\n\n原因: ${saveResult.message}`);
  }
}

// 使用
const fileReceiver = new FileReceiver();
```

### 示例 3: 不同的保存方式

```javascript
import { FileSaveService } from '@/services/fileSaveService';

async function demonstrateSaveMethods(data, fileName) {
  const service = new FileSaveService();
  
  // 方式 1: 显示保存对话框
  console.log('方式 1: 显示保存对话框');
  const result1 = await service.saveFile(data, fileName);
  console.log('结果:', result1);
  
  // 方式 2: 快速保存到指定路径
  console.log('方式 2: 快速保存');
  const result2 = await service.quickSave(data, 'C:\\temp\\' + fileName);
  console.log('结果:', result2);
  
  // 方式 3: 保存到默认位置（下载文件夹）
  console.log('方式 3: 保存到默认位置');
  const result3 = await service.saveToDefault(data, fileName);
  console.log('结果:', result3);
}
```

### 示例 4: 自定义文件类型过滤器

```javascript
import { FileSaveService } from '@/services/fileSaveService';

async function saveWithCustomFilters(data, fileName) {
  const service = new FileSaveService();
  
  // 自定义过滤器
  const filters = [
    { name: 'PDF 文件', extensions: ['pdf'] },
    { name: 'Word 文档', extensions: ['doc', 'docx'] },
    { name: '文本文件', extensions: ['txt'] },
    { name: '所有文件', extensions: ['*'] }
  ];
  
  const result = await service.saveFile(data, fileName, {
    title: '选择保存位置',
    filters: filters
  });
  
  if (result.success) {
    console.log('文件已保存:', result.filePath);
  }
}
```

---

## 🔄 保存流程

### 完整保存流程

```
1. 验证参数
   ├─ 检查数据有效性
   └─ 检查文件名有效性
   ↓
2. 准备保存选项
   ├─ 设置对话框标题
   ├─ 设置默认文件名
   └─ 设置文件类型过滤器
   ↓
3. 显示保存对话框
   ├─ 用户选择保存位置
   └─ 用户确认或取消
   ↓
4. 保存文件
   ├─ 通过 IPC 调用主进程
   └─ 写入文件到磁盘
   ↓
5. 返回保存结果
   ├─ 成功 → 返回文件路径和大小
   ├─ 取消 → 返回取消状态
   └─ 失败 → 返回错误信息
```

---

## ⚠️ 注意事项

1. **Electron IPC 依赖**
   - 需要在 Electron 环境中运行
   - 依赖 `window.electronAPI.file` API

2. **文件路径**
   - Windows 使用反斜杠 `\`
   - 建议使用绝对路径

3. **错误处理**
   - 检查保存结果
   - 处理用户取消情况
   - 处理磁盘空间不足等错误

4. **文件类型过滤器**
   - 自动根据文件扩展名生成
   - 可自定义过滤器

5. **统计信息**
   - 定期查看统计
   - 及时重置统计

6. **用户体验**
   - 提供清晰的对话框标题
   - 设置合适的默认文件名
   - 处理取消操作

---

## 🔗 相关服务

- **ReceiverService** - 接收端服务
- **FileVerificationService** - 文件校验服务
- **DataReceiverService** - 数据接收服务

---

**最后更新**: 2025-10-06 18:15

