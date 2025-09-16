'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'employer'
  company_name?: string
  phone?: string
}

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  salary_range: string
  description?: string
  job_types?: string[]
  created_at: string
}

export default function EmployerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 6 // 每页显示6个职位
  const router = useRouter()

  // 计算分页
  const totalPages = Math.ceil(jobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const currentJobs = jobs.slice(startIndex, startIndex + jobsPerPage)

  useEffect(() => {
    checkUser()
  }, [])

  // 监听发布成功后的刷新
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'job_posted') {
      refreshJobs()
      // 清除 URL 参数
      window.history.replaceState({}, '', '/dashboard/employer')
    }
  }, [])

  const refreshJobs = async (userId?: string) => {
    const targetUserId = userId || user?.id
    if (!targetUserId) return
    
    try {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', targetUserId)
        .order('created_at', { ascending: false })
      
      setJobs(jobsData || [])
    } catch (error) {
      console.error('刷新职位列表错误:', error)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      
      // 获取用户资料
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        router.push('/login')
        return
      }

      // 确保是企业用户
      if (profileData.user_type !== 'employer') {
        router.push('/dashboard/student')
        return
      }

      setProfile(profileData)
      
      // 获取发布的职位
      await refreshJobs(user.id)
    } catch (error) {
      console.error('获取用户信息错误:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // 计算发布时间
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 48) {
      return '1 day ago'
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      const weeks = Math.floor(diffInHours / 168)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
  }

  // 生成公司Logo占位符
  const CompanyLogo = ({ companyName }: { companyName: string }) => (
    <div className="w-16 h-16 bg-black flex items-center justify-center rounded flex-shrink-0">
      <span className="text-white font-bold text-lg" style={{ color: '#c8ffd2' }}>
        {companyName.charAt(0).toUpperCase()}
      </span>
    </div>
  )

  if (loading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">User profile not found</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 使用 Header 组件 */}
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">Employer Dashboard</h1>
            <p className="mt-2 text-gray-600 font-medium">
              Manage your job postings and candidates
            </p>
          </div>

          {/* 用户信息卡片 */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-2" style={{borderColor: '#c8ffd2'}}>
            <h2 className="text-lg font-bold text-black mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black">Name</label>
                <p className="mt-1 text-sm text-gray-700 font-medium">{profile.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-black">Email</label>
                <p className="mt-1 text-sm text-gray-700 font-medium">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-black">User Type</label>
                <p className="mt-1 text-sm text-gray-700 font-medium">Employer</p>
              </div>
              {profile.company_name && (
                <div>
                  <label className="block text-sm font-bold text-black">Company Name</label>
                  <p className="mt-1 text-sm text-gray-700 font-medium">{profile.company_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* 已发布职位 - LinkedIn 风格 */}
          <div className="bg-white shadow-lg rounded-lg p-6 border-2" style={{borderColor: '#c8ffd2'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-black">
                Recently posted jobs
                <button 
                  onClick={() => refreshJobs()}
                  className="ml-2 text-sm hover:opacity-70 transition-opacity"
                  title="Refresh list"
                  style={{color: '#c8ffd2'}}
                >
                  🔄
                </button>
              </h2>
              <Link 
                href="/dashboard/post-job"
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 text-sm font-bold transition-colors"
                style={{color: '#c8ffd2'}}
              >
                Post Job
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4 font-medium">
                  You haven't posted any jobs yet. Post your first job now!
                </p>
                <Link 
                  href="/dashboard/post-job"
                  className="inline-block bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 font-bold transition-colors"
                  style={{color: '#c8ffd2'}}
                >
                  Post Now
                </Link>
              </div>
            ) : (
              <>
                {/* 职位卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-200 relative group"
                      style={{borderColor: '#e5e7eb'}}
                    >
                      {/* 收藏按钮 */}
                      <div className="absolute top-4 right-4">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-green-500">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                      </div>

                      {/* 公司Logo和职位信息 */}
                      <div className="flex items-start space-x-4">
                        <CompanyLogo companyName={job.company_name} />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-black mb-1 pr-8 leading-tight">
                            {job.title}
                          </h3>
                          <p className="text-gray-700 font-medium text-sm mb-1">
                            {job.company_name}
                          </p>
                          <p className="text-gray-500 text-sm mb-3">
                            {job.location}
                          </p>
                          
                          {/* 薪资信息 */}
                          {job.salary_range && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-600">
                                {job.salary_range}
                              </span>
                            </div>
                          )}

                          {/* 工作类型标签 */}
                          {job.job_types && job.job_types.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {job.job_types.slice(0, 2).map((type, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                                  >
                                    {type}
                                  </span>
                                ))}
                                {job.job_types.length > 2 && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    +{job.job_types.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 申请者统计（模拟数据） */}
                          <div className="mb-4">
                            <div className="flex items-center text-gray-500 text-sm">
                              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                              <span className="font-medium">{Math.floor(Math.random() * 50) + 10} candidates applied</span>
                            </div>
                          </div>

                          {/* 发布时间 */}
                          <div className="text-sm font-medium" style={{ color: '#22c55e' }}>
                            {getTimeAgo(job.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button className="text-black hover:opacity-70 text-sm font-bold transition-opacity px-3 py-1 rounded-full border border-black">
                            Edit
                          </button>
                          <button className="text-white hover:bg-red-700 text-sm font-bold transition-colors px-3 py-1 rounded-full bg-red-600">
                            Delete
                          </button>
                        </div>
                        <button className="text-gray-500 hover:text-black text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 分页导航 */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"/>
                      </svg>
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({jobs.length} jobs total)
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        <span>Next</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </button>

                      <Link
                        href="/browse-jobs"
                        className="text-sm font-bold text-black hover:opacity-70 transition-opacity"
                        style={{ color: '#22c55e' }}
                      >
                        Show all jobs
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 快速操作 */}
          <div className="bg-white shadow-lg rounded-lg p-6 border-2" style={{borderColor: '#c8ffd2'}}>
            <h2 className="text-lg font-bold text-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/dashboard/post-job"
                className="p-4 rounded-lg text-center transition-all hover:opacity-90 border-2 border-black"
                style={{backgroundColor: '#c8ffd2'}}
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="text-black font-bold">Post New Job</div>
              </Link>
              <button className="bg-black text-white p-4 rounded-lg hover:bg-gray-800 text-center transition-colors border-2 border-black" style={{color: '#c8ffd2'}}>
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold">View Applicants</div>
              </button>
              <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 text-center transition-colors border-2 border-gray-600" style={{color: '#c8ffd2'}}>
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold">Hiring Statistics</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}