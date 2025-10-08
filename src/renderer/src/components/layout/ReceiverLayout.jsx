/**
 * 接收端布局组件
 * 提供文件接收界面的布局结构
 */

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Progress,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription
} from '../ui';

export function ReceiverLayout() {
  const [scanState, setScanState] = React.useState('idle'); // idle, scanning, receiving, completed, error
  const [progress, setProgress] = React.useState(0);
  const [receivedFile, setReceivedFile] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleStartScan = () => {
    // 开始扫描逻辑将在后续任务中实现
    console.log('开始扫描');
    setScanState('scanning');
  };

  const handleStopScan = () => {
    setScanState('idle');
    setProgress(0);
  };

  const handleSaveFile = () => {
    // 保存文件逻辑将在后续任务中实现
    console.log('保存文件');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：摄像头预览区域 */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>摄像头预览</CardTitle>
            <CardDescription>
              {scanState === 'idle' ? '点击开始扫描按钮启动摄像头' :
               scanState === 'scanning' ? '正在扫描二维码...' :
               scanState === 'receiving' ? '正在接收文件...' :
               scanState === 'completed' ? '接收完成' :
               '发生错误'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {scanState === 'idle' ? (
                <div className="text-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 mx-auto mb-4"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p>摄像头预览将在此显示</p>
                </div>
              ) : scanState === 'scanning' || scanState === 'receiving' ? (
                <div className="relative w-full h-full bg-black">
                  {/* 视频预览区域 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-sm">摄像头画面</div>
                  </div>
                  {/* 扫描框 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                    </div>
                  </div>
                </div>
              ) : scanState === 'completed' ? (
                <div className="text-center text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 mx-auto mb-4"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>接收完成</p>
                </div>
              ) : (
                <div className="text-center text-destructive">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 mx-auto mb-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>发生错误</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex gap-2">
              {scanState === 'idle' && (
                <Button onClick={handleStartScan} className="flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  开始扫描
                </Button>
              )}

              {(scanState === 'scanning' || scanState === 'receiving') && (
                <Button
                  onClick={handleStopScan}
                  variant="destructive"
                  className="flex-1"
                >
                  停止扫描
                </Button>
              )}

              {scanState === 'completed' && (
                <>
                  <Button
                    onClick={handleSaveFile}
                    className="flex-1"
                  >
                    保存文件
                  </Button>
                  <Button
                    onClick={() => {
                      setScanState('idle');
                      setReceivedFile(null);
                      setProgress(0);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    接收新文件
                  </Button>
                </>
              )}

              {scanState === 'error' && (
                <Button
                  onClick={() => {
                    setScanState('idle');
                    setErrorMessage('');
                  }}
                  className="flex-1"
                >
                  重试
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 右侧：接收状态和文件信息 */}
      <div className="space-y-6">
        {/* 接收状态卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>接收状态</CardTitle>
              {scanState !== 'idle' && (
                <Badge variant={
                  scanState === 'scanning' ? 'secondary' :
                  scanState === 'receiving' ? 'default' :
                  scanState === 'completed' ? 'default' :
                  'destructive'
                }>
                  {scanState === 'scanning' ? '扫描中' :
                   scanState === 'receiving' ? '接收中' :
                   scanState === 'completed' ? '已完成' :
                   '错误'}
                </Badge>
              )}
            </div>
            <CardDescription>文件接收进度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scanState === 'receiving' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>接收进度</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
                <div className="text-xs text-muted-foreground">
                  已接收 {Math.floor(progress / 10)} / 10 个分片
                </div>
              </div>
            )}

            {scanState === 'scanning' && (
              <Alert>
                <AlertTitle>提示</AlertTitle>
                <AlertDescription>
                  请将二维码对准摄像头，保持稳定。
                </AlertDescription>
              </Alert>
            )}

            {scanState === 'completed' && receivedFile && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{receivedFile.name}</span>
                  <Badge>{receivedFile.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  大小: {(receivedFile.size / 1024).toFixed(2)} KB
                </div>
                <div className="text-sm text-muted-foreground">
                  哈希: {receivedFile.hash?.substring(0, 16)}...
                </div>
              </div>
            )}

            {scanState === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>
                  {errorMessage || '接收文件时发生错误，请重试。'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 统计信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
            <CardDescription>扫描和接收统计</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">总扫描次数</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">有效扫描</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">无效扫描</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">已用时间</span>
              <span className="font-medium">00:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReceiverLayout;

