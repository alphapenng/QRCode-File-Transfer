# shadcn/ui 组件使用指南

## 概述

本项目使用 shadcn/ui 组件库构建用户界面。shadcn/ui 是一个基于 Radix UI 和 Tailwind CSS 的组件集合。

**官方文档**: https://ui.shadcn.com/

**特点**:
- 可访问性优先
- 可自定义
- 复制粘贴式集成
- 基于 Radix UI
- 使用 Tailwind CSS

---

## 📦 已安装的组件

### 1. Button（按钮）

**文件**: `src/renderer/src/components/ui/button.jsx`

**使用示例**:

```jsx
import { Button } from '@/components/ui';

function Example() {
  return (
    <div>
      <Button>默认按钮</Button>
      <Button variant="destructive">删除</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>
      <Button size="sm">小按钮</Button>
      <Button size="lg">大按钮</Button>
      <Button size="icon">图标</Button>
    </div>
  );
}
```

**变体**:
- `default` - 默认样式
- `destructive` - 危险操作（红色）
- `outline` - 轮廓样式
- `secondary` - 次要样式
- `ghost` - 幽灵样式
- `link` - 链接样式

**尺寸**:
- `default` - 默认尺寸
- `sm` - 小尺寸
- `lg` - 大尺寸
- `icon` - 图标按钮

---

### 2. Card（卡片）

**文件**: `src/renderer/src/components/ui/card.jsx`

**使用示例**:

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
        <CardDescription>卡片描述</CardDescription>
      </CardHeader>
      <CardContent>
        <p>卡片内容</p>
      </CardContent>
      <CardFooter>
        <p>卡片底部</p>
      </CardFooter>
    </Card>
  );
}
```

**组件**:
- `Card` - 卡片容器
- `CardHeader` - 卡片头部
- `CardTitle` - 卡片标题
- `CardDescription` - 卡片描述
- `CardContent` - 卡片内容
- `CardFooter` - 卡片底部

---

### 3. Tabs（标签页）

**文件**: `src/renderer/src/components/ui/tabs.jsx`

**使用示例**:

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

function Example() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">标签 1</TabsTrigger>
        <TabsTrigger value="tab2">标签 2</TabsTrigger>
        <TabsTrigger value="tab3">标签 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>标签 1 的内容</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>标签 2 的内容</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>标签 3 的内容</p>
      </TabsContent>
    </Tabs>
  );
}
```

**组件**:
- `Tabs` - 标签页容器
- `TabsList` - 标签列表
- `TabsTrigger` - 标签触发器
- `TabsContent` - 标签内容

---

### 4. Progress（进度条）

**文件**: `src/renderer/src/components/ui/progress.jsx`

**使用示例**:

```jsx
import { Progress } from '@/components/ui';

function Example() {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return <Progress value={progress} />;
}
```

**属性**:
- `value` - 进度值（0-100）
- `className` - 自定义样式

---

## 🎨 主题配置

### Tailwind CSS 配置

**文件**: `tailwind.config.js`

主题颜色已配置在 Tailwind CSS 中，使用 CSS 变量定义。

**CSS 变量**:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... 更多变量 */
}
```

---

## 📝 使用建议

### 1. 导入组件

**推荐方式**（从 index.js 导入）:

```jsx
import { Button, Card, Tabs, Progress } from '@/components/ui';
```

**直接导入**:

```jsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### 2. 自定义样式

使用 `className` 属性添加自定义样式：

```jsx
<Button className="w-full mt-4">
  全宽按钮
</Button>
```

### 3. 组合使用

```jsx
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

function FileCard({ fileName, onSend }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fileName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onSend}>发送文件</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🔧 添加新组件

### 方法 1: 使用 shadcn/ui CLI（推荐）

```bash
npx shadcn-ui@latest add [component-name]
```

例如：

```bash
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
```

### 方法 2: 手动添加

1. 从 shadcn/ui 官网复制组件代码
2. 创建组件文件到 `src/renderer/src/components/ui/`
3. 在 `index.js` 中导出组件

---

## 📚 常用组件推荐

### 文件传输应用推荐组件

1. **Alert** - 警告提示
   - 用于显示错误、警告、成功消息

2. **Dialog** - 对话框
   - 用于确认操作、显示详细信息

3. **Input** - 输入框
   - 用于文件名输入、搜索等

4. **Label** - 标签
   - 用于表单标签

5. **Select** - 选择器
   - 用于选择文件类型、传输速度等

6. **Separator** - 分隔线
   - 用于分隔不同区域

7. **Badge** - 徽章
   - 用于显示状态、标签

8. **Skeleton** - 骨架屏
   - 用于加载状态

9. **Toast** - 提示消息
   - 用于操作反馈

10. **Switch** - 开关
    - 用于设置选项

---

## 🎯 项目中的使用场景

### 发送端 UI

- **Card** - 文件信息卡片
- **Button** - 选择文件、开始传输、暂停等
- **Progress** - 传输进度
- **Tabs** - 切换发送/接收模式

### 接收端 UI

- **Card** - 接收状态卡片
- **Button** - 开始扫描、保存文件等
- **Progress** - 接收进度
- **Alert** - 错误提示、成功提示

### 设置页面

- **Input** - 配置输入
- **Select** - 选项选择
- **Switch** - 功能开关
- **Label** - 配置标签

---

## ⚠️ 注意事项

1. **样式冲突**
   - 避免直接修改组件文件
   - 使用 `className` 添加自定义样式

2. **可访问性**
   - 保持组件的可访问性属性
   - 使用语义化的 HTML

3. **性能**
   - 按需导入组件
   - 避免不必要的重渲染

4. **主题**
   - 使用 CSS 变量定义主题
   - 支持深色模式

---

## 📖 参考资源

- **shadcn/ui 官网**: https://ui.shadcn.com/
- **Radix UI 文档**: https://www.radix-ui.com/
- **Tailwind CSS 文档**: https://tailwindcss.com/

---

**最后更新**: 2025-10-06 18:30

