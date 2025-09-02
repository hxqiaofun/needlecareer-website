// lib/types/resume.ts

// ==================== 基础数据类型 ====================

export interface Resume {
  id: string;
  student_id: string;
  title: string;
  is_default: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: ResumeStatus;
  created_at: string;
  updated_at: string;
}

export interface ResumeDetail {
  id: string;
  resume_id: string;
  
  // 个人基本信息
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  
  // 职业概述
  professional_summary?: string;
  career_objective?: string;
  
  // JSON 格式存储的结构化数据
  skills: SkillCategory[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  
  // 其他信息
  interests?: string;
  reference_contacts?: string;
  
  created_at: string;
  updated_at: string;
}

// ==================== JSON 数据结构类型 ====================

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  gpa?: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements?: string[];
}

export interface Project {
  name: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  language: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

// ==================== 文件上传相关类型 ==================== ✨ 新增

export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorageUploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface ResumeUploadResult {
  success: boolean;
  resumeId?: string;
  resume?: Resume;
  error?: string;
}

// ==================== 枚举和常量类型 ====================

export type ResumeStatus = 'draft' | 'active' | 'archived';

export type UploadStatus = 'waiting' | 'uploading' | 'completed' | 'error';

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[keyof typeof SUPPORTED_FILE_TYPES];

// 文件上传配置
export interface UploadConfig {
  maxFileSize: number; // bytes
  allowedTypes: SupportedFileType[];
  maxFiles: number;
  bucketName: string;
}

// 默认上传配置
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: Object.values(SUPPORTED_FILE_TYPES),
  maxFiles: 10,
  bucketName: 'resume-files'
};

// ==================== 表单相关类型 ====================

export interface ResumeFormData {
  title: string;
  status: ResumeStatus;
  is_default: boolean;
  
  // 基本信息
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  
  // 职业概述
  professional_summary: string;
  career_objective: string;
  
  // 结构化数据
  skills: SkillCategory[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  
  // 其他信息
  interests: string;
  reference_contacts: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: { [key: string]: string };
}

// ==================== API 响应类型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ResumeListResponse extends ApiResponse<Resume[]> {}

export interface ResumeDetailResponse extends ApiResponse<{
  resume: Resume;
  details: ResumeDetail;
}> {}

export interface UploadResponse extends ApiResponse<{
  resume: Resume;
  uploadedFiles: Array<{
    fileName: string;
    fileSize: number;
    fileUrl: string;
  }>;
}> {}

// ==================== 用户界面相关类型 ====================

export interface ResumeCardProps {
  resume: Resume;
  onEdit: (resumeId: string) => void;
  onPreview: (resumeId: string) => void;
  onDelete: (resumeId: string) => void;
  onSetDefault: (resumeId: string) => void;
}

export interface UploadDropzoneProps {
  onFileSelect: (files: FileList) => void;
  isDragOver: boolean;
  isUploading: boolean;
  acceptedTypes: string;
  maxSize: number;
}

export interface FileListProps {
  files: UploadFile[];
  onRemoveFile: (fileId: string) => void;
  onRetryUpload: (fileId: string) => void;
}

// ==================== 工具函数类型 ====================

export interface FileUtils {
  validateFile: (file: File, config?: UploadConfig) => FileValidationResult;
  formatFileSize: (bytes: number) => string;
  getFileExtension: (fileName: string) => string;
  generateFileName: (originalName: string, userId: string) => string;
}

export interface UploadUtils {
  uploadToStorage: (file: File, filePath: string) => Promise<StorageUploadResult>;
  createResumeRecord: (uploadData: Partial<Resume>) => Promise<ResumeUploadResult>;
  generateUploadPath: (userId: string, fileName: string) => string;
}

// ==================== 统计数据类型 ====================

export interface ResumeStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  withFiles: number;
  defaultCount: number;
}

export interface UploadStats {
  totalUploaded: number;
  totalSize: number;
  successRate: number;
  averageUploadTime: number;
}

// ==================== 错误处理类型 ====================

export interface ResumeError {
  type: 'validation' | 'upload' | 'database' | 'network' | 'auth';
  message: string;
  field?: string;
  code?: string;
}

export interface UploadError extends ResumeError {
  type: 'upload';
  fileName?: string;
  fileSize?: number;
}

// ==================== 导出常量 ====================

// 注意：接口会自动导出，无需在 export type 中重复声明