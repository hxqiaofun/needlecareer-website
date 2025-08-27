'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Resume, ResumeDetail } from '@/lib/types/resume';
import ClassicResumeTemplate from '@/app/components/resume/ClassicResumeTemplate';

export default function ResumePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeDetail, setResumeDetail] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取简历数据
  useEffect(() => {
    if (!resumeId) return;
    
    fetchResumeData();
  }, [resumeId]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      
      // 获取当前用户
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('请先登录');
        return;
      }

      // 获取简历基本信息
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('student_id', user.id)
        .single();

      if (resumeError || !resumeData) {
        setError('简历不存在或无访问权限');
        return;
      }

      setResume(resumeData);

      // 获取简历详细信息
      const { data: detailData, error: detailError } = await supabase
        .from('resume_details')
        .select('*')
        .eq('resume_id', resumeId)
        .single();

      if (detailError) {
        console.error('获取简历详情失败:', detailError);
        // 如果没有详细信息，创建空的默认结构
        setResumeDetail({
          id: '',
          resume_id: resumeId,
          full_name: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin_url: '',
          github_url: '',
          professional_summary: '',
          career_objective: '',
          skills: [],
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          languages: [],
          interests: '',
          reference_contacts: '',
          created_at: '',
          updated_at: ''
        });
      } else {
        setResumeDetail(detailData);
      }

    } catch (err) {
      console.error('获取简历数据失败:', err);
      setError('获取简历数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // PDF导出功能，稍后实现
    console.log('导出PDF功能即将实现');
    alert('PDF导出功能正在开发中...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/dashboard/student/resumes"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Resumes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* 左侧：返回按钮和简历标题 */}
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/student/resumes"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">
                {resume?.title || 'Resume Preview'}
              </h1>
              {resume?.is_default && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/student/resumes/edit/${resumeId}`}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Resume
              </Link>
              <button
                onClick={handleExportPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 简历模板容器 */}
          <div id="resume-content" className="print:p-0 print:shadow-none">
            {resumeDetail ? (
              <ClassicResumeTemplate 
                resumeDetail={resumeDetail} 
                resumeTitle={resume?.title}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">No Resume Data</h3>
                <p>Please edit your resume to add content</p>
                <Link
                  href={`/dashboard/student/resumes/edit/${resumeId}`}
                  className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Edit Resume
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 简历信息卡片 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Resume Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <span className="ml-2 text-gray-900">{resume?.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                resume?.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : resume?.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {resume?.status 
                  ? resume.status.charAt(0).toUpperCase() + resume.status.slice(1)
                  : 'Unknown'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-900">
                {resume?.created_at ? new Date(resume.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="ml-2 text-gray-900">
                {resume?.updated_at ? new Date(resume.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}