'use client';

import { useState, useEffect, useRef } from 'react'; // 1. 导入 useRef
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import BasicInfoSection from '@/app/components/resume/BasicInfoSection';
import SkillsSection from '@/app/components/resume/SkillsSection';
import EducationSection from '@/app/components/resume/EducationSection';
import ExperienceSection from '@/app/components/resume/ExperienceSection';
import ProjectsSection from '@/app/components/resume/ProjectsSection';
import AdditionalInfoSection from '@/app/components/resume/AdditionalInfoSection';
import { Resume, ResumeDetail } from '@/lib/types/resume';

interface EditPageProps {}

export default function ResumeEditPage({}: EditPageProps) {
  const router = useRouter();
  const params = useParams();

  const resumeId = params.id as string;

  // 状态管理
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeDetail, setResumeDetail] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 2. 创建一个 ref 来防止重复创建
  const isCreatingRef = useRef(false);

  // 获取简历数据
  const fetchResumeData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Current user ID:', session.user.id);
      console.log('Resume ID from URL:', resumeId);
      
      if (resumeId === 'new') {
        // 3. 检查 ref 标志位，如果正在创建，则直接返回
        if (isCreatingRef.current) {
          return;
        }
        // 设置标志位，表示创建已开始
        isCreatingRef.current = true;
        
        console.log('Creating new resume...');
        await createNewResume(session.user.id);
        return;
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(resumeId)) {
        console.error('Invalid resume ID format:', resumeId);
        alert('Invalid resume ID format. Please check the URL.');
        router.push('/dashboard/student/resumes');
        return;
      }
      
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      console.log('Resume query result:', { resumeData, resumeError });

      if (resumeError) {
        console.error('Error fetching resume:', resumeError);
        if (resumeError.code === 'PGRST116') {
          alert('Resume not found. Please check if the resume ID is correct.');
        } else {
          alert('Error loading resume: ' + resumeError.message);
        }
        router.push('/dashboard/student/resumes');
        return;
      }

      if (resumeData.student_id !== session.user.id) {
        console.error('Permission denied: Resume belongs to different user');
        alert('You do not have permission to edit this resume.');
        router.push('/dashboard/student/resumes');
        return;
      }

      setResume(resumeData);

      const { data: detailData, error: detailError } = await supabase
        .from('resume_details')
        .select('*')
        .eq('resume_id', resumeId)
        .single();

      console.log('Resume details query result:', { detailData, detailError });

      if (detailError && detailError.code !== 'PGRST116') {
        console.error('Error fetching resume details:', detailError);
      }

      if (!detailData) {
        console.log('Creating empty resume detail structure');
        const emptyDetail: Partial<ResumeDetail> = {
          resume_id: resumeId,
          full_name: '',
          email: session.user.email || '',
          phone: '',
          location: '',
          professional_summary: '',
          skills: [],
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          languages: []
        };
        setResumeDetail(emptyDetail as ResumeDetail);
      } else {
        setResumeDetail(detailData);
      }

    } catch (error) {
      console.error('Error in fetchResumeData:', error);
      alert('An unexpected error occurred while loading the resume.');
      router.push('/dashboard/student/resumes');
    } finally {
      setLoading(false);
    }
  };

  // 创建新简历
  const createNewResume = async (userId: string) => {
    try {
      console.log('Creating new resume for user:', userId);
      
      const { data: newResume, error: createError } = await supabase
        .from('resumes')
        .insert({
          student_id: userId,
          title: 'Untitled Resume',
          status: 'draft',
          is_default: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating new resume:', createError);
        alert('Failed to create new resume: ' + createError.message);
        router.push('/dashboard/student/resumes');
        return;
      }

      console.log('New resume created:', newResume);
      
      router.replace(`/dashboard/student/resumes/edit/${newResume.id}`);
      
    } catch (error) {
      console.error('Error in createNewResume:', error);
      alert('An unexpected error occurred while creating the resume.');
      router.push('/dashboard/student/resumes');
    }
  };

  // 保存简历数据
  const saveResumeData = async () => {
    if (!resumeDetail) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('resume_details')
        .upsert({
          ...resumeDetail,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving resume:', error);
        alert('Failed to save resume. Please try again.');
        return;
      }

      setHasUnsavedChanges(false);
      
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMsg.textContent = 'Resume saved successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
      console.error('Error in saveResumeData:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 计算简历完成度
  const calculateCompletion = (data: ResumeDetail | null): number => {
    if (!data) return 0;
    
    let completedFields = 0;
    let totalFields = 0;
    
    // 基本信息 (权重: 30%)
    const basicFields = ['full_name', 'email', 'phone', 'location', 'professional_summary'];
    const basicCompleted = basicFields.filter(field => {
      const value = data[field as keyof ResumeDetail];
      return value && value.toString().trim() !== '';
    }).length;
    completedFields += basicCompleted * 6; // 每个基本信息字段权重为6
    totalFields += basicFields.length * 6;
    
    // 技能 (权重: 15%)
    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      const hasValidSkills = data.skills.some(skillCategory => 
        skillCategory.items && skillCategory.items.length > 0
      );
      if (hasValidSkills) completedFields += 15;
    }
    totalFields += 15;
    
    // 教育背景 (权重: 20%)
    if (data.education && Array.isArray(data.education) && data.education.length > 0) {
      const hasValidEducation = data.education.some(edu => 
        edu.school && edu.school.trim() !== '' && edu.degree && edu.degree.trim() !== ''
      );
      if (hasValidEducation) completedFields += 20;
    }
    totalFields += 20;
    
    // 工作经历 (权重: 20%)
    if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
      const hasValidExperience = data.experience.some(exp => 
        exp.company && exp.company.trim() !== '' && exp.position && exp.position.trim() !== ''
      );
      if (hasValidExperience) completedFields += 20;
    }
    totalFields += 20;
    
    // 项目经历 (权重: 10%)
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      const hasValidProjects = data.projects.some(project => 
        project.name && project.name.trim() !== '' && project.description && project.description.trim() !== ''
      );
      if (hasValidProjects) completedFields += 10;
    }
    totalFields += 10;
    
    // 附加信息 (权重: 5%)
    const additionalItems = [
      data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0,
      data.languages && Array.isArray(data.languages) && data.languages.length > 0,
      data.interests && data.interests.trim() !== ''
    ];
    const additionalCompleted = additionalItems.filter(Boolean).length;
    completedFields += additionalCompleted * 1.67; // 平均分配5%权重
    totalFields += 5;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // 更新简历详情
  const updateResumeDetail = (field: keyof ResumeDetail, value: any) => {
    if (!resumeDetail) return;
    
    setResumeDetail(prev => prev ? { ...prev, [field]: value } : prev);
    setHasUnsavedChanges(true);
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'additional', label: 'Additional', icon: '📋' }
  ];

  useEffect(() => {
    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resume || !resumeDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Not Found</h2>
            <p className="text-gray-600 mb-6">The resume you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard/student/resumes')}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Back to Resumes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Resume</h1>
              <p className="text-gray-600 mt-1">
                Editing: <span className="font-medium">{resume.title}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard/student/resumes')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={saveResumeData}
                disabled={saving || !hasUnsavedChanges}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  saving || !hasUnsavedChanges
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ You have unsaved changes. Don't forget to save your progress!
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Completion</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateCompletion(resumeDetail)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{calculateCompletion(resumeDetail)}% Complete</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {activeSection === 'basic' && (
                  <BasicInfoSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
                
                {activeSection === 'skills' && (
                  <SkillsSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
                
                {activeSection === 'education' && (
                  <EducationSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
                
                {activeSection === 'experience' && (
                  <ExperienceSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
                
                {activeSection === 'projects' && (
                  <ProjectsSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
                
                {activeSection === 'additional' && (
                  <AdditionalInfoSection
                    data={resumeDetail}
                    onChange={updateResumeDetail}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}