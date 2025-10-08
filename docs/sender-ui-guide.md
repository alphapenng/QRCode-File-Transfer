# 发送端 UI 使用指南

## 概述

本文档介绍发送端 UI 的功能、使用方法和实现细节。

**文件**: `src/renderer/src/components/layout/SenderLayout.jsx`

**功能**:
- 文件选择
- 文件信息显示
- 传输控制
- 二维码显示
- 进度跟踪

---

## 🎨 界面布局

### 整体结构

```
┌─────────────────────────┬─────────────────────────┐
│    文件选择卡片         │    二维码显示区域        │
├─────────────────────────┤                         │
│    传输控制卡片         │                         │
└─────────────────────────┴─────────────────────────┘
```

### 左侧区域

#### 1. 文件选择卡片
- **选择文件按钮**: 打开文件选择对话框
- **文件信息显示**:
  - 文件名
  - 文件大小（KB）
  - 文件类型徽章
  - 文件路径

#### 2. 传输控制卡片
- **状态徽章**: 显示当前传输状态
- **进度条**: 显示传输进度百分比
- **分片计数**: 显示已发送/总分片数
- **错误提示**: 显示错误信息（如果有）
- **控制按钮**: 根据状态显示不同按钮

### 右侧区域

#### 二维码显示区域
- **空闲状态**: 显示二维码图标和提示
- **准备中**: 显示加载动画
- **发送中**: 显示实时二维码
- **暂停**: 显示暂停遮罩
- **完成**: 显示成功图标
- **错误**: 显示错误图标和信息

---

## 🔄 状态管理

### 传输状态

发送端有 6 种状态：

1. **idle（空闲）**
   - 初始状态
   - 可以选择文件
   - 显示"开始传输"按钮

2. **preparing（准备中）**
   - 正在预处理文件
   - 显示加载动画
   - 按钮禁用

3. **sending（发送中）**
   - 正在发送二维码
   - 显示实时二维码
   - 显示"暂停"和"取消"按钮

4. **paused（已暂停）**
   - 传输已暂停
   - 二维码显示暂停遮罩
   - 显示"继续"和"取消"按钮

5. **completed（已完成）**
   - 传输成功完成
   - 显示成功图标
   - 显示"发送新文件"按钮

6. **error（错误）**
   - 传输过程中发生错误
   - 显示错误图标和信息
   - 显示"重试"按钮

### 状态转换

```
idle → preparing → sending → completed
                      ↓
                   paused → sending
                      ↓
                   error
```

---

## 🎯 功能实现

### 1. 文件选择

**触发**: 点击"选择文件"按钮

**流程**:
1. 调用 `window.electronAPI.file.select()`
2. 显示文件选择对话框
3. 用户选择文件
4. 更新 `selectedFile` 状态
5. 显示文件信息

**支持的文件类型**:
- 所有文件 (*)
- 文本文件 (.txt, .md, .json)
- Office 文档 (.doc, .docx, .xls, .xlsx, .ppt, .pptx)
- 图片 (.jpg, .jpeg, .png, .gif)
- PDF (.pdf)

**文件大小限制**: 最大 1MB

---

### 2. 开始传输

**触发**: 点击"开始传输"按钮

**前提条件**:
- 已选择文件
- 状态为 idle

**流程**:
1. 状态变为 preparing
2. 调用 `senderService.send(filePath, canvas)`
3. 服务开始预处理文件
4. 状态变为 sending
5. 开始播放二维码

**服务集成**:
```javascript
await senderServiceRef.current.send(selectedFile.path, canvasRef.current);
```

---

### 3. 暂停传输

**触发**: 点击"暂停"按钮

**流程**:
1. 调用 `senderService.pause()`
2. 状态变为 paused
3. 二维码播放暂停
4. 显示暂停遮罩

---

### 4. 恢复传输

**触发**: 点击"继续"按钮

**流程**:
1. 调用 `senderService.resume()`
2. 状态变为 sending
3. 继续播放二维码

---

### 5. 取消传输

**触发**: 点击"取消"按钮

**流程**:
1. 调用 `senderService.cancel()`
2. 状态变为 idle
3. 清空进度和二维码
4. 保留已选择的文件

---

### 6. 重置（传输完成后）

**触发**: 点击"发送新文件"按钮

**流程**:
1. 状态变为 idle
2. 清空所有数据
3. 可以选择新文件

---

## 📊 进度显示

### 进度信息

- **百分比**: 0-100%
- **分片计数**: 已发送/总分片数
- **传输速度**: 10 帧/秒
- **预计剩余时间**: 根据剩余分片计算

### 进度更新

通过监听 `progress` 事件：

```javascript
senderServiceRef.current.on('progress', (progressData) => {
  setProgress(progressData.percentage);
  setCurrentChunk(progressData.currentChunk);
  setTotalChunks(progressData.totalChunks);
});
```

---

## 🖼️ 二维码显示

### 二维码更新

通过监听 `qrcode` 事件：

```javascript
senderServiceRef.current.on('qrcode', (dataUrl) => {
  setQrcodeDataUrl(dataUrl);
});
```

### 显示方式

```jsx
<img 
  src={qrcodeDataUrl} 
  alt="QR Code" 
  className="w-full h-auto max-w-md mx-auto"
/>
```

### 播放速度

- **默认**: 10 帧/秒
- **可配置**: 通过 SenderService 选项

---

## ⚠️ 错误处理

### 错误类型

1. **文件选择错误**
   - 用户取消选择
   - 文件不存在
   - 权限不足

2. **传输错误**
   - 文件读取失败
   - 预处理失败
   - 二维码生成失败

### 错误显示

```jsx
{errorMessage && (
  <Alert variant="destructive">
    <AlertTitle>错误</AlertTitle>
    <AlertDescription>{errorMessage}</AlertDescription>
  </Alert>
)}
```

### 错误恢复

- 显示"重试"按钮
- 点击后重置状态
- 可以重新选择文件

---

## 🎨 UI 组件

### 使用的组件

- **Card**: 卡片容器
- **Button**: 操作按钮
- **Progress**: 进度条
- **Badge**: 状态徽章
- **Alert**: 错误提示

### 图标

使用内联 SVG 图标：
- 上传图标（选择文件）
- 播放图标（开始/继续）
- 暂停图标（暂停）
- 取消图标（取消）
- 加载图标（准备中）
- 成功图标（完成）
- 错误图标（错误）

---

## 📝 使用示例

### 基本使用

```jsx
import { SenderLayout } from '@/components/layout';

function SenderPage() {
  return <SenderLayout />;
}
```

### 在 App 中使用

```jsx
import { MainLayout, AppTabs } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <AppTabs />
    </MainLayout>
  );
}
```

---

## 🔧 服务集成

### SenderService

**文件**: `src/renderer/src/services/senderIPCService.js`

**方法**:
- `send(filePath, canvas)` - 开始发送
- `pause()` - 暂停发送
- `resume()` - 恢复发送
- `cancel()` - 取消发送
- `getState()` - 获取状态
- `getProgress()` - 获取进度

**事件**:
- `stateChange` - 状态变化
- `progress` - 进度更新
- `qrcode` - 二维码更新
- `complete` - 传输完成
- `error` - 发生错误

---

## 💡 最佳实践

1. **文件大小检查**
   - 在选择文件后检查大小
   - 超过限制时显示警告

2. **用户反馈**
   - 及时更新状态
   - 显示详细的进度信息
   - 提供清晰的错误信息

3. **资源清理**
   - 组件卸载时取消传输
   - 清理事件监听器

4. **错误恢复**
   - 提供重试选项
   - 保留用户选择的文件

---

## 📖 参考资源

- **SenderService 文档**: `docs/sender-ipc-service-guide.md`
- **布局设计文档**: `docs/layout-design-guide.md`
- **shadcn/ui 文档**: `docs/shadcn-ui-components-guide.md`

---

**最后更新**: 2025-10-06 19:00

