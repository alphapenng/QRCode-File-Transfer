# Preload API 使用指南

## 概述

Preload 脚本通过 `contextBridge` 暴露安全的 API 给渲染进程，实现主进程和渲染进程之间的安全通信。

---

## API 结构

所有 API 都挂载在 `window.electronAPI` 对象上：

```javascript
window.electronAPI = {
  versions: { ... },    // 版本信息
  file: { ... },        // 文件操作 API
  transfer: { ... },    // 传输相关 API
  system: { ... },      // 系统相关 API
  config: { ... }       // 配置管理 API
}
```

---

## 1. 版本信息

### `versions`

获取 Node.js、Chrome 和 Electron 的版本信息。

**类型**:
```typescript
versions: {
  node: string;
  chrome: string;
  electron: string;
}
```

**使用示例**:
```javascript
const { node, chrome, electron } = window.electronAPI.versions;
console.log(`Node: ${node}, Chrome: ${chrome}, Electron: ${electron}`);
```

---

## 2. 文件操作 API

### `file.select()`

打开文件选择对话框。

**返回值**:
```typescript
Promise<{
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  canceled?: boolean;
  error?: string;
  message?: string;
}>
```

**使用示例**:
```javascript
const result = await window.electronAPI.file.select();
if (result.success) {
  console.log('选择的文件:', result.filePath);
  console.log('文件名:', result.fileName);
  console.log('文件大小:', result.fileSize);
} else if (result.canceled) {
  console.log('用户取消了选择');
} else {
  console.error('错误:', result.message);
}
```

### `file.read(filePath)`

读取文件内容。

**参数**:
- `filePath` (string): 文件路径

**返回值**:
```typescript
Promise<{
  success: boolean;
  data?: ArrayBuffer;
  size?: number;
  error?: string;
  message?: string;
}>
```

**使用示例**:
```javascript
const result = await window.electronAPI.file.read('/path/to/file.txt');
if (result.success) {
  const text = new TextDecoder().decode(result.data);
  console.log('文件内容:', text);
} else {
  console.error('读取失败:', result.message);
}
```

### `file.saveDialog(defaultFileName)`

打开保存对话框。

**参数**:
- `defaultFileName` (string, 可选): 默认文件名

**返回值**:
```typescript
Promise<{
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
  message?: string;
}>
```

**使用示例**:
```javascript
const result = await window.electronAPI.file.saveDialog('document.txt');
if (result.success) {
  console.log('保存路径:', result.filePath);
} else if (result.canceled) {
  console.log('用户取消了保存');
}
```

### `file.save(options)`

保存文件。

**参数**:
```typescript
{
  filePath: string;
  data: ArrayBuffer;
}
```

**返回值**:
```typescript
Promise<{
  success: boolean;
  filePath?: string;
  size?: number;
  error?: string;
  message?: string;
}>
```

**使用示例**:
```javascript
const text = 'Hello, World!';
const data = new TextEncoder().encode(text);

const result = await window.electronAPI.file.save({
  filePath: '/path/to/save.txt',
  data: data.buffer
});

if (result.success) {
  console.log('保存成功:', result.filePath);
} else {
  console.error('保存失败:', result.message);
}
```

### `file.info(filePath)`

获取文件信息。

**参数**:
- `filePath` (string): 文件路径

**返回值**:
```typescript
Promise<{
  success: boolean;
  info?: {
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
    isDirectory: boolean;
  };
  error?: string;
  message?: string;
}>
```

**使用示例**:
```javascript
const result = await window.electronAPI.file.info('/path/to/file.txt');
if (result.success) {
  console.log('文件大小:', result.info.size);
  console.log('创建时间:', result.info.created);
  console.log('修改时间:', result.info.modified);
}
```

---

## 3. 传输相关 API

### `transfer.sendProgress(progress)`

发送进度更新。

**参数**:
```typescript
{
  current: number;
  total: number;
  percentage: number;
  fileName?: string;
}
```

**使用示例**:
```javascript
await window.electronAPI.transfer.sendProgress({
  current: 50,
  total: 100,
  percentage: 50,
  fileName: 'document.txt'
});
```

### `transfer.receiveProgress(progress)`

接收进度更新。

**参数**: 同 `sendProgress`

### `transfer.complete(data)`

传输完成通知。

**参数**:
```typescript
{
  fileName: string;
  fileSize: number;
  duration: number;
}
```

**使用示例**:
```javascript
await window.electronAPI.transfer.complete({
  fileName: 'document.txt',
  fileSize: 1024,
  duration: 5000
});
```

### `transfer.error(errorData)`

传输错误通知。

**参数**:
```typescript
{
  error: string;
  message: string;
}
```

### `transfer.cancel()`

取消传输。

**使用示例**:
```javascript
await window.electronAPI.transfer.cancel();
```

### 事件监听

#### `transfer.onProgressUpdate(callback)`

监听进度更新事件。

**使用示例**:
```javascript
const unsubscribe = window.electronAPI.transfer.onProgressUpdate((data) => {
  console.log('进度:', data.percentage + '%');
});

// 取消监听
unsubscribe();
```

#### `transfer.onComplete(callback)`

监听传输完成事件。

#### `transfer.onError(callback)`

监听传输错误事件。

#### `transfer.onCancelled(callback)`

监听传输取消事件。

---

## 4. 系统相关 API

### `system.getVersion()`

获取应用版本信息。

**返回值**:
```typescript
Promise<{
  success: boolean;
  version?: string;
  name?: string;
  electron?: string;
  chrome?: string;
  node?: string;
}>
```

**使用示例**:
```javascript
const result = await window.electronAPI.system.getVersion();
if (result.success) {
  console.log('应用版本:', result.version);
  console.log('应用名称:', result.name);
}
```

### `system.getPath(name)`

获取应用路径。

**参数**:
- `name` (string): 路径名称
  - `home` - 用户主目录
  - `appData` - 应用数据目录
  - `userData` - 用户数据目录
  - `temp` - 临时目录
  - `exe` - 可执行文件路径
  - `desktop` - 桌面目录
  - `documents` - 文档目录
  - `downloads` - 下载目录
  - `music` - 音乐目录
  - `pictures` - 图片目录
  - `videos` - 视频目录

**使用示例**:
```javascript
const result = await window.electronAPI.system.getPath('downloads');
if (result.success) {
  console.log('下载目录:', result.path);
}
```

### `system.showItemInFolder(fullPath)`

在文件管理器中显示文件。

**参数**:
- `fullPath` (string): 文件完整路径

**使用示例**:
```javascript
await window.electronAPI.system.showItemInFolder('/path/to/file.txt');
```

### `system.openExternal(url)`

在默认浏览器中打开 URL。

**参数**:
- `url` (string): URL 地址

**使用示例**:
```javascript
await window.electronAPI.system.openExternal('https://github.com');
```

---

## 5. 配置管理 API

### `config.get(key)`

获取配置项。

**参数**:
- `key` (string): 配置键（支持点号路径，如 `'window.width'`）

**使用示例**:
```javascript
const result = await window.electronAPI.config.get('window.width');
if (result.success) {
  console.log('窗口宽度:', result.value);
}
```

### `config.set(key, value)`

设置配置项。

**参数**:
- `key` (string): 配置键
- `value` (any): 配置值

**使用示例**:
```javascript
await window.electronAPI.config.set('window.width', 1200);
```

### `config.getAll()`

获取所有配置。

**使用示例**:
```javascript
const result = await window.electronAPI.config.getAll();
if (result.success) {
  console.log('所有配置:', result.config);
}
```

### `config.reset()`

重置配置为默认值。

### `config.addRecentFile(filePath)`

添加最近使用的文件。

**使用示例**:
```javascript
await window.electronAPI.config.addRecentFile('/path/to/file.txt');
```

### `config.getRecentFiles()`

获取最近使用的文件列表。

**使用示例**:
```javascript
const result = await window.electronAPI.config.getRecentFiles();
if (result.success) {
  console.log('最近使用的文件:', result.files);
}
```

### `config.clearRecentFiles()`

清除最近使用的文件列表。

---

## 使用建议

### 1. 错误处理

始终检查 `success` 字段：

```javascript
const result = await window.electronAPI.file.select();
if (result.success) {
  // 处理成功情况
} else {
  // 处理错误情况
  console.error(result.error, result.message);
}
```

### 2. 事件监听清理

记得在组件卸载时取消事件监听：

```javascript
// React 示例
useEffect(() => {
  const unsubscribe = window.electronAPI.transfer.onProgressUpdate((data) => {
    setProgress(data.percentage);
  });

  return () => {
    unsubscribe(); // 清理监听器
  };
}, []);
```

### 3. TypeScript 支持

如果使用 TypeScript，可以导入类型定义：

```typescript
/// <reference path="../../preload/types.d.ts" />

const api = window.electronAPI;
// 现在有完整的类型提示
```

---

## 安全注意事项

1. **不要直接暴露 Node.js API**
   - 所有 API 都经过 contextBridge 封装
   - 渲染进程无法直接访问 Node.js 模块

2. **验证输入**
   - 主进程会验证所有来自渲染进程的输入
   - 不要信任任何用户输入

3. **限制文件访问**
   - 文件操作受到路径和大小限制
   - 当前限制：1MB

4. **使用白名单**
   - 只暴露必要的 API
   - 不要暴露危险的系统操作

---

**最后更新**: 2025-10-06 09:25

