# shadcn/ui 集成说明

## 已完成的配置

### ✅ 1. Tailwind CSS 安装
- tailwindcss 3.4.17
- postcss 8.4.49
- autoprefixer 10.4.20

### ✅ 2. shadcn/ui 依赖
- class-variance-authority 0.7.1 - CSS 类变体管理
- clsx 2.1.1 - 条件类名工具
- tailwind-merge 2.5.5 - Tailwind 类名合并
- lucide-react 0.469.0 - 图标库

### ✅ 3. Radix UI 组件
- @radix-ui/react-tabs 1.1.2 - 标签组件
- @radix-ui/react-progress 1.1.1 - 进度条组件

### ✅ 4. 配置文件
- `tailwind.config.js` - Tailwind CSS 配置
- `postcss.config.js` - PostCSS 配置
- `src/renderer/src/lib/utils.js` - 工具函数

### ✅ 5. CSS 变量主题
在 `src/renderer/src/index.css` 中配置了完整的主题变量：
- 亮色主题
- 暗色主题（预留）
- 自定义主色调：青绿色 (#4ba293ff)

---

## 已安装的组件

### 1. Button 组件
**文件**: `src/renderer/src/components/ui/button.jsx`

**变体**:
- `default` - 默认按钮（主色）
- `destructive` - 危险操作按钮
- `outline` - 轮廓按钮
- `secondary` - 次要按钮
- `ghost` - 幽灵按钮
- `link` - 链接样式按钮

**尺寸**:
- `default` - 默认尺寸
- `sm` - 小尺寸
- `lg` - 大尺寸
- `icon` - 图标按钮

**使用示例**:
```jsx
import { Button } from './components/ui/button';

<Button>默认按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button size="lg">大按钮</Button>
```

### 2. Card 组件
**文件**: `src/renderer/src/components/ui/card.jsx`

**子组件**:
- `Card` - 卡片容器
- `CardHeader` - 卡片头部
- `CardTitle` - 卡片标题
- `CardDescription` - 卡片描述
- `CardContent` - 卡片内容
- `CardFooter` - 卡片底部

**使用示例**:
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述文本</CardDescription>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
</Card>
```

### 3. Tabs 组件
**文件**: `src/renderer/src/components/ui/tabs.jsx`

**子组件**:
- `Tabs` - 标签容器
- `TabsList` - 标签列表
- `TabsTrigger` - 标签触发器
- `TabsContent` - 标签内容

**使用示例**:
```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">标签1</TabsTrigger>
    <TabsTrigger value="tab2">标签2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容1</TabsContent>
  <TabsContent value="tab2">内容2</TabsContent>
</Tabs>
```

### 4. Progress 组件
**文件**: `src/renderer/src/components/ui/progress.jsx`

**使用示例**:
```jsx
import { Progress } from './components/ui/progress';

<Progress value={50} />
```

---

## 主题配置

### CSS 变量
所有颜色都使用 CSS 变量定义，可以在 `src/renderer/src/index.css` 中修改：

```css
:root {
  --primary: 174 62% 47%;  /* 主色：青绿色 */
  --background: 0 0% 100%;  /* 背景色：白色 */
  --foreground: 222.2 84% 4.9%;  /* 前景色：深色 */
  /* ... 更多变量 */
}
```

### 自定义主色
当前主色设置为青绿色 `#4ba293ff`，对应 HSL 值 `174 62% 47%`。

如需修改，更新以下位置：
1. `tailwind.config.js` 中的 `--primary` 变量
2. `src/renderer/src/index.css` 中的 `:root` 变量
3. `src/renderer/src/index.css` 中的头部渐变色

---

## 工具函数

### cn() 函数
**文件**: `src/renderer/src/lib/utils.js`

用于合并 Tailwind CSS 类名，自动处理冲突：

```jsx
import { cn } from './lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  "override-class"
)} />
```

---

## Tailwind CSS 配置

### 内容路径
```javascript
content: [
  "./src/renderer/index.html",
  "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
]
```

### 扩展主题
- 自定义颜色（使用 CSS 变量）
- 自定义圆角（使用 CSS 变量）
- 自定义动画（accordion-down, accordion-up）

---

## 后续可添加的组件

### 推荐组件（任务 1.5.x）
- [ ] Alert - 警告提示
- [ ] Badge - 徽章
- [ ] Toast - 消息提示
- [ ] Dialog - 对话框
- [ ] Input - 输入框
- [ ] Label - 标签
- [ ] Select - 选择器
- [ ] Checkbox - 复选框

### 添加新组件的步骤
1. 安装必要的 Radix UI 依赖
2. 创建组件文件在 `src/renderer/src/components/ui/`
3. 在 `src/renderer/src/components/ui/index.js` 中导出
4. 在需要的地方导入使用

---

## 使用建议

### 1. 组件导入
推荐使用统一导入：
```jsx
import { Button, Card, Tabs } from './components/ui';
```

或单独导入：
```jsx
import { Button } from './components/ui/button';
```

### 2. 样式覆盖
使用 `className` 属性覆盖默认样式：
```jsx
<Button className="w-full">全宽按钮</Button>
```

### 3. 响应式设计
使用 Tailwind 的响应式前缀：
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 内容 */}
</div>
```

### 4. 暗色模式
暗色模式已预留配置，可通过添加 `dark` 类激活：
```jsx
<html className="dark">
```

---

## 故障排除

### 问题 1: 样式不生效
确保 Tailwind 指令已添加到 `index.css`：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 问题 2: 组件导入错误
检查路径别名配置：
```javascript
// vite.config.js
resolve: {
  alias: {
    '@': resolve(__dirname, 'src/renderer/src'),
  }
}
```

### 问题 3: CSS 变量未定义
确保 `:root` 中定义了所有必要的 CSS 变量。

### 问题 4: Radix UI 组件不工作
检查是否安装了对应的 Radix UI 包：
```bash
npm list @radix-ui/react-tabs
```

---

## 参考资料

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 文档](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

---

**最后更新**: 2025-10-06 07:52

