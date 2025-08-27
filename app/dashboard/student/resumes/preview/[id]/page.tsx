'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/app/components/Header';
import Link from 'next/link';

interface ResumeData {
  // 基本信息
  title: string;
  status: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  
  // 详细信息
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  professional_summary: string;
  career_objective: string;
  skills: any[];
  education: any[];
  experience: any[];
  projects: any[];
  certifications: any[];
  languages: any[];
  interests: string;
  reference_contacts: string;
}

export default function ResumePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      loadResumeData();
    }
  }, [user, params.id]);

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

  const loadResumeData = async () => {
    const supabase = createClient();
    
    try {
      // 获取简历基本信息
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', params.id)
        .eq('student_id', user.id)
        .single();

      if (resumeError || !resume) {
        router.push('/dashboard/student/resumes');
        return;
      }

      // 获取简历详细信息
      const { data: details, error: detailsError } = await supabase
        .from('resume_details')
        .select('*')
        .eq('resume_id', params.id)
        .single();

      if (detailsError) {
        console.error('Error loading resume details:', detailsError);
      }

      setResumeData({
        title: resume.title,
        status: resume.status,
        is_default: resume.is_default,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
        full_name: details?.full_name || '',
        email: details?.email || '',
        phone: details?.phone || '',
        location: details?.location || '',
        website: details?.website || '',
        linkedin_url: details?.linkedin_url || '',
        github_url: details?.github_url || '',
        professional_summary: details?.professional_summary || '',
        career_objective: details?.career_objective || '',
        skills: details?.skills || [],
        education: details?.education || [],
        experience: details?.experience || [],
        projects: details?.projects || [],
        certifications: details?.certifications || [],
        languages: details?.languages || [],
        interests: details?.interests || '',
        reference_contacts: details?.reference_contacts || ''
      });

    } catch (error) {
      console.error('Error loading resume data:', error);
      router.push('/dashboard/student/resumes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderJsonArray = (data: any[], title: string) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="pl-4">
              {typeof item === 'string' ? (
                <p className="text-gray-700">{item}</p>
              ) : (
                <div className="text-gray-700">
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Resume not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{resumeData.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  resumeData.status === 'active' ? 'bg-green-100 text-green-800' :
                  resumeData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {resumeData.status.charAt(0).toUpperCase() + resumeData.status.slice(1)}
                </span>
                {resumeData.is_default && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Default
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Last updated: {formatDate(resumeData.updated_at)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <Link
                href={`/dashboard/student/resumes/edit/${params.id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit Resume
              </Link>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Print/Export
              </button>
            </div>
          </div>
        </div>

        {/* 简历内容 */}
        <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none">
          {/* 个人信息头部 */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resumeData.full_name || 'Full Name'}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              {resumeData.email && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${resumeData.email}`} className="hover:text-green-600">
                    {resumeData.email}
                  </a>
                </div>
              )}
              
              {resumeData.phone && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{resumeData.phone}</span>
                </div>
              )}
              
              {resumeData.location && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{resumeData.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {resumeData.website && (
                <a href={resumeData.website} target="_blank" rel="noopener noreferrer" 
                   className="text-green-600 hover:text-green-700 text-sm">
                  Website
                </a>
              )}
              
              {resumeData.linkedin_url && (
                <a href={resumeData.linkedin_url} target="_blank" rel="noopener noreferrer" 
                   className="text-green-600 hover:text-green-700 text-sm">
                  LinkedIn
                </a>
              )}
              
              {resumeData.github_url && (
                <a href={resumeData.github_url} target="_blank" rel="noopener noreferrer" 
                   className="text-green-600 hover:text-green-700 text-sm">
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* 职业概述 */}
          {(resumeData.professional_summary || resumeData.career_objective) && (
            <div className="mb-8">
              {resumeData.professional_summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {resumeData.professional_summary}
                  </p>
                </div>
              )}
              
              {resumeData.career_objective && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                    Career Objective
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {resumeData.career_objective}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 技能 */}
          {renderJsonArray(resumeData.skills, 'Skills')}

          {/* 教育背景 */}
          {renderJsonArray(resumeData.education, 'Education')}

          {/* 工作经历 */}
          {renderJsonArray(resumeData.experience, 'Experience')}

          {/* 项目经历 */}
          {renderJsonArray(resumeData.projects, 'Projects')}

          {/* 证书和认证 */}
          {renderJsonArray(resumeData.certifications, 'Certifications')}

          {/* 语言能力 */}
          {renderJsonArray(resumeData.languages, 'Languages')}

          {/* 兴趣爱好 */}
          {resumeData.interests && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                Interests & Hobbies
              </h3>
              <p className="text-gray-700 leading-relaxed pl-4">
                {resumeData.interests}
              </p>
            </div>
          )}

          {/* 推荐人信息 */}
          {resumeData.reference_contacts && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                References
              </h3>
              <p className="text-gray-700 leading-relaxed pl-4">
                {resumeData.reference_contacts}
              </p>
            </div>
          )}

          {/* 简历信息脚注 */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Resume created on {formatDate(resumeData.created_at)}</p>
            <p>Last updated on {formatDate(resumeData.updated_at)}</p>
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/dashboard/student/resumes"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Resumes
          </Link>
          
          <Link
            href={`/dashboard/student/resumes/edit/${params.id}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            Edit This Resume
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}