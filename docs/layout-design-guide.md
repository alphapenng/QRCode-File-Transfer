# 布局设计指南

## 概述

本文档介绍应用的布局设计和组件结构。

**设计原则**:
- 简洁明了
- 响应式设计
- 用户友好
- 功能分离

---

## 📐 布局结构

### 整体布局

```
┌─────────────────────────────────────┐
│           Header（头部）             │
├─────────────────────────────────────┤
│                                     │
│         Main Content（主内容）       │
│                                     │
│  ┌─────────────┬─────────────┐     │
│  │  发送文件   │  接收文件   │     │
│  └─────────────┴─────────────┘     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Tab Content（内容）     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│          Footer（底部）              │
└─────────────────────────────────────┘
```

---

## 🎨 布局组件

### 1. MainLayout（主布局）

**文件**: `src/renderer/src/components/layout/MainLayout.jsx`

**功能**:
- 提供应用的整体布局结构
- 包含头部、主内容区、底部

**结构**:
```jsx
<MainLayout>
  <Header>
    - Logo
    - 应用标题
    - 版本号
  </Header>
  
  <Main>
    {children}
  </Main>
  
  <Footer>
    - 版权信息
  </Footer>
</MainLayout>
```

**使用示例**:
```jsx
import { MainLayout } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <YourContent />
    </MainLayout>
  );
}
```

---

### 2. AppTabs（应用标签页）

**文件**: `src/renderer/src/components/layout/AppTabs.jsx`

**功能**:
- 提供发送端和接收端的切换
- 整合 SenderLayout 和 ReceiverLayout

**结构**:
```jsx
<Tabs>
  <TabsList>
    <TabsTrigger value="sender">发送文件</TabsTrigger>
    <TabsTrigger value="receiver">接收文件</TabsTrigger>
  </TabsList>
  
  <TabsContent value="sender">
    <SenderLayout />
  </TabsContent>
  
  <TabsContent value="receiver">
    <ReceiverLayout />
  </TabsContent>
</Tabs>
```

**使用示例**:
```jsx
import { AppTabs } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <AppTabs />
    </MainLayout>
  );
}
```

---

### 3. SenderLayout（发送端布局）

**文件**: `src/renderer/src/components/layout/SenderLayout.jsx`

**功能**:
- 文件选择和信息显示
- 传输控制
- 二维码显示

**布局结构**:
```
┌─────────────────┬─────────────────┐
│  文件选择卡片   │  二维码显示区域  │
├─────────────────┤                 │
│  传输控制卡片   │                 │
└─────────────────┴─────────────────┘
```

**左侧（文件选择和控制）**:
1. **文件选择卡片**
   - 选择文件按钮
   - 文件信息显示（名称、大小、类型）

2. **传输控制卡片**
   - 传输状态显示
   - 进度条
   - 控制按钮（开始、暂停、继续、取消）

**右侧（二维码显示）**:
- 二维码显示区域
- 状态提示
- 传输速度显示

**状态管理**:
- `idle` - 空闲状态
- `preparing` - 准备中
- `sending` - 发送中
- `paused` - 已暂停
- `completed` - 已完成
- `error` - 错误

**使用示例**:
```jsx
import { SenderLayout } from '@/components/layout';

function SenderPage() {
  return <SenderLayout />;
}
```

---

### 4. ReceiverLayout（接收端布局）

**文件**: `src/renderer/src/components/layout/ReceiverLayout.jsx`

**功能**:
- 摄像头预览
- 扫描控制
- 接收状态显示
- 文件信息显示

**布局结构**:
```
┌─────────────────┬─────────────────┐
│  摄像头预览区域  │  接收状态卡片   │
│                 ├─────────────────┤
│                 │  统计信息卡片   │
└─────────────────┴─────────────────┘
```

**左侧（摄像头预览）**:
- 摄像头画面
- 扫描框
- 控制按钮（开始扫描、停止扫描、保存文件）

**右侧（状态和信息）**:
1. **接收状态卡片**
   - 状态徽章
   - 进度条
   - 文件信息
   - 提示信息

2. **统计信息卡片**
   - 总扫描次数
   - 有效扫描
   - 无效扫描
   - 已用时间

**状态管理**:
- `idle` - 空闲状态
- `scanning` - 扫描中
- `receiving` - 接收中
- `completed` - 已完成
- `error` - 错误

**使用示例**:
```jsx
import { ReceiverLayout } from '@/components/layout';

function ReceiverPage() {
  return <ReceiverLayout />;
}
```

---

## 🎯 响应式设计

### 断点

使用 Tailwind CSS 的默认断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 布局适配

**桌面端（lg 及以上）**:
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>左侧内容</div>
  <div>右侧内容</div>
</div>
```

**移动端（lg 以下）**:
- 自动切换为单列布局
- 垂直堆叠

---

## 🎨 设计规范

### 间距

- **卡片间距**: `gap-6` (24px)
- **内容间距**: `space-y-4` (16px)
- **小间距**: `space-y-2` (8px)
- **页面边距**: `px-4 py-6`

### 圆角

- **卡片**: `rounded-lg` (8px)
- **按钮**: `rounded-md` (6px)
- **输入框**: `rounded-md` (6px)

### 阴影

- **卡片**: 默认 border
- **悬浮**: `hover:shadow-md`

### 颜色

使用 Tailwind CSS 主题颜色：

- **主色**: `primary`
- **次要色**: `secondary`
- **背景色**: `background`
- **前景色**: `foreground`
- **边框色**: `border`
- **静音色**: `muted`
- **危险色**: `destructive`

---

## 📝 使用示例

### 完整应用示例

```jsx
import React from 'react';
import { MainLayout, AppTabs } from '@/components/layout';

function App() {
  return (
    <MainLayout>
      <AppTabs />
    </MainLayout>
  );
}

export default App;
```

### 自定义布局

```jsx
import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function CustomPage() {
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>自定义页面</CardTitle>
        </CardHeader>
        <CardContent>
          <p>自定义内容</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
```

---

## 🔧 扩展布局

### 添加新的布局组件

1. 在 `src/renderer/src/components/layout/` 创建新组件
2. 遵循现有的设计规范
3. 在 `index.js` 中导出

**示例**:

```jsx
// src/renderer/src/components/layout/SettingsLayout.jsx
export function SettingsLayout() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 设置内容 */}
    </div>
  );
}

// src/renderer/src/components/layout/index.js
export { SettingsLayout } from './SettingsLayout';
```

---

## ⚠️ 注意事项

1. **保持一致性**
   - 使用统一的间距和圆角
   - 遵循设计规范

2. **响应式设计**
   - 使用 Tailwind CSS 的响应式类
   - 测试不同屏幕尺寸

3. **可访问性**
   - 使用语义化的 HTML
   - 提供适当的 ARIA 属性

4. **性能**
   - 避免不必要的重渲染
   - 使用 React.memo 优化组件

---

## 📊 组件层次结构

```
App
└── MainLayout
    ├── Header
    ├── Main
    │   └── AppTabs
    │       ├── SenderLayout
    │       │   ├── 文件选择卡片
    │       │   ├── 传输控制卡片
    │       │   └── 二维码显示卡片
    │       └── ReceiverLayout
    │           ├── 摄像头预览卡片
    │           ├── 接收状态卡片
    │           └── 统计信息卡片
    └── Footer
```

---

## 📖 参考资源

- **Tailwind CSS 文档**: https://tailwindcss.com/
- **shadcn/ui 文档**: https://ui.shadcn.com/
- **React 文档**: https://react.dev/

---

**最后更新**: 2025-10-06 18:50

