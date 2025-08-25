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
  created_at: string
}

export default function EmployerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

          {/* 快速操作 */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-2" style={{borderColor: '#c8ffd2'}}>
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

          {/* 已发布职位 */}
          <div className="bg-white shadow-lg rounded-lg p-6 border-2" style={{borderColor: '#c8ffd2'}}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">
                Published Jobs ({jobs.length})
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
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border-2 rounded-lg p-4 hover:shadow-md transition-all hover:opacity-90" style={{borderColor: '#c8ffd2', backgroundColor: '#fafafa'}}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-black">{job.title}</h3>
                        <p className="text-gray-700 text-sm font-medium">{job.location} • {job.salary_range}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium">
                          Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-black hover:opacity-70 text-sm font-bold transition-opacity px-2 py-1 rounded" style={{backgroundColor: '#c8ffd2'}}>
                          Edit
                        </button>
                        <button className="text-white hover:bg-red-700 text-sm font-bold transition-colors px-2 py-1 rounded bg-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}