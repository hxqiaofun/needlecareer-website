'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Link from 'next/link';

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
  status: string;
  is_default: boolean;
  updated_at: string;
}

interface ResumeStats {
  total: number;
  active: number;
  defaultCount: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeStats, setResumeStats] = useState<ResumeStats>({
    total: 0,
    active: 0,
    defaultCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // 获取用户资料
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'student') {
      router.push('/dashboard');
      return;
    }

    setUser(user);
    setProfile(profile);
  };

  const loadDashboardData = async () => {
    const supabase = createClient();
    
    try {
      // 加载推荐职位（最新的5个）
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          id, title, company_name, location, salary_range, 
          job_types, description, created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setJobs(jobsData || []);

      // 加载用户简历
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('id, title, status, is_default, updated_at')
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      setResumes(resumesData || []);

      // 计算简历统计
      const { data: allResumes } = await supabase
        .from('resumes')
        .select('status, is_default')
        .eq('student_id', user.id);

      const stats = (allResumes || []).reduce(
        (acc, resume) => ({
          total: acc.total + 1,
          active: acc.active + (resume.status === 'active' ? 1 : 0),
          defaultCount: acc.defaultCount + (resume.is_default ? 1 : 0)
        }),
        { total: 0, active: 0, defaultCount: 0 }
      );

      setResumeStats(stats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 欢迎信息 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your career dashboard. Manage your resumes and discover new opportunities.
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Resumes</p>
                <p className="text-2xl font-semibold text-gray-900">{resumeStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Resumes</p>
                <p className="text-2xl font-semibold text-gray-900">{resumeStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1l-1.14 9.12a2 2 0 01-1.99 1.88H6.13a2 2 0 01-1.99-1.88L3 6H2a1 1 0 110-2h4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 17h5l-5 5v-5zM7 7v10l5-5-5-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 简历管理部分 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Resumes</h2>
                <Link
                  href="/dashboard/student/resumes"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              {resumeStats.total === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                  <p className="text-gray-600 mb-4">Create your first professional resume to start applying for jobs.</p>
                  <Link
                    href="/dashboard/student/resumes/edit/new"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{resume.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                              {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                            </span>
                            {resume.is_default && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Updated: {formatDate(resume.updated_at)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/student/resumes/edit/${resume.id}`}
                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/dashboard/student/resumes/preview/${resume.id}`}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Link
                      href="/dashboard/student/resumes/edit/new"
                      className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Resume
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 推荐职位部分 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
                <Link
                  href="/browse-jobs"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Browse All
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                  <p className="text-gray-600">Check back later for new job opportunities.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{job.company_name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {job.location}
                            </span>
                            {job.salary_range && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {job.salary_range}
                              </span>
                            )}
                          </div>
                          {job.job_types && job.job_types.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {job.job_types.slice(0, 3).map((type, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {type}
                                </span>
                              ))}
                              {job.job_types.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{job.job_types.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/student/resumes/edit/new"
              className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Create Resume
                </span>
              </div>
            </Link>

            <Link
              href="/browse-jobs"
              className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Browse Jobs
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/student/resumes"
              className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-purple-700">
                  Manage Resumes
                </span>
              </div>
            </Link>

            <div className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                  </svg>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-400">
                  View Applications
                  <span className="block text-xs">Coming Soon</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}