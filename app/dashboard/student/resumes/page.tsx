'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

// TypeScript 类型定义
interface Resume {
  id: string;
  title: string;
  is_default: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    user_type?: string;
  };
}

export default function ResumeManagementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      }
    };

    checkUser();
  }, [router]);

  // 获取简历列表
  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('resumes')
          .select('*')
          .eq('student_id', user.id)
          .order('is_default', { ascending: false })
          .order('updated_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setResumes(data || []);
      } catch (err) {
        console.error('获取简历列表失败:', err);
        setError('Failed to fetch resume list');
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  // 设置默认简历
  const setDefaultResume = async (resumeId: string) => {
    if (!user) return;

    try {
      // 先将所有简历设为非默认
      await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('student_id', user.id);

      // 再将选中的简历设为默认
      await supabase
        .from('resumes')
        .update({ is_default: true })
        .eq('id', resumeId)
        .eq('student_id', user.id);

      // 更新本地状态
      setResumes(prev => prev.map(resume => ({
        ...resume,
        is_default: resume.id === resumeId
      })));

    } catch (err) {
      console.error('设置默认简历失败:', err);
      setError('Failed to set default resume');
    }
  };

  // 删除简历
  const deleteResume = async (resumeId: string) => {
    if (!user || !confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('student_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // 更新本地状态
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));

    } catch (err) {
      console.error('删除简历失败:', err);
      setError('Failed to delete resume');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      draft: { text: 'Draft', color: 'bg-gray-100 text-gray-800' },
      active: { text: 'Active', color: 'bg-green-100 text-green-800' },
      archived: { text: 'Archived', color: 'bg-yellow-100 text-yellow-800' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作栏 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">My Resumes</h1>
              <p className="mt-2 text-[#7b7f80] font-medium">Manage your resumes and let employers know you better</p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard/student/resumes/upload')}
                className="bg-[#c8ffd2] hover:bg-gray-100 text-black px-6 py-2 font-bold transition-colors"
                style={{ fontFamily: 'PT Sans' }}
              >
                Upload Resume
              </button>
              <button
                onClick={() => router.push('/dashboard/student/resumes/edit/new')}
                className="bg-black hover:bg-gray-800 text-[#c8ffd2] px-6 py-2 font-bold transition-colors"
                style={{ fontFamily: 'PT Sans' }}
              >
                Create New Resume
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 简历列表 */}
        {resumes.length === 0 ? (
          // 空状态
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#c8ffd2] rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'PT Sans' }}>No resumes yet</h3>
              <p className="text-[#7b7f80] font-medium mb-6" style={{ fontFamily: 'PT Sans' }}>Start creating your first resume to showcase your professional skills to employers</p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/dashboard/student/resumes/edit/new')}
                  className="bg-black hover:bg-gray-800 text-[#c8ffd2] px-6 py-3 font-bold transition-colors"
                  style={{ fontFamily: 'PT Sans' }}
                >
                  Create Resume
                </button>
                <button
                  onClick={() => router.push('/dashboard/student/resumes/upload')}
                  className="bg-[#c8ffd2] hover:bg-gray-100 text-black px-6 py-3 font-bold transition-colors"
                  style={{ fontFamily: 'PT Sans' }}
                >
                  Upload Resume
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 简历卡片列表
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const status = getStatusDisplay(resume.status);
              
              return (
                <div key={resume.id} className="bg-white rounded-lg shadow-sm border-2 border-[#c8ffd2] hover:opacity-80 transition-opacity">
                  {/* 卡片头部 */}
                  <div className="p-8 border-b border-[#c8ffd2]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-black truncate" style={{ fontFamily: 'PT Sans' }}>
                          {resume.title}
                        </h3>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                          {resume.is_default && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c8ffd2] text-black">
                              Default Resume
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 操作下拉菜单 */}
                      <div className="relative ml-3">
                        <button className="p-1 rounded-full hover:bg-[#c8ffd2]">
                          <svg className="w-5 h-5 text-[#7b7f80]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 卡片内容 */}
                  <div className="p-8">
                    <div className="space-y-3 text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(resume.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last updated:</span>
                        <span>{formatDate(resume.updated_at)}</span>
                      </div>
                      {resume.file_name && (
                        <div className="flex justify-between">
                          <span>File:</span>
                          <span className="text-black truncate max-w-32 font-bold" title={resume.file_name}>
                            {resume.file_name} ({formatFileSize(resume.file_size)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 卡片操作 */}
                  <div className="px-8 py-4 bg-[#c8ffd2] border-t border-[#c8ffd2] rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/student/resumes/preview/${resume.id}`)}
                          className="text-black hover:text-[#7b7f80] text-sm font-bold"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/student/resumes/edit/${resume.id}`)}
                          className="text-black hover:text-[#7b7f80] text-sm font-bold"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Edit
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!resume.is_default && (
                          <button
                            onClick={() => setDefaultResume(resume.id)}
                            className="text-black hover:text-[#7b7f80] text-sm font-bold"
                            style={{ fontFamily: 'PT Sans' }}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="text-red-700 hover:text-red-900 text-sm font-bold"
                          style={{ fontFamily: 'PT Sans' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部统计信息 */}
        {resumes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border-2 border-[#c8ffd2] p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-black" style={{ fontFamily: 'PT Sans' }}>{resumes.length}</div>
                <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>Total Resumes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                  {resumes.filter(r => r.status === 'active').length}
                </div>
                <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>Active Resumes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                  {resumes.filter(r => r.file_url).length}
                </div>
                <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>PDF Resumes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black" style={{ fontFamily: 'PT Sans' }}>
                  {resumes.filter(r => r.is_default).length}
                </div>
                <div className="text-sm text-[#7b7f80] font-medium" style={{ fontFamily: 'PT Sans' }}>Default Resume</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}