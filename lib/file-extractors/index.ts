// app/lib/file-extractors/index.ts

import {
  ExtractionResult,
  ExtractionConfig,
  ExtractionService,
  SupportedFileType,
  ProgressCallback,
  FileTypeDetector,
  FILE_TYPE_MAPPINGS,
  FILE_EXTENSION_MAPPINGS,
  DEFAULT_EXTRACTION_CONFIG,
  ExtractionStatus,
  ExtractionErrorCode
} from '../types/extraction';

import { PDFExtractor, createPDFExtractor } from './pdf-extractor';
import { WordDocExtractor, createWordExtractor } from './doc-extractor';
import { TextProcessor, createTextProcessor, analyzeResumeText } from './text-processor';

/**
 * 统一文件内容提取服务
 * 根据文件类型自动选择合适的提取器
 */
export class FileExtractionService implements ExtractionService {
  private pdfExtractor: PDFExtractor;
  private wordExtractor: WordDocExtractor;
  private textProcessor: TextProcessor;
  private config: ExtractionConfig;

  constructor(config?: Partial<ExtractionConfig>) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...config };
    this.pdfExtractor = createPDFExtractor(this.config);
    this.wordExtractor = createWordExtractor(this.config);
    this.textProcessor = createTextProcessor();
  }

  /**
   * 从文件中提取文本内容
   */
  async extractFromFile(
    file: File,
    onProgress?: ProgressCallback,
    config?: Partial<ExtractionConfig>
  ): Promise<ExtractionResult> {
    const mergedConfig = { ...this.config, ...config };
    
    try {
      // 检测文件类型
      const fileType = this.detectFileType(file);
      if (!fileType) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // 初始化进度
      if (onProgress) {
        onProgress({
          status: ExtractionStatus.EXTRACTING,
          progress: 0,
          currentStep: 'Initializing extraction',
          totalSteps: 5,
          currentStepIndex: 0
        });
      }

      // 验证文件
      await this.validateFile(file);

      if (onProgress) {
        onProgress({
          status: ExtractionStatus.EXTRACTING,
          progress: 20,
          currentStep: 'File validated',
          totalSteps: 5,
          currentStepIndex: 1
        });
      }

      // 根据文件类型选择提取器
      let result: ExtractionResult;

      switch (fileType) {
        case 'pdf':
          result = await this.pdfExtractor.extractText(file, mergedConfig);
          break;
        case 'docx':
        case 'doc':
          result = await this.wordExtractor.extractText(file, mergedConfig);
          break;
        default:
          throw new Error(`No extractor available for file type: ${fileType}`);
      }

      if (onProgress) {
        onProgress({
          status: ExtractionStatus.EXTRACTING,
          progress: 80,
          currentStep: 'Processing extracted text',
          totalSteps: 5,
          currentStepIndex: 3
        });
      }

      // 如果提取成功，进行额外的文本分析
      if (result.success && result.extractedText) {
        const analysis = analyzeResumeText(result.extractedText);
        
        // 添加分析结果到元数据
        result.metadata = {
          ...result.metadata,
          ...analysis.statistics,
          textQuality: analysis.quality,
          detectedSections: Object.keys(analysis.sections),
          contactInfo: analysis.contactInfo
        };
      }

      if (onProgress) {
        onProgress({
          status: result.success ? ExtractionStatus.SUCCESS : ExtractionStatus.ERROR,
          progress: 100,
          currentStep: result.success ? 'Extraction completed' : 'Extraction failed',
          totalSteps: 5,
          currentStepIndex: 4
        });
      }

      return result;

    } catch (error) {
      const errorResult: ExtractionResult = {
        success: false,
        fileType: this.detectFileType(file) || 'pdf',
        extractedText: '',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          wordCount: 0,
          characterCount: 0,
          extractionTime: 0,
          extractedAt: new Date()
        },
        warnings: [],
        error: {
          code: this.mapErrorToCode(error),
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error instanceof Error ? error.stack : undefined
        }
      };

      if (onProgress) {
        const errorMessage = errorResult.error?.message || 'Unknown error occurred';
        onProgress({
          status: ExtractionStatus.ERROR,
          progress: 0,
          currentStep: `Error: ${errorMessage}`,
          totalSteps: 5,
          currentStepIndex: 0
        });
      }

      return errorResult;
    }
  }

  /**
   * 检测文件类型
   */
  detectFileType(file: File): SupportedFileType | null {
    // 首先基于 MIME 类型检测
    const mimeType = file.type.toLowerCase();
    for (const [mime, type] of Object.entries(FILE_TYPE_MAPPINGS)) {
      if (mimeType === mime.toLowerCase()) {
        return type;
      }
    }

    // 如果 MIME 类型无效，基于文件扩展名检测
    const fileName = file.name.toLowerCase();
    for (const [extension, type] of Object.entries(FILE_EXTENSION_MAPPINGS)) {
      if (fileName.endsWith(extension)) {
        return type;
      }
    }

    return null;
  }

  /**
   * 验证文件
   */
  async validateFile(file: File): Promise<boolean> {
    const fileType = this.detectFileType(file);
    
    if (!fileType) {
      throw new Error('Unsupported file type');
    }

    // 根据文件类型选择验证器
    switch (fileType) {
      case 'pdf':
        return this.pdfExtractor.validateFile(file);
      case 'docx':
      case 'doc':
        return this.wordExtractor.validateFile(file);
      default:
        throw new Error(`No validator available for file type: ${fileType}`);
    }
  }

  /**
   * 处理文本
   */
  processText(text: string, options?: any): string {
    return this.textProcessor.process(text, options);
  }

  /**
   * 获取支持的文件类型
   */
  getSupportedTypes(): SupportedFileType[] {
    return ['pdf', 'docx', 'doc'];
  }

  /**
   * 获取文件类型的详细信息
   */
  getFileTypeInfo(fileType: SupportedFileType) {
    const info = {
      pdf: {
        name: 'PDF Document',
        extensions: ['.pdf'],
        mimeTypes: ['application/pdf'],
        maxSize: 50 * 1024 * 1024, // 50MB
        description: 'Portable Document Format'
      },
      docx: {
        name: 'Word Document (2007+)',
        extensions: ['.docx'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'Microsoft Word Document (XML format)'
      },
      doc: {
        name: 'Word Document (Legacy)',
        extensions: ['.doc'],
        mimeTypes: ['application/msword', 'application/vnd.ms-word'],
        maxSize: 100 * 1024 * 1024, // 100MB
        description: 'Microsoft Word Document (Legacy format)'
      }
    };

    return info[fileType];
  }

  /**
   * 将错误映射到错误代码
   */
  private mapErrorToCode(error: unknown): ExtractionErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('unsupported') || message.includes('invalid file type')) {
        return ExtractionErrorCode.UNSUPPORTED_FORMAT;
      }
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
      if (message.includes('permission') || message.includes('access')) {
        return ExtractionErrorCode.PERMISSION_DENIED;
      }
    }
    
    return ExtractionErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * 创建文件提取服务实例
 */
export function createExtractionService(config?: Partial<ExtractionConfig>): FileExtractionService {
  return new FileExtractionService(config);
}

/**
 * 快速文件提取函数
 */
export async function extractTextFromFile(
  file: File,
  onProgress?: ProgressCallback,
  config?: Partial<ExtractionConfig>
): Promise<ExtractionResult> {
  const service = createExtractionService(config);
  return service.extractFromFile(file, onProgress, config);
}

/**
 * 批量文件提取
 */
export async function extractTextFromFiles(
  files: File[],
  onProgress?: (fileIndex: number, progress: any) => void,
  config?: Partial<ExtractionConfig>
): Promise<ExtractionResult[]> {
  const service = createExtractionService(config);
  const results: ExtractionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const progressCallback: ProgressCallback = (progress) => {
      if (onProgress) {
        onProgress(i, {
          ...progress,
          fileIndex: i,
          totalFiles: files.length,
          fileName: file.name
        });
      }
    };

    const result = await service.extractFromFile(file, progressCallback, config);
    results.push(result);
  }

  return results;
}

/**
 * 检查文件是否支持
 */
export function isFileSupported(file: File): boolean {
  const service = createExtractionService();
  return service.detectFileType(file) !== null;
}

/**
 * 获取文件大小的人类可读格式
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)} ${sizes[i]}`;
}

/**
 * 验证提取结果的质量
 */
export function validateExtractionQuality(result: ExtractionResult): {
  isGoodQuality: boolean;
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 100;

  if (!result.success) {
    return {
      isGoodQuality: false,
      score: 0,
      suggestions: ['Extraction failed. Please try a different file.']
    };
  }

  // 检查文本长度
  if (result.extractedText.length < 200) {
    suggestions.push('Extracted text is quite short. Ensure the document contains sufficient content.');
    score -= 30;
  }

  // 检查字数
  if (result.metadata.wordCount < 50) {
    suggestions.push('Very few words extracted. The document might be mostly images or poorly formatted.');
    score -= 25;
  }

  // 检查字符多样性
  const uniqueChars = new Set(result.extractedText.toLowerCase()).size;
  if (uniqueChars < 20) {
    suggestions.push('Low character diversity detected. The extraction might be incomplete.');
    score -= 20;
  }

  // 检查是否包含常见简历内容
  const resumeKeywords = ['experience', 'education', 'skills', 'work', 'university', 'company'];
  const foundKeywords = resumeKeywords.filter(keyword => 
    result.extractedText.toLowerCase().includes(keyword)
  ).length;
  
  if (foundKeywords < 2) {
    suggestions.push('Few resume-related keywords found. Ensure this is a resume document.');
    score -= 15;
  }

  return {
    isGoodQuality: score >= 70,
    score: Math.max(0, score),
    suggestions
  };
}

// 导出所有功能
export * from '../types/extraction';
export * from './pdf-extractor';
export * from './doc-extractor';
export * from './text-processor';