/**
 * 发送端布局组件
 * 提供文件发送界面的布局结构
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
  Separator
} from '../ui';

export function SenderLayout() {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [transferState, setTransferState] = React.useState('idle'); // idle, preparing, sending, paused, completed, error
  const [progress, setProgress] = React.useState(0);

  const handleSelectFile = () => {
    // 文件选择逻辑将在后续任务中实现
    console.log('选择文件');
  };

  const handleStartTransfer = () => {
    // 开始传输逻辑将在后续任务中实现
    console.log('开始传输');
    setTransferState('sending');
  };

  const handlePauseTransfer = () => {
    setTransferState('paused');
  };

  const handleResumeTransfer = () => {
    setTransferState('sending');
  };

  const handleCancelTransfer = () => {
    setTransferState('idle');
    setProgress(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：文件选择和信息 */}
      <div className="space-y-6">
        {/* 文件选择卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>选择文件</CardTitle>
            <CardDescription>选择要发送的文件（最大 1MB）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSelectFile}
              className="w-full"
              disabled={transferState === 'sending'}
            >
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              选择文件
            </Button>

            {selectedFile && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedFile.name}</span>
                  <Badge>{selectedFile.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  大小: {(selectedFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 传输控制卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>传输控制</CardTitle>
              {transferState !== 'idle' && (
                <Badge variant={
                  transferState === 'sending' ? 'default' :
                  transferState === 'paused' ? 'secondary' :
                  transferState === 'completed' ? 'default' :
                  'destructive'
                }>
                  {transferState === 'sending' ? '发送中' :
                   transferState === 'paused' ? '已暂停' :
                   transferState === 'completed' ? '已完成' :
                   transferState === 'preparing' ? '准备中' :
                   '错误'}
                </Badge>
              )}
            </div>
            <CardDescription>控制文件传输过程</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transferState !== 'idle' && transferState !== 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>传输进度</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              {transferState === 'idle' && (
                <Button
                  onClick={handleStartTransfer}
                  disabled={!selectedFile}
                  className="flex-1"
                >
                  开始传输
                </Button>
              )}

              {transferState === 'sending' && (
                <>
                  <Button
                    onClick={handlePauseTransfer}
                    variant="outline"
                    className="flex-1"
                  >
                    暂停
                  </Button>
                  <Button
                    onClick={handleCancelTransfer}
                    variant="destructive"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </>
              )}

              {transferState === 'paused' && (
                <>
                  <Button
                    onClick={handleResumeTransfer}
                    className="flex-1"
                  >
                    继续
                  </Button>
                  <Button
                    onClick={handleCancelTransfer}
                    variant="destructive"
                    className="flex-1"
                  >
                    取消
                  </Button>
                </>
              )}

              {transferState === 'completed' && (
                <Button
                  onClick={() => {
                    setTransferState('idle');
                    setSelectedFile(null);
                    setProgress(0);
                  }}
                  className="flex-1"
                >
                  发送新文件
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：二维码显示区域 */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>二维码显示</CardTitle>
            <CardDescription>
              {transferState === 'idle' ? '选择文件后开始传输' :
               transferState === 'sending' ? '请使用接收端扫描二维码' :
               transferState === 'paused' ? '传输已暂停' :
               transferState === 'completed' ? '传输完成' :
               '准备中...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              {transferState === 'idle' ? (
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
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <p>二维码将在此显示</p>
                </div>
              ) : transferState === 'sending' ? (
                <div className="text-center">
                  <div className="w-64 h-64 bg-white rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-sm text-gray-500">二维码播放中...</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    帧 {Math.floor(progress / 10)} / 10
                  </p>
                </div>
              ) : transferState === 'completed' ? (
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
                  <p>传输完成</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>准备中...</p>
                </div>
              )}
            </div>
          </CardContent>
          {transferState === 'sending' && (
            <CardFooter>
              <div className="w-full text-sm text-muted-foreground text-center">
                传输速度: 10 帧/秒
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SenderLayout;

