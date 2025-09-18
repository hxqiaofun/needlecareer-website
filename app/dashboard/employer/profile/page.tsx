'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface EmployerProfile {
  id: string
  email: string
  full_name: string
  user_type: 'employer'
  company_name: string
  phone?: string
  company_logo_url?: string
  company_description?: string
  company_website?: string
  industry?: string
  company_size?: string
  company_location?: string
  contact_info?: any
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Marketing & Advertising',
  'Real Estate',
  'Transportation',
  'Entertainment',
  'Non-profit',
  'Government',
  'Agriculture',
  'Energy',
  'Other'
]

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
]

export default function EmployerProfile() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  // 表单状态
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    phone: '',
    company_description: '',
    company_website: '',
    industry: '',
    company_size: '',
    company_location: '',
    contact_phone: '',
    contact_email: ''
  })

  useEffect(() => {
    checkUserAndLoadProfile()
  }, [])

  const checkUserAndLoadProfile = async () => {
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

      if (!profileData || profileData.user_type !== 'employer') {
        router.push('/dashboard/student')
        return
      }

      setProfile(profileData)
      
      // 初始化表单数据
      setFormData({
        company_name: profileData.company_name || '',
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        company_description: profileData.company_description || '',
        company_website: profileData.company_website || '',
        industry: profileData.industry || '',
        company_size: profileData.company_size || '',
        company_location: profileData.company_location || '',
        contact_phone: profileData.contact_info?.phone || '',
        contact_email: profileData.contact_info?.email || profileData.email || ''
      })
    } catch (error) {
      console.error('获取用户资料错误:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    // 验证文件类型和大小
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a PNG, JPG, JPEG, GIF, or WebP image file' })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      setMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })
    
    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      // 上传到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resume-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('resume-files')
        .getPublicUrl(filePath)

      // 更新数据库
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          company_logo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, company_logo_url: publicUrl } : null)
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' })
    } catch (error: any) {
      console.error('Logo upload error:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to upload logo. Please try again.' 
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || saving) return

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // 准备更新数据
      const updateData = {
        company_name: formData.company_name,
        full_name: formData.full_name,
        phone: formData.phone,
        company_description: formData.company_description,
        company_website: formData.company_website,
        industry: formData.industry,
        company_size: formData.company_size,
        company_location: formData.company_location,
        contact_info: {
          phone: formData.contact_phone,
          email: formData.contact_email
        },
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', profile.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // 3秒后跳转回仪表板
      setTimeout(() => {
        router.push('/dashboard/employer')
      }, 2000)
    } catch (error) {
      console.error('更新资料错误:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      <Header />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">Company Profile</h1>
            <p className="mt-2 text-gray-600 font-medium">
              Complete your company information to attract top talent
            </p>
          </div>

          {/* 消息提示 */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white shadow-lg rounded-lg border-2" style={{borderColor: '#c8ffd2'}}>
              <div className="p-6 space-y-6">
                
                {/* 基本信息部分 */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-bold text-black mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 公司名称 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="Enter company name"
                      />
                    </div>

                    {/* 联系人姓名 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                </div>

                {/* 公司Logo */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-bold text-black mb-4">Company Logo</h2>
                  
                  <div className="flex items-center space-x-6">
                    {/* Logo预览 */}
                    <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      {profile?.company_logo_url ? (
                        <img 
                          src={profile.company_logo_url} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl" style={{ color: '#c8ffd2' }}>
                          {formData.company_name.charAt(0).toUpperCase() || 'C'}
                        </span>
                      )}
                    </div>

                    {/* 上传按钮 */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`inline-block px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                          uploading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        style={{ color: uploading ? undefined : '#c8ffd2' }}
                      >
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: Square image, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* 公司简介 */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-bold text-black mb-4">Company Introduction</h2>
                  
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Company Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.company_description}
                      onChange={(e) => handleInputChange('company_description', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      style={{ backgroundColor: '#c8ffd2' }}
                      placeholder="Describe your company, mission, and what makes it unique..."
                    />
                  </div>
                </div>

                {/* 公司详情 */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-bold text-black mb-4">Company Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 公司网站 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={formData.company_website}
                        onChange={(e) => handleInputChange('company_website', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="https://www.example.com"
                      />
                    </div>

                    {/* 行业领域 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Industry *
                      </label>
                      <select
                        required
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                      >
                        <option value="">Select Industry</option>
                        {INDUSTRY_OPTIONS.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 公司规模 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Company Size *
                      </label>
                      <select
                        required
                        value={formData.company_size}
                        onChange={(e) => handleInputChange('company_size', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                      >
                        <option value="">Select Company Size</option>
                        {COMPANY_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 公司地点 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company_location}
                        onChange={(e) => handleInputChange('company_location', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>
                </div>

                {/* 联系方式 */}
                <div>
                  <h2 className="text-lg font-bold text-black mb-4">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 联系电话 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* 联系邮箱 */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full px-4 py-2 rounded-full border-0 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ backgroundColor: '#c8ffd2' }}
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/employer')}
                  className="text-gray-600 hover:text-black font-bold transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    saving
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  style={{ color: saving ? undefined : '#c8ffd2' }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}