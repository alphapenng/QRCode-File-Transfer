/*
 * @Description: 
 * @Author: alphapenng
 * @Github: 
 * @Date: 2025-10-06 00:21:09
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-06 00:36:28
 * @FilePath: \qrcode-app\src\renderer\src\App.jsx
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';

function App() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-[#4ba293ff] to-[#084b45ff] text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">码上传报</h1>
          <p className="text-sm opacity-90 mt-1">QRCode File Transfer v1.0.0</p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 container mx-auto p-6">
        <Tabs defaultValue="sender" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sender">发送文件</TabsTrigger>
            <TabsTrigger value="receiver">接收文件</TabsTrigger>
          </TabsList>

          {/* 发送端 */}
          <TabsContent value="sender">
            <Card>
              <CardHeader>
                <CardTitle>发送文件</CardTitle>
                <CardDescription>
                  选择文件并生成二维码进行传输
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    文件发送功能将在后续任务中实现
                  </p>
                  <Button>选择文件</Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>传输进度</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 接收端 */}
          <TabsContent value="receiver">
            <Card>
              <CardHeader>
                <CardTitle>接收文件</CardTitle>
                <CardDescription>
                  使用扫码枪扫描二维码接收文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    文件接收功能将在后续任务中实现
                  </p>
                  <Button variant="outline">开始接收</Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>接收进度</span>
                    <span>0 / 0 分片</span>
                  </div>
                  <Progress value={0} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 底部状态栏 */}
      <footer className="border-t bg-muted/50 p-4">
        <div className="container mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <span>状态: 就绪</span>
          <span>Electron {window.electronAPI?.versions?.electron || 'N/A'}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

