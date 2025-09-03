// app/lib/types/extraction.ts

/**
 * 文件内容提取模块类型定义
 * 支持 PDF 和 Word 文档的文本提取
 */

// 支持的文件类型
export type SupportedFileType = 'pdf' | 'docx' | 'doc';

// 提取状态枚举
export enum ExtractionStatus {
  IDLE = 'idle',
  EXTRACTING = 'extracting',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 错误代码枚举
export enum ExtractionErrorCode {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  TEXT_TOO_SHORT = 'TEXT_TOO_SHORT',
  PARSING_FAILED = 'PARSING_FAILED',
  ENCODING_ERROR = 'ENCODING_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 提取进度信息
export interface ExtractionProgress {
  status: ExtractionStatus;
  progress: number; // 0-100
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
}

// 提取错误类型
export interface ExtractionError {
  code: ExtractionErrorCode;
  message: string;
  details?: string;
  stack?: string;
}

// 提取结果
export interface ExtractionResult {
  success: boolean;
  fileType: SupportedFileType;
  extractedText: string;
  metadata: {
    fileName: string;
    fileSize: number;
    pageCount?: number; // PDF 页数
    wordCount: number;
    characterCount: number;
    extractionTime: number; // 毫秒
    extractedAt: Date;
    textQuality?: any;
    detectedSections?: string[];
    contactInfo?: any;
  };
  warnings: string[]; // 警告信息
  error?: ExtractionError;
}

// 文本处理选项
export interface TextProcessingOptions {
  removeExtraWhitespace: boolean;
  removeSpecialCharacters: boolean;
  normalizeLineBreaks: boolean;
  trimContent: boolean;
  minContentLength: number;
}

// 提取配置选项
export interface ExtractionConfig {
  // PDF 配置
  pdf: {
    preserveFormatting: boolean;
    extractImages: boolean;
    pageRange?: {
      start: number;
      end: number;
    };
  };
  // Word 文档配置
  docx: {
    preserveFormatting: boolean;
    includeHeaders: boolean;
    includeFooters: boolean;
  };
  // 文本处理配置
  textProcessing: {
    removeExtraWhitespace: boolean;
    normalizeEncoding: boolean;
    minTextLength: number; // 最小有效文本长度
  };
}

// 文件信息接口
export interface FileInfo {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: SupportedFileType;
  lastModified: Date;
}

// 提取器接口
export interface FileExtractor {
  extractText(file: File, config?: Partial<ExtractionConfig>): Promise<ExtractionResult>;
  getSupportedFormats(): SupportedFileType[];
  validateFile(file: File): Promise<boolean>;
}

// 工具函数类型
export type FileTypeDetector = (file: File) => SupportedFileType | null;
export type TextProcessorFunction = (text: string, options?: TextProcessingOptions) => string;
export type ProgressCallback = (progress: ExtractionProgress) => void;

// 提取器工厂类型
export interface ExtractorFactory {
  createExtractor(fileType: SupportedFileType): FileExtractor;
  getSupportedTypes(): SupportedFileType[];
}

// 提取服务接口
export interface ExtractionService {
  extractFromFile(
    file: File, 
    onProgress?: ProgressCallback,
    config?: Partial<ExtractionConfig>
  ): Promise<ExtractionResult>;
  
  validateFile(file: File): Promise<boolean>;
  detectFileType(file: File): SupportedFileType | null;
  processText(text: string, options?: TextProcessingOptions): string;
}

// 默认文本处理选项
export const DEFAULT_TEXT_PROCESSING: TextProcessingOptions = {
  removeExtraWhitespace: true,
  removeSpecialCharacters: false,
  normalizeLineBreaks: true,
  trimContent: true,
  minContentLength: 50,
};

// 默认提取配置
export const DEFAULT_EXTRACTION_CONFIG: ExtractionConfig = {
  pdf: {
    preserveFormatting: true,
    extractImages: false,
  },
  docx: {
    preserveFormatting: true,
    includeHeaders: true,
    includeFooters: false,
  },
  textProcessing: {
    removeExtraWhitespace: true,
    normalizeEncoding: true,
    minTextLength: 100, // 至少100字符
  }
};

// 文件类型映射
export const FILE_TYPE_MAPPINGS: Record<string, SupportedFileType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.ms-word': 'doc',
};

// 文件扩展名映射
export const FILE_EXTENSION_MAPPINGS: Record<string, SupportedFileType> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.doc': 'doc',
};

// 提取步骤定义
export const EXTRACTION_STEPS: Record<SupportedFileType, readonly string[]> = {
  pdf: [
    'Validating PDF file',
    'Loading PDF document',
    'Extracting text content',
    'Processing extracted text',
    'Finalizing extraction'
  ],
  docx: [
    'Validating Word document',
    'Reading document structure',
    'Extracting text content',
    'Processing extracted text',
    'Finalizing extraction'
  ],
  doc: [
    'Validating Word document',
    'Converting document format',
    'Extracting text content',
    'Processing extracted text',
    'Finalizing extraction'
  ]
};