'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

// TypeScript 类型定义
interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    user_type?: string;
  };
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function ResumeUploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 检查用户认证和权限
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        // 检查用户类型
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', authUser.id)
          .single();

        if (profile?.user_type !== 'student') {
          router.push('/dashboard');
          return;
        }

        setUser(authUser as User);
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // 文件验证函数
  const validateFile = (file: File): string | null => {
    // 检查文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and Word documents (.pdf, .doc, .docx) are allowed';
    }

    // 检查文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  // 生成唯一文件ID
  const generateFileId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 处理文件选择
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        continue;
      }

      newFiles.push({
        file,
        id: generateFileId(),
        progress: 0,
        status: 'waiting'
      });
    }

    setUploadFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // 点击选择文件
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // 移除文件
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 上传单个文件
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { file, id } = uploadFile;
    
    // 更新状态为上传中
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' as const } : f
    ));

    try {
      // 生成文件路径
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // 模拟上传进度（因为 Supabase 不支持进度回调）
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 20, 90);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      // 上传到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resume-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // 清除进度模拟
      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // 获取文件的公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('resume-files')
        .getPublicUrl(filePath);

      // 创建简历记录
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          student_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          status: 'active',
          is_default: false
        });

      if (dbError) {
        throw dbError;
      }

      // 更新状态为完成
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed' as const, progress: 100 } : f
      ));

    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error' as const, 
          error: err.message || 'Upload failed' 
        } : f
      ));
    }
  };

  // 开始上传所有文件
  const startUpload = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'waiting');
    
    for (const file of filesToUpload) {
      await uploadFile(file);
    }

    // 检查是否所有文件都上传完成
    const allCompleted = uploadFiles.every(f => f.status === 'completed' || f.status === 'error');
    if (allCompleted) {
      // 延迟跳转，让用户看到完成状态
      setTimeout(() => {
        router.push('/dashboard/student/resumes');
      }, 1500);
    }
  };

  // 获取文件类型图标
  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h-2v3zm0-4h2V6H9v3z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h-2v3zm0-4h2V6H9v3z"/>
        </svg>
      );
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'waiting':
        return (
          <svg className="w-5 h-5 text-[#7b7f80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#c8ffd2] border-t-black"></div>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-[#7b7f80] font-medium">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                Upload Resume
              </h1>
              <p className="mt-2 text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                Upload your resume files (PDF, DOC, DOCX) up to 10MB each
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/student/resumes')}
              className="bg-[#c8ffd2] hover:bg-gray-100 text-black px-6 py-2 font-bold transition-colors"
              style={{ fontFamily: 'PT Sans' }}
            >
              Back to Resumes
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 上传区域 */}
        <div className="mb-8">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragOver 
                ? 'border-black bg-[#c8ffd2] bg-opacity-20' 
                : 'border-[#c8ffd2] hover:border-black hover:bg-[#c8ffd2] hover:bg-opacity-10'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#c8ffd2] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-black mb-2" style={{ fontFamily: 'PT Sans' }}>
                  {isDragOver ? 'Drop files here' : 'Drag and drop your resume files'}
                </h3>
                <p className="text-[#7b7f80] font-medium mb-4" style={{ fontFamily: 'PT Sans' }}>
                  or click to select files from your computer
                </p>
                <button
                  onClick={handleClickUpload}
                  className="bg-black hover:bg-gray-800 text-[#c8ffd2] px-6 py-3 font-bold transition-colors"
                  style={{ fontFamily: 'PT Sans' }}
                >
                  Choose Files
                </button>
              </div>
              
              <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                Supported formats: PDF, DOC, DOCX • Maximum size: 10MB per file
              </div>
            </div>
          </div>
        </div>

        {/* 文件列表 */}
        {uploadFiles.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border-2 border-[#c8ffd2]">
              <div className="p-6 border-b border-[#c8ffd2]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                    Files to Upload ({uploadFiles.length})
                  </h3>
                  {uploadFiles.some(f => f.status === 'waiting') && (
                    <button
                      onClick={startUpload}
                      className="bg-black hover:bg-gray-800 text-[#c8ffd2] px-6 py-2 font-bold transition-colors"
                      style={{ fontFamily: 'PT Sans' }}
                    >
                      Start Upload
                    </button>
                  )}
                </div>
              </div>
              
              <div className="divide-y divide-[#c8ffd2]">
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* 文件图标 */}
                      <div className="flex-shrink-0">
                        {getFileIcon(uploadFile.file)}
                      </div>
                      
                      {/* 文件信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-black truncate" style={{ fontFamily: 'PT Sans' }}>
                            {uploadFile.file.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(uploadFile.status)}
                            {uploadFile.status === 'waiting' && (
                              <button
                                onClick={() => removeFile(uploadFile.id)}
                                className="text-[#7b7f80] hover:text-red-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                            {formatFileSize(uploadFile.file.size)}
                          </span>
                          <span className="text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                            {uploadFile.status === 'uploading' && `${Math.round(uploadFile.progress)}%`}
                            {uploadFile.status === 'completed' && 'Completed'}
                            {uploadFile.status === 'error' && 'Failed'}
                            {uploadFile.status === 'waiting' && 'Waiting'}
                          </span>
                        </div>
                        
                        {/* 进度条 */}
                        {uploadFile.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#c8ffd2] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* 错误信息 */}
                        {uploadFile.status === 'error' && uploadFile.error && (
                          <div className="mt-2 text-sm text-red-600 font-medium" style={{ fontFamily: 'PT Sans' }}>
                            {uploadFile.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-[#c8ffd2] bg-opacity-20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: 'PT Sans' }}>
            📋 Upload Instructions
          </h3>
          <ul className="space-y-2 text-sm text-black font-medium" style={{ fontFamily: 'PT Sans' }}>
            <li>• Supported file formats: PDF, DOC, DOCX</li>
            <li>• Maximum file size: 10MB per file</li>
            <li>• You can upload multiple files at once</li>
            <li>• Each file will create a new resume entry</li>
            <li>• Files are securely stored and only accessible by you</li>
            <li>• After upload, you can edit resume details or preview them</li>
          </ul>
        </div>
      </div>
    </div>
  );
}