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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
        <div className="text-xl text-gray-600">未找到用户资料</div>
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
              <span className="text-gray-600">欢迎，{profile.full_name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">企业管理中心</h1>
            <p className="mt-2 text-gray-600">
              管理您的职位发布和候选人
            </p>
          </div>

          {/* 用户信息卡片 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">用户类型</label>
                <p className="mt-1 text-sm text-gray-900">企业招聘方</p>
              </div>
              {profile.company_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">公司名称</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.company_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/dashboard/post-job"
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center transition-colors"
              >
                <div className="text-2xl mb-2">📝</div>
                <div>发布新职位</div>
              </Link>
              <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center">
                <div className="text-2xl mb-2">👥</div>
                <div>查看应聘者</div>
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div>招聘统计</div>
              </button>
            </div>
          </div>

          {/* 已发布职位 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                已发布职位 ({jobs.length})
                <button 
                  onClick={() => refreshJobs()}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  title="刷新列表"
                >
                  🔄
                </button>
              </h2>
              <Link 
                href="/dashboard/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                发布职位
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">
                  还没有发布任何职位，立即发布您的第一个职位吧！
                </p>
                <Link 
                  href="/dashboard/post-job"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  立即发布
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600 text-sm">{job.location} • {job.salary_range}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          发布于 {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">删除</button>
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