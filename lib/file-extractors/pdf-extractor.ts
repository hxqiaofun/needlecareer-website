// app/lib/file-extractors/pdf-extractor.ts

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
 * PDF 文本提取器
 * 使用 pdf-parse 库在浏览器端提取 PDF 文本内容
 */
export class PDFExtractor implements FileExtractor {
  private config: ExtractionConfig;

  constructor(config?: Partial<ExtractionConfig>) {
    this.config = {
      ...DEFAULT_EXTRACTION_CONFIG,
      ...config
    };
  }

  /**
   * 从 PDF 文件提取文本内容
   */
  async extractText(
    file: File, 
    config?: Partial<ExtractionConfig>
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...config };
    
    // 初始化结果对象
    const result: ExtractionResult = {
      success: false,
      fileType: 'pdf',
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
      // 验证文件
      await this.validateFile(file);

      // 读取文件内容
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // 使用 PDF.js 解析 PDF
      // 这里传递的 arrayBuffer 是原始的，如果 PDF.js 失败，需要确保 fallbackPDFExtraction 收到未分离的 buffer
      const pdfText = await this.parsePDFContent(arrayBuffer);
      
      // 处理提取的文本
      const processedText = this.processExtractedText(pdfText, mergedConfig);
      
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

    } catch (error) {
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
   * 读取文件为 ArrayBuffer
   */
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 使用浏览器的 PDF.js 解析 PDF 内容
   * 注意：这需要在实际环境中引入 pdfjs-dist 库
   */
  private async parsePDFContent(originalArrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // 创建一个副本用于 PDF.js 处理，以避免原始 ArrayBuffer 被意外分离 (detached)
      const pdfjsProcessingBuffer = originalArrayBuffer.slice(0); // <-- 新增此行
      
      // 这里使用动态导入 PDF.js
      // 在实际使用时需要安装: npm install pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // 设置 worker（生产环境中需要正确配置）
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      // 加载 PDF 文档
      const pdf = await pdfjsLib.getDocument({
        data: pdfjsProcessingBuffer, // <-- 这里使用副本
        verbosity: 0 // 减少控制台输出
      }).promise;

      let fullText = '';
      const numPages = pdf.numPages;

      // 逐页提取文本
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // 组合页面文本
        const pageText = textContent.items
          .map((item: any) => {
            // 检查 item 是否有 str 属性
            if (item && typeof item === 'object' && 'str' in item) {
              return item.str;
            }
            return '';
          })
          .join(' ');
        
        fullText += pageText + '\n\n';
      }

      return fullText;

    } catch (error) {
      // 如果 PDF.js 不可用或失败，使用降级方案
      // 此时 originalArrayBuffer 仍然可用且未被分离
      console.warn('PDF.js not available or failed, using fallback method. Error:', error);
      return this.fallbackPDFExtraction(originalArrayBuffer); // <-- 这里使用原始的 ArrayBuffer
    }
  }

  /**
   * 降级的 PDF 文本提取方案
   * 当 PDF.js 不可用时使用
   */
  private async fallbackPDFExtraction(arrayBuffer: ArrayBuffer): Promise<string> {
    // 尝试多种编码方式
    const uint8Array = new Uint8Array(arrayBuffer); // 此时 arrayBuffer 应该不再是分离状态
    
    // 查找文本流
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    // ... (后续代码不变) ...
    // 查找文本对象
    const textObjects = [];
    
    // 匹配 PDF 文本对象的正则表达式
    const streamPattern = /stream\s*\n([\s\S]*?)\nendstream/g;
    const textPattern = /\(([^)]+)\)/g;
    const bracketTextPattern = /\[([^\]]+)\]/g;
    
    let match;
    
    // 提取所有文本流
    while ((match = streamPattern.exec(pdfString)) !== null) {
      const streamContent = match[1];
      
      // 在流中查找文本
      let textMatch;
      while ((textMatch = textPattern.exec(streamContent)) !== null) {
        const text = textMatch[1];
        if (text.length > 1 && /[a-zA-Z0-9\s]/.test(text)) {
          textObjects.push(text);
        }
      }
      
      // 查找方括号中的文本
      while ((textMatch = bracketTextPattern.exec(streamContent)) !== null) {
        const bracketContent = textMatch[1];
        const innerTextMatches = bracketContent.match(/\(([^)]+)\)/g) || [];
        innerTextMatches.forEach(innerMatch => {
          const text = innerMatch.slice(1, -1);
          if (text.length > 1 && /[a-zA-Z0-9\s]/.test(text)) {
            textObjects.push(text);
          }
        });
      }
    }
    
    // 直接在整个文档中搜索文本
    let directTextMatch;
    while ((directTextMatch = textPattern.exec(pdfString)) !== null) {
      const text = directTextMatch[1];
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        textObjects.push(text);
      }
    }
    
    if (textObjects.length === 0) {
      throw new Error('Could not extract meaningful text from PDF using fallback method');
    }
    
    // 清理和去重
    const uniqueTexts = [...new Set(textObjects)]
      .filter(text => text.trim().length > 0)
      .map(text => text.replace(/\\[nrt]/g, ' ')) // 处理转义字符
      .map(text => text.replace(/\s+/g, ' ').trim()) // 规范化空格
      .filter(text => text.length > 1);
    
    const extractedText = uniqueTexts.join(' ');
    
    if (extractedText.length < 50) {
      throw new Error('Extracted text too short, PDF might be image-based or encrypted');
    }
    
    return extractedText;
  }

  /**
   * 处理提取的文本
   */
  private processExtractedText(text: string, config: ExtractionConfig): string {
    let processedText = text;

    if (config.textProcessing.removeExtraWhitespace) {
      // 移除多余空白字符
      processedText = processedText.replace(/\s+/g, ' ');
      processedText = processedText.replace(/\n\s*\n/g, '\n\n');
    }

    if (config.textProcessing.normalizeEncoding) {
      // 规范化编码
      processedText = processedText.normalize('NFC');
    }

    // 去除首尾空白
    processedText = processedText.trim();

    return processedText;
  }

  /**
   * 计算单词数量
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * 将错误映射到错误代码
   */
  private mapErrorToCode(error: unknown): ExtractionErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('corrupted') || message.includes('invalid')) {
        return ExtractionErrorCode.FILE_CORRUPTED;
      }
      if (message.includes('too large') || message.includes('size')) {
        return ExtractionErrorCode.FILE_TOO_LARGE;
      }
      if (message.includes('too short') || message.includes('length')) {
        return ExtractionErrorCode.TEXT_TOO_SHORT;
      }
      if (message.includes('parsing') || message.includes('parse')) {
        return ExtractionErrorCode.PARSING_FAILED;
      }
      if (message.includes('encoding') || message.includes('decode')) {
        return ExtractionErrorCode.ENCODING_ERROR;
      }
      if (message.includes('detached arraybuffer')) { // Added specific error code for clarity
        return ExtractionErrorCode.PROCESSING_ERROR; // Or a more specific code like BUFFER_DETACHED
      }
    }
    
    return ExtractionErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 验证文件
   */
  async validateFile(file: File): Promise<boolean> {
    // 检查文件类型
    if (file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Expected PDF file.');
    }

    // 检查文件大小（最大 50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    // 检查文件是否为空
    if (file.size === 0) {
      throw new Error('File is empty');
    }

    return true;
  }

  /**
   * 获取支持的格式
   */
  getSupportedFormats(): SupportedFileType[] {
    return ['pdf'];
  }
}

/**
 * 创建 PDF 提取器实例
 */
export function createPDFExtractor(config?: Partial<ExtractionConfig>): PDFExtractor {
  return new PDFExtractor(config);
}

/**
 * 快速 PDF 文本提取函数
 */
export async function extractPDFText(
  file: File,
  onProgress?: ProgressCallback,
  config?: Partial<ExtractionConfig>
): Promise<ExtractionResult> {
  const extractor = createPDFExtractor(config);
  
  // 简单的进度反馈，不使用模拟进度
  if (onProgress) {
    onProgress({
      status: ExtractionStatus.EXTRACTING,
      progress: 50,
      currentStep: 'Extracting PDF content...',
      totalSteps: 1,
      currentStepIndex: 0
    });
  }

  const result = await extractor.extractText(file, config);

  if (onProgress) {
    onProgress({
      status: result.success ? ExtractionStatus.SUCCESS : ExtractionStatus.ERROR,
      progress: 100,
      currentStep: result.success ? 'PDF extraction completed' : 'PDF extraction failed',
      totalSteps: 1,
      currentStepIndex: 0
    });
  }

  return result;
}