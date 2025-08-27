'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Link from 'next/link';

interface Resume {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'archived';
  is_default: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

interface ResumeStats {
  total: number;
  active: number;
  withPDF: number;
  defaultCount: number;
}

export default function ResumesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [stats, setStats] = useState<ResumeStats>({
    total: 0,
    active: 0,
    withPDF: 0,
    defaultCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // 检查用户类型
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }

    setUser(user);
  };

  const loadResumes = async () => {
    const supabase = createClient();
    
    const { data: resumesData, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('student_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading resumes:', error);
      setLoading(false);
      return;
    }

    setResumes(resumesData || []);
    
    // 计算统计信息
    const resumeStats = (resumesData || []).reduce(
      (acc, resume) => ({
        total: acc.total + 1,
        active: acc.active + (resume.status === 'active' ? 1 : 0),
        withPDF: acc.withPDF + (resume.file_url ? 1 : 0),
        defaultCount: acc.defaultCount + (resume.is_default ? 1 : 0)
      }),
      { total: 0, active: 0, withPDF: 0, defaultCount: 0 }
    );
    
    setStats(resumeStats);
    setLoading(false);
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(resumeId);
    
    try {
      const supabase = createClient();
      
      // 删除简历详细信息
      await supabase
        .from('resume_details')
        .delete()
        .eq('resume_id', resumeId);
      
      // 删除简历
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('student_id', user.id);

      if (error) throw error;
      
      // 重新加载简历列表
      loadResumes();
      
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      const supabase = createClient();
      
      // 首先将所有简历的默认状态设为false
      await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('student_id', user.id);
      
      // 然后设置选中的简历为默认
      const { error } = await supabase
        .from('resumes')
        .update({ is_default: true })
        .eq('id', resumeId)
        .eq('student_id', user.id);

      if (error) throw error;
      
      // 重新加载简历列表
      loadResumes();
      
    } catch (error) {
      console.error('Error setting default resume:', error);
      alert('Failed to set default resume. Please try again.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your resumes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题和操作按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="mt-2 text-gray-600">
              Manage your professional resumes and keep them up to date
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/student/resumes/edit/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Resume
            </Link>
          </div>
        </div>

        {/* 统计信息 */}
        {resumes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Resumes</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.withPDF}</div>
              <div className="text-sm text-gray-600">With PDF</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.defaultCount}</div>
              <div className="text-sm text-gray-600">Default</div>
            </div>
          </div>
        )}

        {/* 简历列表或空状态 */}
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No resumes yet
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first professional resume to start applying for jobs. You can add your education, experience, and skills.
            </p>
            
            <Link
              href="/dashboard/student/resumes/edit/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {resume.title}
                      </h3>
                      
                      {/* 状态标签 */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                        {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                      </span>
                      
                      {/* 默认简历标签 */}
                      {resume.is_default && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Updated: {formatDate(resume.updated_at)}</div>
                      <div>Created: {formatDate(resume.created_at)}</div>
                      {resume.file_name && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{resume.file_name}</span>
                          {resume.file_size && (
                            <span className="text-gray-400">({formatFileSize(resume.file_size)})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-4">
                    <Link
                      href={`/dashboard/student/resumes/edit/${resume.id}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                    
                    <Link
                      href={`/dashboard/student/resumes/preview/${resume.id}`}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Preview
                    </Link>
                    
                    {!resume.is_default && (
                      <button
                        onClick={() => handleSetDefault(resume.id)}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                        deletingId === resume.id
                          ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                          : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部导航 */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}