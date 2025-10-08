# 文件预处理服务使用指南

## 概述

`filePreprocessService.js` 提供文件预处理功能，包括文件读取、数据压缩和哈希计算。

**文件位置**: `src/renderer/src/services/filePreprocessService.js`

**主要功能**:
- 文件数据读取
- 数据压缩（gzip）
- SHA256 哈希计算
- 完整的预处理流程
- 批量预处理
- 结果验证

---

## 📋 常量定义

### 预处理选项

```javascript
export const PREPROCESS_OPTIONS = {
  compress: true,           // 是否压缩
  compressionLevel: 6,      // 压缩级别 (0-9)
  calculateHash: true,      // 是否计算哈希
  showStats: true          // 是否显示统计
};
```

---

## 🔧 API 文档

### 文件读取

#### `readFileData(filePath)`

读取文件数据。

**参数**:
- `filePath` (string): 文件路径

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  data?: Uint8Array;
  size?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { readFileData } from '@/services/filePreprocessService';

async function handleReadFile(filePath) {
  const result = await readFileData(filePath);
  
  if (result.success) {
    console.log('文件数据:', result.data);
    console.log('数据大小:', result.size);
  } else {
    console.error('读取失败:', result.message);
  }
}
```

---

### 数据压缩

#### `compressFileData(data, options)`

压缩文件数据。

**参数**:
- `data` (Uint8Array): 原始数据
- `options` (Object, 可选)
  - `level` (number): 压缩级别 (0-9)，默认 6
  - `showStats` (boolean): 是否显示统计，默认 true

**返回值**: `Object`

```typescript
{
  success: boolean;
  data?: Uint8Array;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
  compressionTime?: string;
  stats?: Object;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { compressFileData } from '@/services/filePreprocessService';

const data = new Uint8Array([...]); // 原始数据

// 带统计的压缩
const result = compressFileData(data, {
  level: 6,
  showStats: true
});

if (result.success) {
  console.log('原始大小:', result.originalSize);
  console.log('压缩后大小:', result.compressedSize);
  console.log('压缩率:', result.compressionRatio + '%');
  console.log('压缩时间:', result.compressionTime + ' ms');
}
```

---

### 哈希计算

#### `calculateFileHash(data)`

计算文件 SHA256 哈希。

**参数**:
- `data` (Uint8Array): 文件数据

**返回值**: `Object`

```typescript
{
  success: boolean;
  hash?: string;
  algorithm?: string;
  dataSize?: number;
  calculationTime?: string;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { calculateFileHash } from '@/services/filePreprocessService';

const data = new Uint8Array([...]); // 文件数据

const result = calculateFileHash(data);

if (result.success) {
  console.log('SHA256 哈希:', result.hash);
  console.log('数据大小:', result.dataSize);
  console.log('计算时间:', result.calculationTime + ' ms');
}
```

---

### 完整预处理

#### `preprocessFile(filePath, options)`

完整的文件预处理流程。

**参数**:
- `filePath` (string): 文件路径
- `options` (Object, 可选)
  - `compress` (boolean): 是否压缩，默认 true
  - `compressionLevel` (number): 压缩级别，默认 6
  - `calculateHash` (boolean): 是否计算哈希，默认 true
  - `showStats` (boolean): 是否显示统计，默认 true

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  data?: {
    original: Uint8Array;
    processed: Uint8Array;
    originalSize: number;
    processedSize: number;
    compressed: boolean;
    hash: string;
  };
  stats?: {
    originalSize: number;
    processedSize: number;
    compressed: boolean;
    compressionStats: Object;
    hash: string;
    hashTime: number;
    totalTime: string;
    sizeReduction: string;
  };
  error?: string;
  message?: string;
  stage?: string;
}
```

**使用示例**:

```javascript
import { preprocessFile } from '@/services/filePreprocessService';

async function handlePreprocessFile(filePath) {
  const result = await preprocessFile(filePath, {
    compress: true,
    compressionLevel: 6,
    calculateHash: true,
    showStats: true
  });
  
  if (result.success) {
    console.log('预处理完成！');
    console.log('原始数据:', result.data.original);
    console.log('处理后数据:', result.data.processed);
    console.log('是否压缩:', result.data.compressed);
    console.log('文件哈希:', result.data.hash);
    
    console.log('统计信息:');
    console.log('- 原始大小:', result.stats.originalSize);
    console.log('- 处理后大小:', result.stats.processedSize);
    console.log('- 大小减少:', result.stats.sizeReduction);
    console.log('- 总耗时:', result.stats.totalTime + ' ms');
  } else {
    console.error('预处理失败:', result.message);
    console.error('失败阶段:', result.stage);
  }
}
```

---

### 批量预处理

#### `preprocessFileBatch(filePaths, options)`

批量预处理多个文件。

**参数**:
- `filePaths` (Array<string>): 文件路径数组
- `options` (Object, 可选): 预处理选项

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<Object>;
  errors: Array<Object>;
}
```

**使用示例**:

```javascript
import { preprocessFileBatch } from '@/services/filePreprocessService';

async function handleBatchPreprocess(filePaths) {
  const result = await preprocessFileBatch(filePaths, {
    compress: true,
    calculateHash: true
  });
  
  console.log('总文件数:', result.total);
  console.log('成功:', result.succeeded);
  console.log('失败:', result.failed);
  
  // 处理成功的文件
  result.results.forEach(r => {
    console.log('文件:', r.filePath);
    console.log('哈希:', r.data.hash);
  });
  
  // 处理失败的文件
  result.errors.forEach(e => {
    console.error('文件:', e.filePath);
    console.error('错误:', e.message);
  });
}
```

---

### 结果验证

#### `validatePreprocessResult(preprocessResult)`

验证预处理结果。

**参数**:
- `preprocessResult` (Object): 预处理结果

**返回值**: `Object`

```typescript
{
  valid: boolean;
  errors: Array<string>;
  warnings: Array<string>;
}
```

**使用示例**:

```javascript
import { preprocessFile, validatePreprocessResult } from '@/services/filePreprocessService';

async function handleValidatePreprocess(filePath) {
  const preprocessResult = await preprocessFile(filePath);
  
  const validation = validatePreprocessResult(preprocessResult);
  
  if (validation.valid) {
    console.log('验证通过！');
  } else {
    console.error('验证失败:');
    validation.errors.forEach(error => {
      console.error('- ' + error);
    });
  }
}
```

---

#### `getPreprocessSummary(preprocessResult)`

获取预处理摘要。

**参数**:
- `preprocessResult` (Object): 预处理结果

**返回值**: `Object`

**使用示例**:

```javascript
import { preprocessFile, getPreprocessSummary } from '@/services/filePreprocessService';

async function handleGetSummary(filePath) {
  const preprocessResult = await preprocessFile(filePath);
  
  const summary = getPreprocessSummary(preprocessResult);
  
  if (summary.success) {
    console.log('摘要信息:');
    console.log(summary.summary);
    // {
    //   originalSize: 1000,
    //   processedSize: 800,
    //   compressed: true,
    //   sizeReduction: '20%',
    //   hash: 'abc123...',
    //   totalTime: '10.5 ms'
    // }
  }
}
```

---

## 📝 完整使用示例

### 示例 1: 完整的文件预处理流程

```javascript
import { selectAndValidateFile } from '@/services/fileService';
import { preprocessFile, validatePreprocessResult } from '@/services/filePreprocessService';

async function handleCompletePreprocess() {
  // 1. 选择文件
  const selectResult = await selectAndValidateFile({
    maxSize: 1048576  // 1MB
  });
  
  if (!selectResult.success) {
    alert('文件选择失败: ' + selectResult.message);
    return;
  }
  
  const { file } = selectResult;
  console.log('选择的文件:', file.name);
  
  // 2. 预处理文件
  const preprocessResult = await preprocessFile(file.path, {
    compress: true,
    compressionLevel: 6,
    calculateHash: true,
    showStats: true
  });
  
  if (!preprocessResult.success) {
    alert('预处理失败: ' + preprocessResult.message);
    return;
  }
  
  // 3. 验证结果
  const validation = validatePreprocessResult(preprocessResult);
  
  if (!validation.valid) {
    alert('验证失败: ' + validation.errors.join(', '));
    return;
  }
  
  // 4. 显示结果
  const { data, stats } = preprocessResult;
  
  console.log('预处理完成！');
  console.log('原始大小:', stats.originalSize, '字节');
  console.log('处理后大小:', stats.processedSize, '字节');
  console.log('是否压缩:', data.compressed);
  console.log('大小减少:', stats.sizeReduction);
  console.log('文件哈希:', stats.hash);
  console.log('总耗时:', stats.totalTime + ' ms');
  
  // 5. 使用处理后的数据
  const processedData = data.processed;
  // 继续进行分片、生成二维码等操作...
}
```

### 示例 2: 自定义预处理选项

```javascript
import { preprocessFile } from '@/services/filePreprocessService';

async function handleCustomPreprocess(filePath) {
  // 不压缩，只计算哈希
  const result1 = await preprocessFile(filePath, {
    compress: false,
    calculateHash: true
  });
  
  // 高压缩级别
  const result2 = await preprocessFile(filePath, {
    compress: true,
    compressionLevel: 9,
    calculateHash: true
  });
  
  // 快速压缩
  const result3 = await preprocessFile(filePath, {
    compress: true,
    compressionLevel: 1,
    calculateHash: false
  });
}
```

---

## ⚠️ 注意事项

1. **压缩效果**
   - 只有压缩后更小才使用压缩数据
   - 对于已压缩的文件（如 .zip），可能不会再压缩

2. **性能考虑**
   - 压缩级别越高，耗时越长
   - 建议使用默认级别 6（平衡压缩率和速度）
   - 大文件计算哈希可能需要较长时间

3. **错误处理**
   - 始终检查 `success` 字段
   - 检查 `stage` 字段了解失败阶段
   - 使用 `validatePreprocessResult` 验证结果

4. **内存使用**
   - 预处理会同时保留原始数据和处理后数据
   - 对于大文件，注意内存占用

---

**最后更新**: 2025-10-06 16:20

