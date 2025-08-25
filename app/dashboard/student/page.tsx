'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

// TypeScript 类型定义
interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_range: string;
  job_types: string[];
  description: string;
  created_at: string;
}

interface Resume {
  id: string;
  title: string;
  is_default: boolean;
  status: 'draft' | 'active' | 'archived';
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    user_type?: string;
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
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
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 获取最新职位
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // 获取用户简历
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('id, title, is_default, status')
          .eq('student_id', user.id)
          .order('is_default', { ascending: false })
          .order('updated_at', { ascending: false });

        setRecentJobs(jobsData || []);
        setResumes(resumesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultResume = resumes.find(r => r.is_default);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            欢迎回来，{user?.user_metadata?.full_name || user?.email?.split('@')[0]}！
          </h1>
          <p className="text-gray-600 mt-2">管理您的求职之旅，发现更多机会</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* 简历统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{resumes.length}</p>
                <p className="text-gray-600">我的简历</p>
              </div>
            </div>
            {defaultResume && (
              <div className="mt-2 text-sm text-green-600">
                默认：{defaultResume.title}
              </div>
            )}
          </div>

          {/* 职位申请统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-gray-600">待处理申请</p>
              </div>
            </div>
          </div>

          {/* 面试邀请 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-gray-600">面试邀请</p>
              </div>
            </div>
          </div>

          {/* 收藏职位 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-gray-600">收藏职位</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：推荐职位 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">为您推荐的职位</h2>
                  <button
                    onClick={() => router.push('/browse-jobs')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    浏览所有职位 →
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <p className="text-gray-600">暂无推荐职位</p>
                    <button
                      onClick={() => router.push('/browse-jobs')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      浏览所有职位
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 hover:text-green-600">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{job.company_name}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span>{job.location}</span>
                              {job.salary_range && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{job.salary_range}</span>
                                </>
                              )}
                            </div>
                            {job.job_types && job.job_types.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.job_types.slice(0, 3).map((type, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {type}
                                  </span>
                                ))}
                                {job.job_types.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    +{job.job_types.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {new Date(job.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            立即申请
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：快捷操作和简历管理 */}
          <div className="space-y-6">
            {/* 快捷操作 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/browse-jobs')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">浏览职位</p>
                    <p className="text-sm text-gray-600">发现新机会</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/dashboard/student/resumes')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">管理简历</p>
                    <p className="text-sm text-gray-600">编辑和优化简历</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">申请记录</p>
                    <p className="text-sm text-gray-600">查看申请状态</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">账户设置</p>
                    <p className="text-sm text-gray-600">管理个人信息</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 简历管理摘要 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">我的简历</h3>
                <button
                  onClick={() => router.push('/dashboard/student/resumes')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  管理全部 →
                </button>
              </div>

              {resumes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">还没有简历</p>
                  <button
                    onClick={() => router.push('/dashboard/student/resumes/edit/new')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    创建第一份简历
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.slice(0, 3).map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900 text-sm">{resume.title}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              resume.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : resume.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {resume.status === 'active' ? '活跃' : resume.status === 'draft' ? '草稿' : '已归档'}
                            </span>
                            {resume.is_default && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                默认
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/student/resumes/edit/${resume.id}`)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        编辑
                      </button>
                    </div>
                  ))}
                  
                  {resumes.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => router.push('/dashboard/student/resumes')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        查看全部 {resumes.length} 份简历 →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 求职提示 */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">求职小贴士</h3>
              <p className="text-sm opacity-90 mb-3">
                保持简历更新，定期优化关键词，提高匹配度
              </p>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                查看更多技巧 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}