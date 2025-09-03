// app/lib/file-extractors/text-processor.ts

import {
  TextProcessingOptions,
  DEFAULT_TEXT_PROCESSING
} from '../types/extraction';

/**
 * 文本处理器
 * 负责清理、规范化和预处理从文档中提取的文本
 */
export class TextProcessor {
  private options: TextProcessingOptions;

  constructor(options?: Partial<TextProcessingOptions>) {
    this.options = {
      ...DEFAULT_TEXT_PROCESSING,
      ...options
    };
  }

  /**
   * 处理提取的文本
   */
  process(text: string, customOptions?: Partial<TextProcessingOptions>): string {
    const processingOptions = { ...this.options, ...customOptions };
    let processedText = text;

    // 1. 基础清理
    processedText = this.basicCleanup(processedText);

    // 2. 移除额外空白字符
    if (processingOptions.removeExtraWhitespace) {
      processedText = this.removeExtraWhitespace(processedText);
    }

    // 3. 移除特殊字符
    if (processingOptions.removeSpecialCharacters) {
      processedText = this.removeSpecialCharacters(processedText);
    }

    // 4. 规范化换行符
    if (processingOptions.normalizeLineBreaks) {
      processedText = this.normalizeLineBreaks(processedText);
    }

    // 5. 去除首尾空白
    if (processingOptions.trimContent) {
      processedText = processedText.trim();
    }

    // 6. 验证最小内容长度
    if (processedText.length < processingOptions.minContentLength) {
      throw new Error(
        `Processed text too short: ${processedText.length} characters (minimum: ${processingOptions.minContentLength})`
      );
    }

    return processedText;
  }

  /**
   * 基础文本清理
   */
  private basicCleanup(text: string): string {
    let cleaned = text;

    // 移除 Unicode BOM (Byte Order Mark)
    cleaned = cleaned.replace(/^\uFEFF/, '');

    // 移除控制字符（除了换行和制表符）
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 规范化 Unicode 字符
    cleaned = cleaned.normalize('NFC');

    return cleaned;
  }

  /**
   * 移除额外的空白字符
   */
  private removeExtraWhitespace(text: string): string {
    let processed = text;

    // 将多个连续空格替换为单个空格
    processed = processed.replace(/[ \t]+/g, ' ');

    // 移除行首行尾的空白字符
    processed = processed.replace(/^[ \t]+|[ \t]+$/gm, '');

    // 将多个连续换行替换为最多两个换行
    processed = processed.replace(/\n{3,}/g, '\n\n');

    return processed;
  }

  /**
   * 移除特殊字符
   */
  private removeSpecialCharacters(text: string): string {
    let processed = text;

    // 移除常见的文档格式字符
    processed = processed.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' '); // 各种空格字符
    processed = processed.replace(/[\u2013\u2014]/g, '-'); // 长短破折号
    processed = processed.replace(/[\u2018\u2019]/g, "'"); // 单引号
    processed = processed.replace(/[\u201C\u201D]/g, '"'); // 双引号
    processed = processed.replace(/[\u2026]/g, '...'); // 省略号

    // 移除 PDF 相关的特殊字符
    processed = processed.replace(/\uf8ff/g, ''); // Apple logo 字符
    processed = processed.replace(/\uf020/g, ' '); // 特殊空格

    return processed;
  }

  /**
   * 规范化换行符
   */
  private normalizeLineBreaks(text: string): string {
    let processed = text;

    // 统一换行符为 \n
    processed = processed.replace(/\r\n/g, '\n');
    processed = processed.replace(/\r/g, '\n');

    // 处理页面分隔符
    processed = processed.replace(/\f/g, '\n\n');

    return processed;
  }

  /**
   * 提取电子邮件地址
   */
  extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  }

  /**
   * 提取电话号码
   */
  extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    return text.match(phoneRegex) || [];
  }

  /**
   * 提取 URL
   */
  extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/g;
    return text.match(urlRegex) || [];
  }

  /**
   * 检测简历中的关键部分
   */
  detectResumeSections(text: string): { [key: string]: number } {
    const sections: { [key: string]: number } = {};
    const lowercaseText = text.toLowerCase();

    // 定义关键词模式
    const sectionPatterns = {
      contact: /contact|email|phone|address|linkedin|github/,
      summary: /summary|objective|profile|about|overview/,
      experience: /experience|employment|work|career|position|job/,
      education: /education|degree|university|college|school|graduation/,
      skills: /skills|technical|proficiency|competenc|abilities/,
      projects: /projects|portfolio|accomplishments|achievements/,
      certifications: /certifications|certificates|licenses|awards/,
      languages: /languages|fluent|native|proficient/
    };

    // 查找每个部分的位置
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      const match = lowercaseText.search(pattern);
      if (match !== -1) {
        sections[section] = match;
      }
    }

    return sections;
  }

  /**
   * 计算文本统计信息
   */
  getTextStatistics(text: string) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);

    return {
      characterCount: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      averageSentencesPerParagraph: paragraphs.length > 0 ? Math.round(sentences.length / paragraphs.length) : 0
    };
  }

  /**
   * 验证文本质量
   */
  validateTextQuality(text: string): {
    isValid: boolean;
    score: number; // 0-100
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查最小长度
    if (text.length < 100) {
      issues.push('Text is too short');
      score -= 30;
    }

    // 检查是否包含实际单词
    const words = text.split(/\s+/).filter(word => /[A-Za-z]{3,}/.test(word));
    if (words.length < 20) {
      issues.push('Too few meaningful words found');
      score -= 25;
    }

    // 检查字符多样性
    const uniqueChars = new Set(text.toLowerCase()).size;
    if (uniqueChars < 15) {
      issues.push('Low character diversity');
      score -= 15;
    }

    // 检查是否包含常见简历关键词
    const resumeKeywords = [
      'experience', 'education', 'skills', 'work', 'degree', 
      'university', 'company', 'project', 'responsibility'
    ];
    const foundKeywords = resumeKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length < 2) {
      issues.push('Few resume-related keywords found');
      score -= 20;
    }

    // 检查特殊字符比例
    const specialCharRatio = (text.match(/[^A-Za-z0-9\s]/g) || []).length / text.length;
    if (specialCharRatio > 0.3) {
      issues.push('High ratio of special characters');
      score -= 10;
    }

    return {
      isValid: score >= 60,
      score: Math.max(0, score),
      issues
    };
  }
}

/**
 * 创建文本处理器实例
 */
export function createTextProcessor(options?: Partial<TextProcessingOptions>): TextProcessor {
  return new TextProcessor(options);
}

/**
 * 快速文本处理函数
 */
export function processText(
  text: string, 
  options?: Partial<TextProcessingOptions>
): string {
  const processor = createTextProcessor(options);
  return processor.process(text);
}

/**
 * 分析简历文本结构
 */
export function analyzeResumeText(text: string) {
  const processor = createTextProcessor();
  
  return {
    statistics: processor.getTextStatistics(text),
    quality: processor.validateTextQuality(text),
    sections: processor.detectResumeSections(text),
    contactInfo: {
      emails: processor.extractEmails(text),
      phones: processor.extractPhoneNumbers(text),
      urls: processor.extractUrls(text)
    }
  };
}

// 只导出函数，不导出类，避免与types中的接口冲突
export type { TextProcessingOptions } from '../types/extraction';