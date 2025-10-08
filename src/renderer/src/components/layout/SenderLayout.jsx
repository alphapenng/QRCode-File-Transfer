/**
 * 发送端布局组件
 * 提供文件发送界面的布局结构
 * 集成文件选择和发送端 IPC 服务
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
  Separator,
  Alert,
  AlertTitle,
  AlertDescription
} from '../ui';
import { SenderService } from '../../services/senderIPCService';

export function SenderLayout() {
  // 状态管理
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [transferState, setTransferState] = React.useState('idle'); // idle, preparing, sending, paused, completed, error
  const [progress, setProgress] = React.useState(0);
  const [currentChunk, setCurrentChunk] = React.useState(0);
  const [totalChunks, setTotalChunks] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [qrcodeDataUrl, setQrcodeDataUrl] = React.useState('');

  // 服务实例
  const senderServiceRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // 初始化发送端服务
  React.useEffect(() => {
    senderServiceRef.current = new SenderService();

    // 设置事件监听
    senderServiceRef.current.on('stateChange', (state) => {
      console.log('状态变化:', state);
      setTransferState(state);
    });

    senderServiceRef.current.on('progress', (progressData) => {
      console.log('进度更新:', progressData);
      setProgress(progressData.percentage);
      setCurrentChunk(progressData.currentChunk);
      setTotalChunks(progressData.totalChunks);
    });

    senderServiceRef.current.on('qrcode', (dataUrl) => {
      console.log('二维码更新');
      setQrcodeDataUrl(dataUrl);
    });

    senderServiceRef.current.on('complete', () => {
      console.log('传输完成');
      setTransferState('completed');
    });

    senderServiceRef.current.on('error', (error) => {
      console.error('传输错误:', error);
      setTransferState('error');
      setErrorMessage(error.message || '传输过程中发生错误');
    });

    return () => {
      // 清理
      if (senderServiceRef.current) {
        senderServiceRef.current.cancel();
      }
    };
  }, []);

  // 文件选择处理
  const handleSelectFile = async () => {
    try {
      const result = await window.electronAPI.file.select({
        filters: [
          { name: '所有文件', extensions: ['*'] },
          { name: '文本文件', extensions: ['txt', 'md', 'json'] },
          { name: 'Office 文档', extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] },
          { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
          { name: 'PDF', extensions: ['pdf'] }
        ]
      });

      if (result.success && result.file) {
        setSelectedFile(result.file);
        setErrorMessage('');
        console.log('文件已选择:', result.file);
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      setErrorMessage('选择文件失败: ' + error.message);
    }
  };

  // 开始传输
  const handleStartTransfer = async () => {
    if (!selectedFile || !canvasRef.current) {
      setErrorMessage('请先选择文件');
      return;
    }

    try {
      setTransferState('preparing');
      setErrorMessage('');

      await senderServiceRef.current.send(selectedFile.path, canvasRef.current);
    } catch (error) {
      console.error('开始传输失败:', error);
      setTransferState('error');
      setErrorMessage('开始传输失败: ' + error.message);
    }
  };

  // 暂停传输
  const handlePauseTransfer = () => {
    try {
      senderServiceRef.current.pause();
    } catch (error) {
      console.error('暂停传输失败:', error);
      setErrorMessage('暂停传输失败: ' + error.message);
    }
  };

  // 恢复传输
  const handleResumeTransfer = () => {
    try {
      senderServiceRef.current.resume();
    } catch (error) {
      console.error('恢复传输失败:', error);
      setErrorMessage('恢复传输失败: ' + error.message);
    }
  };

  // 取消传输
  const handleCancelTransfer = () => {
    try {
      senderServiceRef.current.cancel();
      setTransferState('idle');
      setProgress(0);
      setCurrentChunk(0);
      setTotalChunks(0);
      setQrcodeDataUrl('');
      setErrorMessage('');
    } catch (error) {
      console.error('取消传输失败:', error);
      setErrorMessage('取消传输失败: ' + error.message);
    }
  };

  // 重置（传输完成后）
  const handleReset = () => {
    setTransferState('idle');
    setSelectedFile(null);
    setProgress(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    setQrcodeDataUrl('');
    setErrorMessage('');
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
              disabled={transferState === 'sending' || transferState === 'preparing'}
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
                  <span className="font-medium truncate">{selectedFile.name}</span>
                  <Badge variant="secondary">{selectedFile.ext || 'FILE'}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  大小: {(selectedFile.size / 1024).toFixed(2)} KB
                </div>
                {selectedFile.path && (
                  <div className="text-xs text-muted-foreground truncate">
                    路径: {selectedFile.path}
                  </div>
                )}
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
                  transferState === 'preparing' ? 'secondary' :
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
            {(transferState === 'preparing' || transferState === 'sending' || transferState === 'paused') && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>传输进度</span>
                  <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} />
                {totalChunks > 0 && (
                  <div className="text-xs text-muted-foreground">
                    已发送 {currentChunk} / {totalChunks} 个分片
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {transferState === 'idle' && (
                <Button
                  onClick={handleStartTransfer}
                  disabled={!selectedFile}
                  className="flex-1"
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
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  开始传输
                </Button>
              )}

              {transferState === 'preparing' && (
                <Button disabled className="flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2 animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  准备中...
                </Button>
              )}

              {transferState === 'sending' && (
                <>
                  <Button
                    onClick={handlePauseTransfer}
                    variant="outline"
                    className="flex-1"
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
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    暂停
                  </Button>
                  <Button
                    onClick={handleCancelTransfer}
                    variant="destructive"
                    className="flex-1"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
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
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    继续
                  </Button>
                  <Button
                    onClick={handleCancelTransfer}
                    variant="destructive"
                    className="flex-1"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    取消
                  </Button>
                </>
              )}

              {transferState === 'completed' && (
                <Button
                  onClick={handleReset}
                  className="flex-1"
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
                  发送新文件
                </Button>
              )}

              {transferState === 'error' && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
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
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  重试
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
               transferState === 'preparing' ? '正在准备文件...' :
               transferState === 'sending' ? '请使用接收端扫描二维码' :
               transferState === 'paused' ? '传输已暂停' :
               transferState === 'completed' ? '传输完成' :
               '发生错误'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 隐藏的 canvas 用于二维码生成 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
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
              ) : transferState === 'preparing' ? (
                <div className="text-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 mx-auto mb-4 animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <p>正在准备文件...</p>
                </div>
              ) : transferState === 'sending' || transferState === 'paused' ? (
                <div className="text-center w-full">
                  {qrcodeDataUrl ? (
                    <div className="relative">
                      <img
                        src={qrcodeDataUrl}
                        alt="QR Code"
                        className="w-full h-auto max-w-md mx-auto"
                      />
                      {transferState === 'paused' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-lg font-semibold">已暂停</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-white rounded-lg mx-auto flex items-center justify-center">
                      <div className="text-sm text-gray-500">等待二维码...</div>
                    </div>
                  )}
                  {totalChunks > 0 && (
                    <p className="text-sm text-muted-foreground mt-4">
                      分片 {currentChunk} / {totalChunks}
                    </p>
                  )}
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
                  <p className="font-semibold">传输完成</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    已发送 {totalChunks} 个分片
                  </p>
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
                  <p className="font-semibold">发生错误</p>
                  {errorMessage && (
                    <p className="text-sm mt-2">{errorMessage}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          {transferState === 'sending' && (
            <CardFooter>
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>传输速度</span>
                  <span>10 帧/秒</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>预计剩余时间</span>
                  <span>
                    {totalChunks > 0 && currentChunk > 0
                      ? `${Math.ceil((totalChunks - currentChunk) / 10)} 秒`
                      : '--'}
                  </span>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SenderLayout;

