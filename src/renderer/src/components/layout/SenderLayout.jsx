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
import { SenderService, TransferState } from '../../services/senderIPCService';

export function SenderLayout() {
  // 状态管理
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [transferState, setTransferState] = React.useState(TransferState.IDLE);
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
    senderServiceRef.current.on('stateChange', (data) => {
      console.log('状态变化:', data);
      setTransferState(data.state);
    });

    senderServiceRef.current.on('progress', (progressData) => {
      console.log('进度更新:', progressData);
      if (progressData.progress !== undefined) {
        setProgress(progressData.progress);
      }
      if (progressData.current !== undefined) {
        setCurrentChunk(progressData.current);
      }
      if (progressData.total !== undefined) {
        setTotalChunks(progressData.total);
      }
    });

    senderServiceRef.current.on('qrcode', (data) => {
      console.log('二维码更新:', data);
      setQrcodeDataUrl(data.qrCode);
    });

    senderServiceRef.current.on('complete', (data) => {
      console.log('传输完成:', data);
      // 状态由服务自动设置为 COMPLETED
    });

    senderServiceRef.current.on('error', (errorData) => {
      console.error('传输错误:', errorData);
      // 状态由服务自动设置为 ERROR
      setErrorMessage(errorData.message || '传输过程中发生错误');
    });

    return () => {
      // 清理
      if (senderServiceRef.current) {
        senderServiceRef.current.cancelTransfer();
      }
    };
  }, []);

  // 文件选择处理
  const handleSelectFile = async () => {
    try {
      // 使用 SenderService 的 selectFile 方法
      const result = await senderServiceRef.current.selectFile({
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
      } else if (result.error) {
        setErrorMessage(result.message || '选择文件失败');
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      setErrorMessage('选择文件失败: ' + error.message);
    }
  };

  // 开始传输
  const handleStartTransfer = async () => {
    if (!selectedFile) {
      setErrorMessage('请先选择文件');
      return;
    }

    try {
      setTransferState('preparing');
      setErrorMessage('');

      // 准备传输
      const prepareResult = await senderServiceRef.current.prepareTransfer();

      if (!prepareResult.success) {
        throw new Error(prepareResult.message || '准备传输失败');
      }

      // 开始传输
      const startResult = senderServiceRef.current.startTransfer();

      if (!startResult.success) {
        throw new Error(startResult.message || '开始传输失败');
      }
    } catch (error) {
      console.error('开始传输失败:', error);
      // 状态由服务自动设置为 ERROR
      setErrorMessage('开始传输失败: ' + error.message);
    }
  };

  // 暂停传输
  const handlePauseTransfer = () => {
    try {
      const result = senderServiceRef.current.pauseTransfer();
      if (!result.success) {
        throw new Error(result.message || '暂停传输失败');
      }
    } catch (error) {
      console.error('暂停传输失败:', error);
      setErrorMessage('暂停传输失败: ' + error.message);
    }
  };

  // 恢复传输
  const handleResumeTransfer = () => {
    try {
      const result = senderServiceRef.current.resumeTransfer();
      if (!result.success) {
        throw new Error(result.message || '恢复传输失败');
      }
    } catch (error) {
      console.error('恢复传输失败:', error);
      setErrorMessage('恢复传输失败: ' + error.message);
    }
  };

  // 取消传输
  const handleCancelTransfer = () => {
    try {
      const result = senderServiceRef.current.cancelTransfer();
      if (!result.success) {
        throw new Error(result.message || '取消传输失败');
      }
      // 状态由服务自动设置为 CANCELLED
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

  // 重置（传输完成后或取消后）
  const handleReset = () => {
    setTransferState(TransferState.IDLE);
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
              disabled={
                transferState === TransferState.SELECTING ||
                transferState === TransferState.PREPROCESSING ||
                transferState === TransferState.CHUNKING ||
                transferState === TransferState.GENERATING ||
                transferState === TransferState.PLAYING ||
                transferState === TransferState.PAUSED
              }
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
              {transferState !== TransferState.IDLE && (
                <Badge variant={
                  transferState === TransferState.PLAYING ? 'default' :
                  transferState === TransferState.PAUSED ? 'secondary' :
                  transferState === TransferState.COMPLETED ? 'default' :
                  transferState === TransferState.SELECTING ||
                  transferState === TransferState.PREPROCESSING ||
                  transferState === TransferState.CHUNKING ||
                  transferState === TransferState.GENERATING ? 'secondary' :
                  'destructive'
                }>
                  {transferState}
                </Badge>
              )}
            </div>
            <CardDescription>控制文件传输过程</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(transferState === TransferState.PREPROCESSING ||
              transferState === TransferState.CHUNKING ||
              transferState === TransferState.GENERATING ||
              transferState === TransferState.PLAYING ||
              transferState === TransferState.PAUSED) && (
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
              {transferState === TransferState.IDLE && (
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

              {(transferState === TransferState.SELECTING ||
                transferState === TransferState.PREPROCESSING ||
                transferState === TransferState.CHUNKING ||
                transferState === TransferState.GENERATING) && (
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
                  {transferState}...
                </Button>
              )}

              {transferState === TransferState.PLAYING && (
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

              {transferState === TransferState.PAUSED && (
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

              {(transferState === TransferState.COMPLETED ||
                transferState === TransferState.CANCELLED) && (
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

              {transferState === TransferState.ERROR && (
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
              {transferState === TransferState.IDLE ? '选择文件后开始传输' :
               transferState === TransferState.SELECTING ? '正在选择文件...' :
               transferState === TransferState.PREPROCESSING ? '正在预处理文件...' :
               transferState === TransferState.CHUNKING ? '正在分片...' :
               transferState === TransferState.GENERATING ? '正在生成二维码...' :
               transferState === TransferState.PLAYING ? '请使用接收端扫描二维码' :
               transferState === TransferState.PAUSED ? '传输已暂停' :
               transferState === TransferState.COMPLETED ? '传输完成' :
               transferState === TransferState.CANCELLED ? '传输已取消' :
               '发生错误'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 隐藏的 canvas 用于二维码生成 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {transferState === TransferState.IDLE ? (
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
              ) : (transferState === TransferState.SELECTING ||
                     transferState === TransferState.PREPROCESSING ||
                     transferState === TransferState.CHUNKING ||
                     transferState === TransferState.GENERATING) ? (
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
                  <p>{transferState}...</p>
                </div>
              ) : (transferState === TransferState.PLAYING ||
                     transferState === TransferState.PAUSED) ? (
                <div className="text-center w-full">
                  {qrcodeDataUrl ? (
                    <div className="relative">
                      <img
                        src={qrcodeDataUrl}
                        alt="QR Code"
                        className="w-full h-auto max-w-md mx-auto"
                      />
                      {transferState === TransferState.PAUSED && (
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
              ) : transferState === TransferState.COMPLETED ? (
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
              ) : transferState === TransferState.CANCELLED ? (
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className="font-semibold">传输已取消</p>
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
          {transferState === TransferState.PLAYING && (
            <CardFooter>
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>传输速度</span>
                  <span>5 帧/秒</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>预计剩余时间</span>
                  <span>
                    {totalChunks > 0 && currentChunk > 0
                      ? `${Math.ceil((totalChunks - currentChunk) / 5)} 秒`
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

