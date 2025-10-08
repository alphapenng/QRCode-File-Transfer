# 文件服务使用指南

## 概述

`fileService.js` 提供文件选择、验证和信息提取功能，是发送端的核心服务模块。

**文件位置**: `src/renderer/src/services/fileService.js`

**主要功能**:
- 文件选择对话框
- 文件大小验证
- 文件类型检查
- 文件信息提取
- 传输时间估算

---

## 📋 常量定义

### 文件大小限制

```javascript
export const FILE_SIZE_LIMITS = {
  MVP: 1048576,      // 1MB (MVP 阶段)
  PHASE2: 5242880,   // 5MB (第二阶段)
  PHASE3: 10485760   // 10MB (第三阶段)
};

// 当前阶段的限制
export const CURRENT_FILE_SIZE_LIMIT = FILE_SIZE_LIMITS.MVP; // 1MB
```

### 支持的文件类型

```javascript
export const SUPPORTED_FILE_TYPES = {
  TEXT: ['.txt', '.md', '.json', '.xml', '.csv', '.log'],
  OFFICE: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  OTHER: ['*']
};
```

---

## 🔧 API 文档

### 文件选择

#### `selectFile()`

选择文件。

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  canceled?: boolean;  // 用户取消
  file?: {
    path: string;           // 文件路径
    name: string;           // 文件名
    size: number;           // 文件大小（字节）
    type: string;           // 文件扩展名
    sizeFormatted: string;  // 格式化的大小
  };
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { selectFile } from '@/services/fileService';

async function handleSelectFile() {
  const result = await selectFile();
  
  if (result.success) {
    console.log('选择的文件:', result.file);
    console.log('文件名:', result.file.name);
    console.log('文件大小:', result.file.sizeFormatted);
  } else if (result.canceled) {
    console.log('用户取消选择');
  } else {
    console.error('选择失败:', result.message);
  }
}
```

---

#### `selectAndValidateFile(options)`

选择文件并进行完整验证。

**参数**:
- `options` (Object, 可选)
  - `maxSize` (number): 最大文件大小，默认 1MB
  - `allowedTypes` (Array<string>): 允许的文件类型，默认所有支持的类型

**返回值**: `Promise<Object>`

**使用示例**:

```javascript
import { selectAndValidateFile } from '@/services/fileService';

async function handleSelectAndValidate() {
  const result = await selectAndValidateFile({
    maxSize: 1048576,  // 1MB
    allowedTypes: ['.txt', '.pdf', '.docx']
  });
  
  if (result.success) {
    console.log('文件验证通过:', result.file);
    console.log('文件类别:', result.file.category);
    console.log('大小验证:', result.file.validation.size);
    console.log('类型验证:', result.file.validation.type);
  } else {
    console.error('验证失败:', result.message);
  }
}
```

---

### 文件验证

#### `validateFileSize(fileSize, maxSize)`

验证文件大小。

**参数**:
- `fileSize` (number): 文件大小（字节）
- `maxSize` (number, 可选): 最大大小，默认 1MB

**返回值**: `Object`

```typescript
{
  valid: boolean;
  size?: number;
  sizeFormatted?: string;
  percentage?: string;  // 占最大大小的百分比
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { validateFileSize } from '@/services/fileService';

const result = validateFileSize(500000); // 500KB

if (result.valid) {
  console.log('文件大小:', result.sizeFormatted);
  console.log('占用比例:', result.percentage + '%');
} else {
  console.error('文件太大:', result.message);
}
```

---

#### `validateFileType(fileType, allowedTypes)`

验证文件类型。

**参数**:
- `fileType` (string): 文件扩展名（如 `.txt`）
- `allowedTypes` (Array<string>, 可选): 允许的类型，默认所有支持的类型

**返回值**: `Object`

```typescript
{
  valid: boolean;
  type?: string;
  category?: string;  // 文件类别
  error?: string;
  message?: string;
  allowedTypes?: Array<string>;
}
```

**使用示例**:

```javascript
import { validateFileType } from '@/services/fileService';

// 验证是否为支持的类型
const result1 = validateFileType('.txt');
console.log('是否支持:', result1.valid);
console.log('文件类别:', result1.category); // 'TEXT'

// 验证是否在自定义列表中
const result2 = validateFileType('.pdf', ['.txt', '.pdf']);
console.log('是否允许:', result2.valid);
```

---

### 工具函数

#### `getFileCategory(fileType)`

获取文件类别。

**参数**:
- `fileType` (string): 文件扩展名

**返回值**: `string` - 文件类别（TEXT, OFFICE, IMAGE, ARCHIVE, OTHER）

**使用示例**:

```javascript
import { getFileCategory } from '@/services/fileService';

console.log(getFileCategory('.txt'));   // 'TEXT'
console.log(getFileCategory('.pdf'));   // 'OFFICE'
console.log(getFileCategory('.jpg'));   // 'IMAGE'
console.log(getFileCategory('.zip'));   // 'ARCHIVE'
console.log(getFileCategory('.exe'));   // 'OTHER'
```

---

#### `formatFileSize(bytes)`

格式化文件大小。

**参数**:
- `bytes` (number): 字节数

**返回值**: `string` - 格式化的大小（如 "1.5 MB"）

**使用示例**:

```javascript
import { formatFileSize } from '@/services/fileService';

console.log(formatFileSize(0));         // '0 B'
console.log(formatFileSize(1024));      // '1 KB'
console.log(formatFileSize(1048576));   // '1 MB'
console.log(formatFileSize(1572864));   // '1.5 MB'
```

---

#### `calculateChunkCount(fileSize, chunkSize)`

计算分片数量。

**参数**:
- `fileSize` (number): 文件大小（字节）
- `chunkSize` (number, 可选): 分片大小，默认 2048

**返回值**: `number` - 分片数量

**使用示例**:

```javascript
import { calculateChunkCount } from '@/services/fileService';

const fileSize = 102400; // 100KB
const chunkCount = calculateChunkCount(fileSize);

console.log('分片数量:', chunkCount); // 50
```

---

#### `estimateTransferTime(chunkCount, qrPerSecond)`

估算传输时间。

**参数**:
- `chunkCount` (number): 分片数量
- `qrPerSecond` (number, 可选): 每秒显示的二维码数量，默认 5

**返回值**: `Object`

```typescript
{
  totalSeconds: number;
  minutes: number;
  seconds: number;
  formatted: string;  // 格式化的时间
}
```

**使用示例**:

```javascript
import { estimateTransferTime } from '@/services/fileService';

const chunkCount = 150;
const time = estimateTransferTime(chunkCount, 5);

console.log('预计时间:', time.formatted); // '30 秒' 或 '2 分 30 秒'
console.log('总秒数:', time.totalSeconds);
console.log('分钟:', time.minutes);
console.log('秒:', time.seconds);
```

---

### 文件读取

#### `readFile(filePath)`

读取文件内容。

**参数**:
- `filePath` (string): 文件路径

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  data?: ArrayBuffer;
  size?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { readFile } from '@/services/fileService';

async function handleReadFile(filePath) {
  const result = await readFile(filePath);
  
  if (result.success) {
    console.log('文件数据:', result.data);
    console.log('数据大小:', result.size);
    
    // 转换为 Uint8Array
    const uint8Array = new Uint8Array(result.data);
  } else {
    console.error('读取失败:', result.message);
  }
}
```

---

#### `getFileInfo(filePath)`

获取文件信息。

**参数**:
- `filePath` (string): 文件路径

**返回值**: `Promise<Object>`

**使用示例**:

```javascript
import { getFileInfo } from '@/services/fileService';

async function handleGetFileInfo(filePath) {
  const result = await getFileInfo(filePath);
  
  if (result.success) {
    console.log('文件大小:', result.info.sizeFormatted);
    console.log('创建时间:', result.info.created);
    console.log('修改时间:', result.info.modified);
  }
}
```

---

## 📝 完整使用示例

### 示例 1: 文件选择和验证

```javascript
import { selectAndValidateFile, calculateChunkCount, estimateTransferTime } from '@/services/fileService';

async function handleFileSelection() {
  // 选择并验证文件
  const result = await selectAndValidateFile({
    maxSize: 1048576,  // 1MB
    allowedTypes: ['.txt', '.pdf', '.docx', '.jpg', '.png']
  });
  
  if (!result.success) {
    if (result.canceled) {
      console.log('用户取消选择');
      return;
    }
    
    alert(result.message);
    return;
  }
  
  const { file } = result;
  
  // 显示文件信息
  console.log('文件名:', file.name);
  console.log('文件大小:', file.sizeFormatted);
  console.log('文件类别:', file.category);
  
  // 计算分片信息
  const chunkCount = calculateChunkCount(file.size);
  console.log('分片数量:', chunkCount);
  
  // 估算传输时间
  const time = estimateTransferTime(chunkCount);
  console.log('预计时间:', time.formatted);
  
  // 继续处理文件...
}
```

### 示例 2: 自定义验证

```javascript
import { selectFile, validateFileSize, validateFileType } from '@/services/fileService';

async function handleCustomValidation() {
  // 选择文件
  const selectResult = await selectFile();
  
  if (!selectResult.success) {
    return;
  }
  
  const { file } = selectResult;
  
  // 自定义大小验证（500KB）
  const sizeValidation = validateFileSize(file.size, 512000);
  
  if (!sizeValidation.valid) {
    alert('文件不能超过 500KB');
    return;
  }
  
  // 自定义类型验证（只允许文本文件）
  const typeValidation = validateFileType(file.type, ['.txt', '.md']);
  
  if (!typeValidation.valid) {
    alert('只支持文本文件（.txt, .md）');
    return;
  }
  
  console.log('验证通过！');
}
```

---

## ⚠️ 注意事项

1. **文件大小限制**
   - MVP 阶段限制为 1MB
   - 超过限制会在选择时自动拒绝

2. **文件类型**
   - 默认支持常见的文本、Office、图片和压缩文件
   - 可以通过 `allowedTypes` 参数自定义

3. **异步操作**
   - 所有文件操作都是异步的
   - 使用 `async/await` 或 Promise 处理

4. **错误处理**
   - 始终检查 `success` 字段
   - 处理 `canceled` 状态（用户取消）
   - 显示友好的错误信息

---

**最后更新**: 2025-10-06 16:10

