/**
 * Electron API 类型定义
 * 用于在渲染进程中提供类型提示
 */

// ==================== 通用响应类型 ====================
interface BaseResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// ==================== 文件操作相关类型 ====================
interface FileSelectResponse extends BaseResponse {
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  canceled?: boolean;
}

interface FileReadResponse extends BaseResponse {
  data?: ArrayBuffer;
  size?: number;
}

interface FileSaveDialogResponse extends BaseResponse {
  filePath?: string;
  canceled?: boolean;
}

interface FileSaveResponse extends BaseResponse {
  filePath?: string;
  size?: number;
}

interface FileInfo {
  size: number;
  created: Date;
  modified: Date;
  isFile: boolean;
  isDirectory: boolean;
}

interface FileInfoResponse extends BaseResponse {
  info?: FileInfo;
}

interface FileSaveOptions {
  filePath: string;
  data: ArrayBuffer;
}

// ==================== 传输相关类型 ====================
interface TransferProgress {
  current: number;
  total: number;
  percentage: number;
  fileName?: string;
}

interface TransferCompleteData {
  fileName: string;
  fileSize: number;
  duration: number;
}

interface TransferErrorData {
  error: string;
  message: string;
}

// ==================== 系统相关类型 ====================
interface SystemVersionResponse extends BaseResponse {
  version?: string;
  name?: string;
  electron?: string;
  chrome?: string;
  node?: string;
}

interface SystemPathResponse extends BaseResponse {
  path?: string;
}

// ==================== 配置相关类型 ====================
interface ConfigGetResponse extends BaseResponse {
  value?: any;
}

interface ConfigGetAllResponse extends BaseResponse {
  config?: AppConfig;
}

interface ConfigRecentFilesResponse extends BaseResponse {
  files?: string[];
}

interface AppConfig {
  window: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  transfer: {
    chunkSize: number;
    maxFileSize: number;
    compressionEnabled: boolean;
    qrCodeSize: number;
    displayDuration: number;
  };
  app: {
    autoCheckUpdate: boolean;
    language: string;
    theme: string;
  };
  recentFiles: string[];
}

// ==================== Electron API 接口定义 ====================
interface ElectronAPI {
  // 版本信息
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };

  // 文件操作 API
  file: {
    select: () => Promise<FileSelectResponse>;
    read: (filePath: string) => Promise<FileReadResponse>;
    saveDialog: (defaultFileName?: string) => Promise<FileSaveDialogResponse>;
    save: (options: FileSaveOptions) => Promise<FileSaveResponse>;
    info: (filePath: string) => Promise<FileInfoResponse>;
  };

  // 传输相关 API
  transfer: {
    sendProgress: (progress: TransferProgress) => Promise<BaseResponse>;
    receiveProgress: (progress: TransferProgress) => Promise<BaseResponse>;
    complete: (data: TransferCompleteData) => Promise<BaseResponse>;
    error: (errorData: TransferErrorData) => Promise<BaseResponse>;
    cancel: () => Promise<BaseResponse>;
    onProgressUpdate: (callback: (data: TransferProgress) => void) => () => void;
    onComplete: (callback: (data: TransferCompleteData) => void) => () => void;
    onError: (callback: (data: TransferErrorData) => void) => () => void;
    onCancelled: (callback: () => void) => () => void;
  };

  // 系统相关 API
  system: {
    getVersion: () => Promise<SystemVersionResponse>;
    getPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'exe' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos') => Promise<SystemPathResponse>;
    showItemInFolder: (fullPath: string) => Promise<BaseResponse>;
    openExternal: (url: string) => Promise<BaseResponse>;
  };

  // 配置管理 API
  config: {
    get: (key: string) => Promise<ConfigGetResponse>;
    set: (key: string, value: any) => Promise<BaseResponse>;
    getAll: () => Promise<ConfigGetAllResponse>;
    reset: () => Promise<BaseResponse>;
    addRecentFile: (filePath: string) => Promise<BaseResponse>;
    getRecentFiles: () => Promise<ConfigRecentFilesResponse>;
    clearRecentFiles: () => Promise<BaseResponse>;
  };
}

// ==================== 全局类型声明 ====================
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

