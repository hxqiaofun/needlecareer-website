// 简历管理系统的 TypeScript 类型定义

export interface Resume {
  id: string;
  student_id: string;
  title: string;
  is_default: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: 'draft' | 'active' | 'archived';
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
  
  // 技能信息
  skills: SkillCategory[];
  
  // 教育背景
  education: Education[];
  
  // 工作经历
  experience: WorkExperience[];
  
  // 项目经历
  projects: Project[];
  
  // 证书和奖项
  certifications: Certification[];
  
  // 其他信息
  languages: Language[];
  interests?: string;
  reference_contacts?: string;
  
  created_at: string;
  updated_at: string;
}

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

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
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
  credential_id?: string;
  url?: string;
}

export interface Language {
  language: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description?: string;
  preview_image_url?: string;
  is_active: boolean;
  created_at: string;
}

// 表单相关类型
export interface ResumeFormData {
  title: string;
  status: 'draft' | 'active' | 'archived';
  is_default: boolean;
  details: Partial<ResumeDetail>;
}

// API 响应类型
export interface ResumeListResponse {
  data: Resume[];
  count: number;
}

export interface ResumeResponse {
  resume: Resume;
  details?: ResumeDetail;
}

// 文件上传相关类型
export interface FileUploadConfig {
  maxSize: number; // 字节
  allowedTypes: string[];
  uploadPath: string;
}

export interface UploadedFile {
  file: File;
  url: string;
  name: string;
  size: number;
}

// 表单验证错误类型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | ValidationError[];
}

// 简历预览配置
export interface PreviewConfig {
  template: string;
  showContactInfo: boolean;
  showSkills: boolean;
  showEducation: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showCertifications: boolean;
}

// 导出格式选项
export type ExportFormat = 'pdf' | 'docx' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  template?: string;
  includePhoto?: boolean;
  pageSize?: 'A4' | 'Letter';
}

// 搜索和筛选相关类型
export interface ResumeSearchFilters {
  status?: Resume['status'];
  is_default?: boolean;
  has_file?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ResumeStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  withFiles: number;
  defaultResumes: number;
}

// Hook 返回类型
export interface UseResumeReturn {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  fetchResumes: () => Promise<void>;
  createResume: (data: Partial<Resume>) => Promise<Resume>;
  updateResume: (id: string, data: Partial<Resume>) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setDefaultResume: (id: string) => Promise<void>;
}

export interface UseResumeDetailReturn {
  resume: Resume | null;
  details: ResumeDetail | null;
  loading: boolean;
  error: string | null;
  fetchResumeDetail: (id: string) => Promise<void>;
  updateResumeDetail: (data: Partial<ResumeDetail>) => Promise<void>;
  saveResume: () => Promise<void>;
}

// 常量定义
export const RESUME_STATUS_OPTIONS = [
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '活跃' },
  { value: 'archived', label: '已归档' }
] as const;

export const SKILL_CATEGORIES = [
  '编程语言',
  '框架/库',
  '数据库',
  '工具/软件',
  '云服务',
  '软技能',
  '其他'
] as const;

export const PROFICIENCY_LEVELS = [
  { value: 'Basic', label: '基础' },
  { value: 'Conversational', label: '对话' },
  { value: 'Fluent', label: '流利' },
  { value: 'Native', label: '母语' }
] as const;

export const FILE_UPLOAD_CONFIG: FileUploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  uploadPath: 'resumes'
};