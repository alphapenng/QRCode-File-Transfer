/**
 * shadcn/ui 组件使用示例
 * 
 * 此文件展示了如何使用项目中的 shadcn/ui 组件
 * 仅用于开发参考，不会在生产环境中使用
 */

import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Input,
  Label,
  Separator
} from '../ui';

export function ComponentExamples() {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui 组件示例</h1>
      
      {/* Button 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Button（按钮）</h2>
        <div className="flex flex-wrap gap-2">
          <Button>默认按钮</Button>
          <Button variant="destructive">删除</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
          <Button size="sm">小按钮</Button>
          <Button size="lg">大按钮</Button>
        </div>
      </section>
      
      <Separator />
      
      {/* Card 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Card（卡片）</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>文件信息</CardTitle>
              <CardDescription>准备发送的文件</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">文件名: document.pdf</p>
              <p className="text-sm">大小: 1.2 MB</p>
            </CardContent>
            <CardFooter>
              <Button>发送文件</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>接收状态</CardTitle>
              <CardDescription>正在接收文件</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{progress}% 完成</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Separator />
      
      {/* Tabs 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tabs（标签页）</h2>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">发送文件</TabsTrigger>
            <TabsTrigger value="receive">接收文件</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>发送文件</CardTitle>
                <CardDescription>选择要发送的文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button>选择文件</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="receive">
            <Card>
              <CardHeader>
                <CardTitle>接收文件</CardTitle>
                <CardDescription>扫描二维码接收文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button>开始扫描</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      
      <Separator />
      
      {/* Progress 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progress（进度条）</h2>
        <div className="space-y-4">
          <div>
            <Label>传输进度</Label>
            <Progress value={progress} className="mt-2" />
          </div>
          <div>
            <Label>完成</Label>
            <Progress value={100} className="mt-2" />
          </div>
        </div>
      </section>
      
      <Separator />
      
      {/* Alert 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Alert（警告）</h2>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>提示</AlertTitle>
            <AlertDescription>
              这是一个默认的提示消息。
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>
              文件传输失败，请重试。
            </AlertDescription>
          </Alert>
        </div>
      </section>
      
      <Separator />
      
      {/* Badge 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Badge（徽章）</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>默认</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="destructive">危险</Badge>
          <Badge variant="outline">轮廓</Badge>
        </div>
      </section>
      
      <Separator />
      
      {/* Input 和 Label 示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Input & Label（输入框和标签）</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="filename">文件名</Label>
            <Input id="filename" placeholder="输入文件名" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
        </div>
      </section>
      
      <Separator />
      
      {/* 组合示例 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">组合示例</h2>
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>文件传输</CardTitle>
              <Badge>进行中</Badge>
            </div>
            <CardDescription>正在传输文件到另一台设备</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>document.pdf</span>
                <span className="text-muted-foreground">1.2 MB</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-right">
                {progress}% 完成
              </p>
            </div>
            
            <Alert>
              <AlertTitle>提示</AlertTitle>
              <AlertDescription>
                请保持二维码在摄像头视野内。
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">暂停</Button>
            <Button variant="destructive">取消</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

export default ComponentExamples;

