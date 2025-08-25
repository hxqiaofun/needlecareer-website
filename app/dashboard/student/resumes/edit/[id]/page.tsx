'use client'

import { useState, useEffect, useReducer, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { supabase } from '@/lib/supabase'
import type { Resume, ResumeDetail } from '@/lib/types/resume'

// 步骤定义
const STEPS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'summary', label: 'Professional Summary', icon: '📝' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'additional', label: 'Additional Info', icon: '📋' }
] as const

type StepId = typeof STEPS[number]['id']

// 表单数据类型
interface FormData {
  // 基本简历信息
  title?: string
  status?: 'draft' | 'active' | 'archived'
  
  // 个人基本信息
  full_name?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  linkedin_url?: string
  github_url?: string
  
  // 职业概述
  professional_summary?: string
  career_objective?: string
  
  // JSON 格式的结构化数据
  skills?: Array<{
    category: string
    items: string[]
  }>
  education?: Array<{
    school: string
    degree: string
    major: string
    gpa?: string
    start_date: string
    end_date: string
    description?: string
  }>
  experience?: Array<{
    company: string
    position: string
    start_date: string
    end_date: string
    description: string
    achievements?: string[]
  }>
  projects?: Array<{
    name: string
    role: string
    start_date: string
    end_date: string
    description: string
    technologies: string[]
    url?: string
  }>
  certifications?: Array<{
    name: string
    issuer: string
    date: string
    description?: string
  }>
  languages?: Array<{
    language: string
    proficiency: string
  }>
  
  // 其他信息
  interests?: string
  reference_contacts?: string
}

// Reducer for managing form state
interface FormState {
  data: FormData
  currentStep: StepId
  isLoading: boolean
  isSaving: boolean
  errors: Record<string, string>
  isDirty: boolean
}

type FormAction =
  | { type: 'SET_DATA'; payload: Partial<FormData> }
  | { type: 'SET_STEP'; payload: StepId }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'RESET_FORM'; payload: FormData }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        isDirty: true
      }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload }
    case 'RESET_FORM':
      return {
        ...state,
        data: action.payload,
        isDirty: false,
        errors: {}
      }
    default:
      return state
  }
}

const initialState: FormState = {
  data: {
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: []
  },
  currentStep: 'personal',
  isLoading: true,
  isSaving: false,
  errors: {},
  isDirty: false
}

export default function ResumeEditPage() {
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string
  const isNewResume = resumeId === 'new'

  const [state, dispatch] = useReducer(formReducer, initialState)
  const [user, setUser] = useState<any>(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // 获取当前用户
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router])

  // 加载简历数据
  useEffect(() => {
    if (!user) return

    const loadResume = async () => {
      if (isNewResume) {
        // 新建简历，设置默认数据
        dispatch({
          type: 'RESET_FORM',
          payload: {
            title: 'Untitled Resume',
            status: 'draft',
            full_name: '',
            email: user.email || '',
            skills: [],
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: []
          }
        })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // 加载现有简历
      try {
        const { data: resume, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .eq('student_id', user.id)
          .single()

        if (resumeError) throw resumeError

        const { data: details, error: detailsError } = await supabase
          .from('resume_details')
          .select('*')
          .eq('resume_id', resumeId)
          .single()

        if (detailsError && detailsError.code !== 'PGRST116') {
          throw detailsError
        }

        dispatch({
          type: 'RESET_FORM',
          payload: {
            title: resume.title,
            status: resume.status,
            ...details,
            skills: details?.skills || [],
            education: details?.education || [],
            experience: details?.experience || [],
            projects: details?.projects || [],
            certifications: details?.certifications || [],
            languages: details?.languages || []
          }
        })
      } catch (error) {
        console.error('Error loading resume:', error)
        dispatch({
          type: 'SET_ERRORS',
          payload: { general: 'Failed to load resume data' }
        })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadResume()
  }, [user, resumeId, isNewResume])

  // 自动保存功能 - 使用防抖处理
  useEffect(() => {
    if (!state.isDirty || !user) return

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const timer = setTimeout(() => {
      saveResume(true) // 静默保存
    }, 5000) // 延长到5秒，减少频繁保存

    setAutoSaveTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [state.isDirty, user]) // 只在 isDirty 和 user 变化时触发，不监听整个 state.data

  // 保存简历函数
  const saveResume = async (silent = false) => {
    if (!user) return

    if (!silent) dispatch({ type: 'SET_SAVING', payload: true })

    try {
      let currentResumeId = resumeId

      // 如果是新简历，先创建简历记录
      if (isNewResume) {
        const { data: newResume, error: resumeError } = await supabase
          .from('resumes')
          .insert({
            student_id: user.id,
            title: state.data.title || 'Untitled Resume',
            status: state.data.status || 'draft'
          })
          .select()
          .single()

        if (resumeError) throw resumeError
        currentResumeId = newResume.id

        // 更新URL，避免重复创建
        window.history.replaceState(null, '', `/dashboard/student/resumes/edit/${currentResumeId}`)
      } else {
        // 更新现有简历基本信息
        const { error: resumeError } = await supabase
          .from('resumes')
          .update({
            title: state.data.title,
            status: state.data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentResumeId)
          .eq('student_id', user.id)

        if (resumeError) throw resumeError
      }

      // 保存或更新详细信息
      const detailsData = {
        resume_id: currentResumeId,
        full_name: state.data.full_name,
        email: state.data.email,
        phone: state.data.phone,
        location: state.data.location,
        website: state.data.website,
        linkedin_url: state.data.linkedin_url,
        github_url: state.data.github_url,
        professional_summary: state.data.professional_summary,
        career_objective: state.data.career_objective,
        skills: state.data.skills || [],
        education: state.data.education || [],
        experience: state.data.experience || [],
        projects: state.data.projects || [],
        certifications: state.data.certifications || [],
        languages: state.data.languages || [],
        interests: state.data.interests,
        reference_contacts: state.data.reference_contacts,
        updated_at: new Date().toISOString()
      }

      const { error: detailsError } = await supabase
        .from('resume_details')
        .upsert(detailsData)

      if (detailsError) throw detailsError

      dispatch({ type: 'SET_DIRTY', payload: false })
      dispatch({ type: 'SET_ERRORS', payload: {} })

      if (!silent) {
        // 显示保存成功提示
        console.log('Resume saved successfully!')
      }
    } catch (error) {
      console.error('Error saving resume:', error)
      dispatch({
        type: 'SET_ERRORS',
        payload: { general: 'Failed to save resume' }
      })
    } finally {
      if (!silent) dispatch({ type: 'SET_SAVING', payload: false })
    }
  }

  // 步骤切换
  const handleStepChange = (stepId: StepId) => {
    dispatch({ type: 'SET_STEP', payload: stepId })
  }

  // 表单数据更新 - 使用 useCallback 确保函数稳定性
  const updateFormData = useCallback((data: Partial<FormData>) => {
    dispatch({ type: 'SET_DATA', payload: data })
  }, [])

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'personal':
        return <PersonalInfoStep />
      case 'summary':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      case 'education':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      case 'experience':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      case 'skills':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      case 'projects':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      case 'additional':
        return <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900">Additional Info</h2>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </div>
      default:
        return null
    }
  }

  // 个人信息步骤组件
  const PersonalInfoStep = () => {
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
    
    // 使用 useCallback 缓存函数，避免每次渲染都创建新的函数
    const validateField = useCallback((name: keyof FormData, value: string) => {
      const errors: Record<string, string> = {}
      
      switch (name) {
        case 'full_name':
          if (!value.trim()) {
            errors.full_name = 'Full name is required'
          } else if (value.trim().length < 2) {
            errors.full_name = 'Full name must be at least 2 characters'
          }
          break
        case 'email':
          if (!value.trim()) {
            errors.email = 'Email is required'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.email = 'Please enter a valid email address'
          }
          break
        case 'phone':
          if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s|-|\(|\)/g, ''))) {
            errors.phone = 'Please enter a valid phone number'
          }
          break
        case 'linkedin_url':
          if (value && !value.match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
            errors.linkedin_url = 'Please enter a valid LinkedIn URL'
          }
          break
        case 'github_url':
          if (value && !value.match(/^https?:\/\/(www\.)?github\.com\//)) {
            errors.github_url = 'Please enter a valid GitHub URL'
          }
          break
        case 'website':
          if (value && !value.match(/^https?:\/\/.+/)) {
            errors.website = 'Please enter a valid website URL (starting with http:// or https://)'
          }
          break
        case 'title':
          if (!value.trim()) {
            errors.title = 'Resume title is required'
          }
          break
      }
      
      return errors
    }, [])

    // 处理表单输入 - 使用 useCallback 优化
    const handleInputChange = useCallback((name: keyof FormData, value: string) => {
      // 更新表单数据
      updateFormData({ [name]: value })
      
      // 实时验证
      const fieldErrors = validateField(name, value)
      setLocalErrors(prev => ({
        ...prev,
        ...fieldErrors,
        [name]: fieldErrors[name as string] || ''
      }))
    }, [validateField, updateFormData])

    // 表单字段定义
    const formFields: Array<{
      name: keyof FormData
      label: string
      type: string
      required: boolean
      placeholder: string
    }> = [
      {
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: false,
        placeholder: '+1 (555) 123-4567'
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        required: false,
        placeholder: 'City, State, Country'
      }
    ]

    const socialFields: Array<{
      name: keyof FormData
      label: string
      type: string
      placeholder: string
      icon: string
    }> = [
      {
        name: 'website',
        label: 'Personal Website',
        type: 'url',
        placeholder: 'https://your-website.com',
        icon: '🌐'
      },
      {
        name: 'linkedin_url',
        label: 'LinkedIn Profile',
        type: 'url',
        placeholder: 'https://linkedin.com/in/your-profile',
        icon: '💼'
      },
      {
        name: 'github_url',
        label: 'GitHub Profile',
        type: 'url',
        placeholder: 'https://github.com/your-username',
        icon: '💻'
      }
    ]

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
          <p className="text-gray-600">
            Let's start with your basic contact information. This will appear at the top of your resume.
          </p>
        </div>

        <div className="space-y-8">
          {/* 基本信息部分 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-green-600 rounded mr-3"></span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={state.data[field.name as keyof FormData] as string || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      localErrors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {localErrors[field.name] && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {localErrors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 社交媒体和网站部分 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded mr-3"></span>
              Online Presence
              <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
            </h3>
            <div className="space-y-4">
              {socialFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 flex items-center">
                    <span className="mr-2">{field.icon}</span>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={state.data[field.name as keyof FormData] as string || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      localErrors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {localErrors[field.name] && (
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {localErrors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 简历标题设置 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-purple-600 rounded mr-3"></span>
              Resume Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Resume Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={state.data.title as string || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Software Developer Resume, Marketing Manager Resume"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    localErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {localErrors.title && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {localErrors.title}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  This title helps you organize multiple resumes. It won't appear on the actual resume.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Resume Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={state.data.status as string || 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="draft">Draft - Work in progress</option>
                  <option value="active">Active - Ready to use</option>
                  <option value="archived">Archived - Not currently in use</option>
                </select>
                <p className="text-sm text-gray-500">
                  Set to "Active" when your resume is complete and ready for job applications.
                </p>
              </div>
            </div>
          </div>

          {/* 预览卡片 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👁️</span>
              Preview
            </h4>
            <div className="bg-white p-4 rounded border">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {state.data.full_name as string || 'Your Name'}
                </h3>
                <div className="text-gray-600 mt-2 space-y-1">
                  {state.data.email && (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📧</span>
                      {state.data.email as string}
                    </div>
                  )}
                  {state.data.phone && (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📞</span>
                      {state.data.phone as string}
                    </div>
                  )}
                  {state.data.location && (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📍</span>
                      {state.data.location as string}
                    </div>
                  )}
                </div>
                <div className="flex justify-center space-x-4 mt-3">
                  {state.data.website && (
                    <a href={state.data.website as string} className="text-blue-600 hover:underline text-sm">
                      🌐 Website
                    </a>
                  )}
                  {state.data.linkedin_url && (
                    <a href={state.data.linkedin_url as string} className="text-blue-600 hover:underline text-sm">
                      💼 LinkedIn
                    </a>
                  )}
                  {state.data.github_url && (
                    <a href={state.data.github_url as string} className="text-blue-600 hover:underline text-sm">
                      💻 GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This is how your contact information will appear at the top of your resume.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resume...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* 页面标题栏 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewResume ? 'Create New Resume' : 'Edit Resume'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Step {STEPS.findIndex(step => step.id === state.currentStep) + 1} of {STEPS.length}: {STEPS.find(step => step.id === state.currentStep)?.label}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {state.isDirty && (
                  <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
                {state.isSaving && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Saving...
                  </span>
                )}
                <button
                  onClick={() => saveResume()}
                  disabled={state.isSaving || !state.isDirty}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* 左侧步骤导航 */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-4">Resume Sections</h3>
                <nav className="space-y-2">
                  {STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(step.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        state.currentStep === step.id
                          ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <div>
                        <div className="font-medium">{step.label}</div>
                        <div className="text-sm text-gray-500">Step {index + 1}</div>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* 进度指示器 */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((STEPS.findIndex(step => step.id === state.currentStep) + 1) / STEPS.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((STEPS.findIndex(step => step.id === state.currentStep) + 1) / STEPS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧表单内容区域 */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow p-8">
                {/* 错误提示 */}
                {state.errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                    {state.errors.general}
                  </div>
                )}

                {/* 动态表单内容 */}
                {renderStepContent()}

                {/* 底部导航按钮 */}
                <div className="flex justify-between pt-8 border-t">
                  <button
                    onClick={() => {
                      const stepIndex = STEPS.findIndex(step => step.id === state.currentStep)
                      if (stepIndex > 0) {
                        handleStepChange(STEPS[stepIndex - 1].id)
                      }
                    }}
                    disabled={STEPS.findIndex(step => step.id === state.currentStep) === 0}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push('/dashboard/student/resumes')}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    {STEPS.findIndex(step => step.id === state.currentStep) < STEPS.length - 1 ? (
                      <button
                        onClick={() => {
                          const stepIndex = STEPS.findIndex(step => step.id === state.currentStep)
                          handleStepChange(STEPS[stepIndex + 1].id)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          saveResume()
                          router.push('/dashboard/student/resumes')
                        }}
                        disabled={state.isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Finish & Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}