'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/app/components/Header';

interface ResumeFormData {
  // 基本信息
  title: string;
  status: 'draft' | 'active' | 'archived';
  is_default: boolean;
  
  // 个人详细信息
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  
  // 职业概述
  professional_summary: string;
  career_objective: string;
  
  // 结构化数据（简化版）
  skills: string;
  education: string;
  experience: string;
  projects: string;
  certifications: string;
  languages: string;
  
  // 其他信息
  interests: string;
  reference_contacts: string;
}

export default function ResumeEditPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isNewResume, setIsNewResume] = useState(false);
  
  const [formData, setFormData] = useState<ResumeFormData>({
    title: '',
    status: 'draft',
    is_default: false,
    full_name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    professional_summary: '',
    career_objective: '',
    skills: '',
    education: '',
    experience: '',
    projects: '',
    certifications: '',
    languages: '',
    interests: '',
    reference_contacts: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      if (params.id === 'new') {
        setIsNewResume(true);
        // 预填充用户的基本信息
        loadUserProfile();
        setLoading(false);
      } else {
        loadResumeData();
      }
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

  const loadUserProfile = async () => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        title: `${profile.full_name || 'My'} Resume`
      }));
    }
  };

  const loadResumeData = async () => {
    const supabase = createClient();
    
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
    const { data: details } = await supabase
      .from('resume_details')
      .select('*')
      .eq('resume_id', params.id)
      .single();

    // 填充表单数据
    setFormData({
      title: resume.title,
      status: resume.status,
      is_default: resume.is_default,
      full_name: details?.full_name || '',
      email: details?.email || '',
      phone: details?.phone || '',
      location: details?.location || '',
      website: details?.website || '',
      linkedin_url: details?.linkedin_url || '',
      github_url: details?.github_url || '',
      professional_summary: details?.professional_summary || '',
      career_objective: details?.career_objective || '',
      skills: formatJsonToText(details?.skills),
      education: formatJsonToText(details?.education),
      experience: formatJsonToText(details?.experience),
      projects: formatJsonToText(details?.projects),
      certifications: formatJsonToText(details?.certifications),
      languages: formatJsonToText(details?.languages),
      interests: details?.interests || '',
      reference_contacts: details?.reference_contacts || ''
    });

    setLoading(false);
  };

  // 将JSON数据格式化为可编辑的文本
  const formatJsonToText = (jsonData: any) => {
    if (!jsonData || jsonData.length === 0) return '';
    
    try {
      if (Array.isArray(jsonData)) {
        return jsonData.map(item => {
          if (typeof item === 'object') {
            return Object.entries(item)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
          }
          return item;
        }).join('\n\n');
      }
      return JSON.stringify(jsonData, null, 2);
    } catch {
      return '';
    }
  };

  // 将文本数据转换为JSON格式存储
  const formatTextToJson = (text: string, field: string) => {
    if (!text.trim()) return [];
    
    try {
      // 简单的文本解析 - 后续可以优化
      const lines = text.split('\n').filter(line => line.trim());
      
      if (field === 'skills') {
        return [{ category: 'General', items: lines }];
      } else if (field === 'education') {
        return lines.map(line => ({ description: line }));
      } else if (field === 'experience') {
        return lines.map(line => ({ description: line }));
      } else if (field === 'projects') {
        return lines.map(line => ({ name: line }));
      } else if (field === 'certifications') {
        return lines.map(line => ({ name: line }));
      } else if (field === 'languages') {
        return lines.map(line => ({ language: line }));
      }
      
      return lines;
    } catch {
      return [];
    }
  };

  const handleInputChange = (field: keyof ResumeFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Resume title is required';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setSuccessMessage('');
    
    try {
      const supabase = createClient();
      
      if (isNewResume) {
        // 创建新简历
        const { data: newResume, error: resumeError } = await supabase
          .from('resumes')
          .insert({
            student_id: user.id,
            title: formData.title,
            status: formData.status,
            is_default: formData.is_default
          })
          .select()
          .single();

        if (resumeError) throw resumeError;

        // 创建简历详细信息
        const { error: detailsError } = await supabase
          .from('resume_details')
          .insert({
            resume_id: newResume.id,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            website: formData.website,
            linkedin_url: formData.linkedin_url,
            github_url: formData.github_url,
            professional_summary: formData.professional_summary,
            career_objective: formData.career_objective,
            skills: formatTextToJson(formData.skills, 'skills'),
            education: formatTextToJson(formData.education, 'education'),
            experience: formatTextToJson(formData.experience, 'experience'),
            projects: formatTextToJson(formData.projects, 'projects'),
            certifications: formatTextToJson(formData.certifications, 'certifications'),
            languages: formatTextToJson(formData.languages, 'languages'),
            interests: formData.interests,
            reference_contacts: formData.reference_contacts
          });

        if (detailsError) throw detailsError;
        
        setSuccessMessage('Resume created successfully!');
        setTimeout(() => {
          router.push('/dashboard/student/resumes');
        }, 2000);
        
      } else {
        // 更新现有简历
        const { error: resumeError } = await supabase
          .from('resumes')
          .update({
            title: formData.title,
            status: formData.status,
            is_default: formData.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.id)
          .eq('student_id', user.id);

        if (resumeError) throw resumeError;

        // 更新简历详细信息
        const { error: detailsError } = await supabase
          .from('resume_details')
          .upsert({
            resume_id: params.id,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            website: formData.website,
            linkedin_url: formData.linkedin_url,
            github_url: formData.github_url,
            professional_summary: formData.professional_summary,
            career_objective: formData.career_objective,
            skills: formatTextToJson(formData.skills, 'skills'),
            education: formatTextToJson(formData.education, 'education'),
            experience: formatTextToJson(formData.experience, 'experience'),
            projects: formatTextToJson(formData.projects, 'projects'),
            certifications: formatTextToJson(formData.certifications, 'certifications'),
            languages: formatTextToJson(formData.languages, 'languages'),
            interests: formData.interests,
            reference_contacts: formData.reference_contacts,
            updated_at: new Date().toISOString()
          });

        if (detailsError) throw detailsError;
        
        setSuccessMessage('Resume updated successfully!');
      }
      
    } catch (error) {
      console.error('Error saving resume:', error);
      setErrors({ general: 'Failed to save resume. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewResume ? 'Create New Resume' : 'Edit Resume'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isNewResume 
              ? 'Fill out your information to create a professional resume' 
              : 'Update your resume information'
            }
          </p>
        </div>

        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* 通用错误消息 */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          {/* 简历基本设置 */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Software Engineer Resume"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => handleInputChange('is_default', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Set as default resume</span>
              </label>
            </div>
          </div>

          {/* 个人信息 */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="City, State, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>

          {/* 职业概述 */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={formData.professional_summary}
                  onChange={(e) => handleInputChange('professional_summary', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Write a brief summary of your professional background and key achievements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Career Objective
                </label>
                <textarea
                  value={formData.career_objective}
                  onChange={(e) => handleInputChange('career_objective', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your career goals and what you're looking for..."
                />
              </div>
            </div>
          </div>

          {/* 详细信息部分 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Information</h2>
            <p className="text-sm text-gray-600 -mt-2">
              Enter each item on a new line. This is a simplified version - we'll add better editing features later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="JavaScript&#10;React&#10;Node.js&#10;Python"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <textarea
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="English (Native)&#10;Spanish (Fluent)&#10;French (Intermediate)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Bachelor's in Computer Science&#10;University Name, 2020-2024&#10;GPA: 3.8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Software Engineer at ABC Company&#10;June 2023 - Present&#10;Developed web applications using React and Node.js"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projects
                </label>
                <textarea
                  value={formData.projects}
                  onChange={(e) => handleInputChange('projects', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="E-commerce Website&#10;Built with React and Node.js&#10;https://github.com/username/project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="AWS Certified Developer&#10;Google Cloud Professional&#10;Microsoft Azure Fundamentals"
                />
              </div>
            </div>

            {/* 其他信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests & Hobbies
                </label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Photography, hiking, open source contributions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  References
                </label>
                <textarea
                  value={formData.reference_contacts}
                  onChange={(e) => handleInputChange('reference_contacts', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Available upon request, or provide contact details..."
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/dashboard/student/resumes')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Saving...' : (isNewResume ? 'Create Resume' : 'Update Resume')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}