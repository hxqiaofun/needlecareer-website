// app/lib/file-extractors/doc-extractor.ts

import {
  ExtractionResult,
  ExtractionConfig,
  ExtractionStatus,
  ExtractionErrorCode,
  FileExtractor,
  SupportedFileType,
  ProgressCallback,
  EXTRACTION_STEPS,
  DEFAULT_EXTRACTION_CONFIG
} from '../types/extraction';

/**
 * Word 文档文本提取器
 * 使用动态导入的 mammoth.js 提取 DOC 和 DOCX 文件的文本内容
 */
export class WordDocExtractor implements FileExtractor {
  private config: ExtractionConfig;

  constructor(config?: Partial<ExtractionConfig>) {
    this.config = {
      ...DEFAULT_EXTRACTION_CONFIG,
      ...config
    };
  }

  /**
   * 从 Word 文档提取文本内容
   */
  async extractText(
    file: File,
    config?: Partial<ExtractionConfig>
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...config };

    // 检测文档类型，可能返回 null
    const detectedFileType = this.detectDocumentType(file);

    // 【修复点】
    // 确定用于结果对象的 fileType。
    // 如果 detectedFileType 为 null，则提供一个合理的默认值。
    // 在这个 Word 文档提取器中，如果文件通过了 validateFile 验证，
    // 即使 detectDocumentType 返回 null，它也应该是一个 Word 文档。
    // 因此，我们可以根据文件扩展名尝试推断，否则默认为 'docx'。
    let fileTypeForExtractionResult: SupportedFileType;

    if (detectedFileType) {
      fileTypeForExtractionResult = detectedFileType;
    } else {
      // 如果 detectDocumentType 无法确定，则根据文件扩展名尝试推断
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.doc')) {
        fileTypeForExtractionResult = 'doc';
      } else if (fileName.endsWith('.docx')) {
        fileTypeForExtractionResult = 'docx';
      } else {
        // 如果文件扩展名也无法推断，则默认为 'docx'。
        // validateFile 会在后续步骤中捕获非 Word 文档。
        fileTypeForExtractionResult = 'docx';
      }
    }

    // 初始化结果对象
    const result: ExtractionResult = {
      success: false,
      fileType: fileTypeForExtractionResult, // 确保这里总是 SupportedFileType
      extractedText: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        wordCount: 0,
        characterCount: 0,
        extractionTime: 0,
        extractedAt: new Date()
      },
      warnings: []
    };

    try {
      // 验证文件。此步骤也会捕获不属于 Word 文档的文件。
      await this.validateFile(file);

      // 提取文本内容
      const extractedText = await this.extractDocumentText(file);

      // 处理提取的文本
      const processedText = this.processExtractedText(extractedText, mergedConfig);

      // 验证文本长度
      if (processedText.length < mergedConfig.textProcessing.minTextLength) {
        throw new Error(`Extracted text too short: ${processedText.length} characters`);
      }

      // 计算统计信息
      const wordCount = this.countWords(processedText);
      const characterCount = processedText.length;

      // 填充成功结果
      result.success = true;
      result.extractedText = processedText;
      result.metadata = {
        ...result.metadata,
        wordCount,
        characterCount,
        extractionTime: Date.now() - startTime
      };

      return result;

    } catch (error: unknown) { // 使用 unknown 类型来更好地处理错误
      // 处理错误
      result.error = {
        code: this.mapErrorToCode(error),
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      };

      result.metadata.extractionTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * 检测文档类型
   * 返回 SupportedFileType 或 null（如果无法明确检测）
   */
  private detectDocumentType(file: File): SupportedFileType | null {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // 基于 MIME 类型检测
    if (mimeType.includes('wordprocessingml')) {
      return 'docx';
    }
    if (mimeType.includes('msword') || mimeType.includes('vnd.ms-word')) { // 添加备选 MIME 类型
      return 'doc';
    }

    // 基于文件扩展名检测
    if (fileName.endsWith('.docx')) {
      return 'docx';
    }
    if (fileName.endsWith('.doc')) {
      return 'doc';
    }

    // 无法明确检测
    return null;
  }

  /**
   * 提取文档文本内容
   */
  private async extractDocumentText(file: File): Promise<string> {
    // 读取文件为 ArrayBuffer
    const arrayBuffer = await this.readFileAsArrayBuffer(file);

    // 始终尝试使用 mammoth 提取
    return await this.extractWithMammoth(arrayBuffer);
  }

  /**
   * 使用 mammoth 提取文本
   */
  private async extractWithMammoth(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // 动态导入 mammoth
      const mammothModule = await import('mammoth');
      const mammoth = mammothModule.default || mammothModule;

      // 使用 mammoth 提取原始文本
      // mammoth.extractRawText 接受一个 { arrayBuffer: ArrayBuffer } 对象
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });

      if (result.value && result.value.length > 0) {
        return result.value;
      } else {
        throw new Error('Mammoth did not extract any text content.');
      }

    } catch (error) {
      // 捕获 mammoth 内部可能抛出的错误，并转换为更通用的错误信息
      throw new Error(`Mammoth extraction failed: ${error instanceof Error ? error.message : 'Unknown error during extraction'}`);
    }
  }

  /**
   * 读取文件为 ArrayBuffer
   */
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer or result is not ArrayBuffer type'));
        }
      };

      reader.onerror = () => reject(new Error('FileReader error occurred while reading the file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 处理提取的文本
   */
  private processExtractedText(text: string, config: ExtractionConfig): string {
    let processedText = text;

    if (config.textProcessing.removeExtraWhitespace) {
      // 移除多余空白字符
      processedText = processedText.replace(/\s+/g, ' ');
      // 规范化换行
      processedText = processedText.replace(/\r\n/g, '\n');
      processedText = processedText.replace(/\r/g, '\n');
      // 移除过多的空行
      processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    if (config.textProcessing.normalizeEncoding) {
      // 规范化编码 (NFC 是 Unicode 规范化的一种形式)
      processedText = processedText.normalize('NFC');
      // 移除常见的控制字符
      processedText = processedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }

    // 去除首尾空白
    processedText = processedText.trim();

    return processedText;
  }

  /**
   * 计算单词数量
   */
  private countWords(text: string): number {
    // 匹配非空白字符序列作为单词
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * 将错误映射到错误代码
   */
  private mapErrorToCode(error: unknown): ExtractionErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('corrupted') || message.includes('invalid') || message.includes('zip') || message.includes('ole')) {
        return ExtractionErrorCode.FILE_CORRUPTED;
      }
      if (message.includes('too large') || message.includes('size')) {
        return ExtractionErrorCode.FILE_TOO_LARGE;
      }
      if (message.includes('too short') || message.includes('length')) {
        return ExtractionErrorCode.TEXT_TOO_SHORT;
      }
      if (message.includes('parsing') || message.includes('parse') || message.includes('mammoth')) { // 包含 mammoth 错误
        return ExtractionErrorCode.PARSING_FAILED;
      }
      if (message.includes('encoding') || message.includes('decode')) {
        return ExtractionErrorCode.ENCODING_ERROR;
      }
      if (message.includes('format') || message.includes('unsupported')) {
        return ExtractionErrorCode.UNSUPPORTED_FORMAT;
      }
    }

    return ExtractionErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 验证文件
   */
  async validateFile(file: File): Promise<boolean> {
    // 检查文件类型
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.ms-word' // .doc 备选
    ];

    const validExtensions = ['.doc', '.docx'];
    const fileName = file.name.toLowerCase();

    const hasValidMimeType = validMimeTypes.includes(file.type.toLowerCase());
    const hasValidExtension = validExtensions.some(ext =>
      fileName.endsWith(ext)
    );

    if (!hasValidMimeType && !hasValidExtension) {
      throw new Error(`Invalid file type. Expected Word document (.doc or .docx), but got type: ${file.type} and extension: ${fileName.substring(fileName.lastIndexOf('.')) || 'none'}`);
    }

    // 检查文件大小（最大 100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    // 检查文件是否为空
    if (file.size === 0) {
      throw new Error('File is empty');
    }

    // 检查最小文件大小（Word文档通常至少几KB，防止处理非常小的无效文件）
    if (file.size < 1024) { // 1KB
      throw new Error('File appears to be too small to be a valid Word document');
    }

    return true;
  }

  /**
   * 获取支持的格式
   */
  getSupportedFormats(): SupportedFileType[] {
    return ['doc', 'docx'];
  }
}

/**
 * 创建 Word 文档提取器实例
 */
export function createWordExtractor(config?: Partial<ExtractionConfig>): WordDocExtractor {
  return new WordDocExtractor(config);
}

/**
 * 快速 Word 文档文本提取函数
 */
export async function extractWordText(
  file: File,
  config?: Partial<ExtractionConfig>
): Promise<ExtractionResult> {
  const extractor = createWordExtractor(config);
  // 不再模拟进度，因为 mammoth.js 是一次性操作，无法提供细粒度进度
  return extractor.extractText(file, config);
}