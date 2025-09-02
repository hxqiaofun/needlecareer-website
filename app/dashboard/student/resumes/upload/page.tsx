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

interface Resume {
  id: string;
  title: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function ResumeUploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [existingResumes, setExistingResumes] = useState<Resume[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  // 获取现有的已上传简历
  useEffect(() => {
    const fetchExistingResumes = async () => {
      if (!user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('resumes')
          .select('id, title, file_url, file_name, file_size, status, created_at, updated_at')
          .eq('student_id', user.id)
          .not('file_url', 'is', null) // 只显示有文件的简历
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setExistingResumes(data || []);
      } catch (err) {
        console.error('获取已上传文件失败:', err);
        // 不显示错误，因为这不影响上传功能
      }
    };

    fetchExistingResumes();
  }, [user]);

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

      // 刷新已上传文件列表
      const { data: updatedResumes } = await supabase
        .from('resumes')
        .select('id, title, file_url, file_name, file_size, status, created_at, updated_at')
        .eq('student_id', user.id)
        .not('file_url', 'is', null)
        .order('created_at', { ascending: false });

      if (updatedResumes) {
        setExistingResumes(updatedResumes);
      }

      setSuccessMessage(`${file.name} uploaded successfully!`);

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

  // 删除已上传的简历文件
  const deleteExistingResume = async (resumeId: string, fileName: string) => {
    if (!user || !confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // 获取要删除的简历信息
      const resumeToDelete = existingResumes.find(r => r.id === resumeId);
      if (!resumeToDelete || !resumeToDelete.file_url) return;

      // 从 file_url 中提取正确的文件路径
      // file_url 格式: https://xxx.supabase.co/storage/v1/object/public/resume-files/user_id/filename
      const urlParts = resumeToDelete.file_url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'resume-files');
      
      if (bucketIndex === -1) {
        throw new Error('Invalid file URL format');
      }

      // 获取 bucket 之后的路径部分，并解码 URL 编码
      const encodedPath = urlParts.slice(bucketIndex + 1).join('/');
      const filePath = decodeURIComponent(encodedPath); // 解码 URL 编码
      
      console.log('原始 URL 路径:', encodedPath);
      console.log('解码后文件路径:', filePath);

      // 尝试两种路径格式删除文件
      let storageError = null;

      // 方法1：使用解码后的路径
      const { error: error1 } = await supabase.storage
        .from('resume-files')
        .remove([filePath]);

      if (error1) {
        console.log('解码路径删除失败，尝试编码路径:', error1);
        
        // 方法2：使用原始编码路径
        const { error: error2 } = await supabase.storage
          .from('resume-files')
          .remove([encodedPath]);

        if (error2) {
          storageError = error2;
          console.error('两种路径都删除失败:', { error1, error2 });
        } else {
          console.log('使用编码路径删除成功');
        }
      } else {
        console.log('使用解码路径删除成功');
      }

      // 如果 Storage 删除失败，仍然提醒用户但继续删除数据库记录
      if (storageError) {
        console.warn('Storage file deletion failed, but continuing with database cleanup:', storageError);
      }

      // 从数据库中删除简历记录
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('student_id', user.id);

      if (dbError) {
        throw dbError;
      }

      // 更新本地状态
      setExistingResumes(prev => prev.filter(r => r.id !== resumeId));
      
      if (storageError) {
        setSuccessMessage(`${fileName} record deleted successfully! (Note: Storage file may still exist)`);
      } else {
        setSuccessMessage(`${fileName} deleted successfully!`);
      }

    } catch (err: any) {
      console.error('删除文件失败:', err);
      setError(`Failed to delete ${fileName}: ${err.message}`);
    }
  };

  // 清除消息
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // 开始上传所有文件
  const startUpload = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'waiting');
    
    clearMessages(); // 清除之前的消息

    for (const file of filesToUpload) {
      await uploadFile(file);
    }

    // 检查是否所有文件都上传完成
    const allCompleted = uploadFiles.every(f => f.status === 'completed' || f.status === 'error');
    const hasSuccessfulUploads = uploadFiles.some(f => f.status === 'completed');
    
    if (allCompleted && hasSuccessfulUploads) {
      // 可选择性跳转或留在页面
      // setTimeout(() => {
      //   router.push('/dashboard/student/resumes');
      // }, 2000);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取文件状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

        {/* 错误和成功提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearMessages}
              className="text-red-700 hover:text-red-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={clearMessages}
              className="text-green-700 hover:text-green-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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

        {/* 已上传的文件列表 */}
        {existingResumes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border-2 border-[#c8ffd2]">
              <div className="p-6 border-b border-[#c8ffd2]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                    Previously Uploaded Files ({existingResumes.length})
                  </h3>
                  <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                    {existingResumes.reduce((total, resume) => total + (resume.file_size || 0), 0) > 0 && 
                      `Total size: ${formatFileSize(existingResumes.reduce((total, resume) => total + (resume.file_size || 0), 0))}`
                    }
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-[#c8ffd2]">
                {existingResumes.map((resume) => (
                  <div key={resume.id} className="p-6 hover:bg-[#c8ffd2] hover:bg-opacity-10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* 文件图标 */}
                        <div className="flex-shrink-0">
                          {resume.file_name?.toLowerCase().endsWith('.pdf') ? (
                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h-2v3zm0-4h2V6H9v3z"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h-2v3zm0-4h2V6H9v3z"/>
                            </svg>
                          )}
                        </div>
                        
                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-black truncate" style={{ fontFamily: 'PT Sans' }}>
                            {resume.file_name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                              {formatFileSize(resume.file_size || 0)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(resume.status)}`}>
                              {resume.status}
                            </span>
                            <span className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                              Uploaded: {formatDate(resume.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center space-x-2">
                        {/* 预览按钮 */}
                        <button
                          onClick={() => router.push(`/dashboard/student/resumes/preview/${resume.id}`)}
                          className="text-black hover:text-[#7b7f80] text-sm font-bold transition-colors"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Preview
                        </button>
                        
                        {/* 编辑按钮 */}
                        <button
                          onClick={() => router.push(`/dashboard/student/resumes/edit/${resume.id}`)}
                          className="text-black hover:text-[#7b7f80] text-sm font-bold transition-colors"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Edit
                        </button>
                        
                        {/* 下载按钮 */}
                        {resume.file_url && (
                          <a
                            href={resume.file_url}
                            download={resume.file_name}
                            className="text-black hover:text-[#7b7f80] text-sm font-bold transition-colors"
                            style={{ fontFamily: 'PT Sans' }}
                          >
                            Download
                          </a>
                        )}
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={() => deleteExistingResume(resume.id, resume.file_name || 'Unknown')}
                          className="text-red-700 hover:text-red-900 text-sm font-bold transition-colors"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* 新上传文件列表 */}
        {uploadFiles.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border-2 border-[#c8ffd2]">
              <div className="p-6 border-b border-[#c8ffd2]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                    New Files to Upload ({uploadFiles.length})
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
            <li>• Previously uploaded files are shown above with management options</li>
            <li>• You can preview, edit, download, or delete existing files</li>
            <li>• Files are securely stored and only accessible by you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}