/**
 * 文件保存服务模块
 * 提供文件保存功能，通过 Electron IPC 与主进程通信
 */

/**
 * 保存结果类型
 */
export const SaveResult = {
  SUCCESS: 'success',
  CANCELLED: 'cancelled',
  ERROR: 'error',
  INVALID_DATA: 'invalid_data',
  INVALID_NAME: 'invalid_name'
};

/**
 * 文件保存服务类
 */
export class FileSaveService {
  constructor() {
    this.stats = {
      totalSaves: 0,
      successCount: 0,
      failureCount: 0,
      cancelledCount: 0
    };
  }
  
  /**
   * 保存文件
   * @param {Uint8Array} data - 文件数据
   * @param {string} defaultName - 默认文件名
   * @param {Object} options - 保存选项
   * @param {string} options.title - 对话框标题
   * @param {Array} options.filters - 文件类型过滤器
   * @returns {Promise<Object>} 保存结果
   */
  async saveFile(data, defaultName, options = {}) {
    this.stats.totalSaves++;
    
    try {
      // 1. 验证参数
      const validation = this._validateParameters(data, defaultName);
      if (!validation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: validation.result,
          message: validation.message
        };
      }
      
      // 2. 准备保存选项
      const saveOptions = {
        title: options.title || '保存文件',
        defaultPath: defaultName,
        filters: options.filters || this._getDefaultFilters(defaultName)
      };
      
      // 3. 显示保存对话框
      const dialogResult = await window.electronAPI.file.showSaveDialog(saveOptions);
      
      if (dialogResult.cancelled) {
        this.stats.cancelledCount++;
        return {
          success: false,
          result: SaveResult.CANCELLED,
          message: '用户取消保存'
        };
      }
      
      // 4. 保存文件
      const saveResult = await window.electronAPI.file.save(data, dialogResult.filePath);
      
      if (saveResult.success) {
        this.stats.successCount++;
        return {
          success: true,
          result: SaveResult.SUCCESS,
          message: '文件保存成功',
          filePath: dialogResult.filePath,
          size: data.length
        };
      } else {
        this.stats.failureCount++;
        return {
          success: false,
          result: SaveResult.ERROR,
          message: saveResult.error || '文件保存失败'
        };
      }
    } catch (error) {
      this.stats.failureCount++;
      return {
        success: false,
        result: SaveResult.ERROR,
        message: '保存过程发生错误: ' + error.message
      };
    }
  }
  
  /**
   * 快速保存（不显示对话框）
   * @param {Uint8Array} data - 文件数据
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 保存结果
   */
  async quickSave(data, filePath) {
    this.stats.totalSaves++;
    
    try {
      // 1. 验证参数
      const validation = this._validateParameters(data, filePath);
      if (!validation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: validation.result,
          message: validation.message
        };
      }
      
      // 2. 保存文件
      const saveResult = await window.electronAPI.file.save(data, filePath);
      
      if (saveResult.success) {
        this.stats.successCount++;
        return {
          success: true,
          result: SaveResult.SUCCESS,
          message: '文件保存成功',
          filePath: filePath,
          size: data.length
        };
      } else {
        this.stats.failureCount++;
        return {
          success: false,
          result: SaveResult.ERROR,
          message: saveResult.error || '文件保存失败'
        };
      }
    } catch (error) {
      this.stats.failureCount++;
      return {
        success: false,
        result: SaveResult.ERROR,
        message: '保存过程发生错误: ' + error.message
      };
    }
  }
  
  /**
   * 保存到默认位置
   * @param {Uint8Array} data - 文件数据
   * @param {string} fileName - 文件名
   * @param {string} defaultDir - 默认目录（可选）
   * @returns {Promise<Object>} 保存结果
   */
  async saveToDefault(data, fileName, defaultDir = null) {
    this.stats.totalSaves++;
    
    try {
      // 1. 验证参数
      const validation = this._validateParameters(data, fileName);
      if (!validation.valid) {
        this.stats.failureCount++;
        return {
          success: false,
          result: validation.result,
          message: validation.message
        };
      }
      
      // 2. 获取默认保存路径
      const defaultPath = await window.electronAPI.file.getDefaultPath(fileName, defaultDir);
      
      // 3. 保存文件
      const saveResult = await window.electronAPI.file.save(data, defaultPath);
      
      if (saveResult.success) {
        this.stats.successCount++;
        return {
          success: true,
          result: SaveResult.SUCCESS,
          message: '文件保存成功',
          filePath: defaultPath,
          size: data.length
        };
      } else {
        this.stats.failureCount++;
        return {
          success: false,
          result: SaveResult.ERROR,
          message: saveResult.error || '文件保存失败'
        };
      }
    } catch (error) {
      this.stats.failureCount++;
      return {
        success: false,
        result: SaveResult.ERROR,
        message: '保存过程发生错误: ' + error.message
      };
    }
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const successRate = this.stats.totalSaves > 0
      ? ((this.stats.successCount / this.stats.totalSaves) * 100).toFixed(2) + '%'
      : '0%';
    
    return {
      totalSaves: this.stats.totalSaves,
      successCount: this.stats.successCount,
      failureCount: this.stats.failureCount,
      cancelledCount: this.stats.cancelledCount,
      successRate: successRate
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalSaves: 0,
      successCount: 0,
      failureCount: 0,
      cancelledCount: 0
    };
  }
  
  /**
   * 验证参数
   * @private
   */
  _validateParameters(data, name) {
    // 验证数据
    if (!data || !(data instanceof Uint8Array)) {
      return {
        valid: false,
        result: SaveResult.INVALID_DATA,
        message: '无效的文件数据'
      };
    }
    
    if (data.length === 0) {
      return {
        valid: false,
        result: SaveResult.INVALID_DATA,
        message: '文件数据为空'
      };
    }
    
    // 验证文件名
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return {
        valid: false,
        result: SaveResult.INVALID_NAME,
        message: '无效的文件名'
      };
    }
    
    return {
      valid: true
    };
  }
  
  /**
   * 获取默认文件类型过滤器
   * @private
   */
  _getDefaultFilters(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    const filterMap = {
      'txt': [{ name: '文本文件', extensions: ['txt'] }],
      'pdf': [{ name: 'PDF 文件', extensions: ['pdf'] }],
      'doc': [{ name: 'Word 文档', extensions: ['doc', 'docx'] }],
      'docx': [{ name: 'Word 文档', extensions: ['doc', 'docx'] }],
      'xls': [{ name: 'Excel 表格', extensions: ['xls', 'xlsx'] }],
      'xlsx': [{ name: 'Excel 表格', extensions: ['xls', 'xlsx'] }],
      'ppt': [{ name: 'PowerPoint 演示文稿', extensions: ['ppt', 'pptx'] }],
      'pptx': [{ name: 'PowerPoint 演示文稿', extensions: ['ppt', 'pptx'] }],
      'jpg': [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      'jpeg': [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      'png': [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      'gif': [{ name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      'zip': [{ name: '压缩文件', extensions: ['zip', 'rar', '7z'] }],
      'rar': [{ name: '压缩文件', extensions: ['zip', 'rar', '7z'] }],
      '7z': [{ name: '压缩文件', extensions: ['zip', 'rar', '7z'] }]
    };
    
    const filters = filterMap[ext] || [{ name: '所有文件', extensions: ['*'] }];
    
    // 添加"所有文件"选项
    filters.push({ name: '所有文件', extensions: ['*'] });
    
    return filters;
  }
}

/**
 * 创建文件保存服务实例
 * @returns {FileSaveService} 文件保存服务实例
 */
export function createSaveService() {
  return new FileSaveService();
}

/**
 * 导出保存结果类型
 */
export { SaveResult as FileSaveResult };

