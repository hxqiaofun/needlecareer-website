'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'jobseeker' | 'employer'
  company_name?: string
  phone?: string
}

interface JobFormData {
  title: string
  location: string
  salary_range: string
  description: string
  requirements: string
}

export default function PostJob() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    location: '',
    salary_range: '',
    description: '',
    requirements: ''
  })
  const [errors, setErrors] = useState<Partial<JobFormData>>({})
  const router = useRouter()

  useEffect(() => {
    checkUserPermission()
  }, [])

  const checkUserPermission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // 获取用户资料
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        router.push('/dashboard')
        return
      }

      // 检查是否为企业用户
      if (profileData.user_type !== 'employer') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
    } catch (error) {
      console.error('权限检查错误:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除该字段的错误
    if (errors[name as keyof JobFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<JobFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = '请输入职位标题'
    }

    if (!formData.location.trim()) {
      newErrors.location = '请输入工作地点'
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入职位描述'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !profile) return

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('用户未登录')
      }

      const jobData = {
        title: formData.title.trim(),
        company_name: profile.company_name || profile.full_name,
        location: formData.location.trim(),
        salary_range: formData.salary_range.trim() || null,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        employer_id: user.id
      }

      const { error } = await supabase
        .from('jobs')
        .insert(jobData)

      if (error) {
        throw error
      }

      // 发布成功，跳转回仪表板
      router.push('/dashboard?success=job_posted')

    } catch (error: any) {
      console.error('发布职位错误:', error)
      const errorMessage = error?.message || error?.toString() || '未知错误'
      alert('发布失败：' + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">权限不足</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              <Link href="/">职聘网</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                返回仪表板
              </Link>
              <span className="text-gray-600">欢迎，{profile.full_name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">发布新职位</h1>
            <p className="mt-2 text-gray-600">
              填写以下信息来发布您的职位需求
            </p>
          </div>

          {/* 发布表单 */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 职位标题 */}
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      职位标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="如：前端开发工程师"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  {/* 工作地点 */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      工作地点 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="如：北京朝阳区"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>

                  {/* 薪资范围 */}
                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                      薪资范围
                    </label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="如：10k-15k"
                    />
                  </div>

                  {/* 公司名称（只读） */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      公司名称
                    </label>
                    <input
                      type="text"
                      value={profile.company_name || profile.full_name}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      公司名称来自您的账户信息，如需修改请前往个人设置
                    </p>
                  </div>
                </div>
              </div>

              {/* 详细信息 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">详细信息</h2>
                
                <div className="space-y-6">
                  {/* 职位描述 */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      职位描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="请详细描述职位的工作内容、职责等..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  {/* 职位要求 */}
                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                      职位要求
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      rows={6}
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请描述对候选人的技能要求、经验要求等..."
                    />
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/dashboard"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? '发布中...' : '发布职位'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}