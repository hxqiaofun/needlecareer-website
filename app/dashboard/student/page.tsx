'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
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

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const loadRecentJobs = async () => {
    try {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5) // 只获取最新的5个职位作为推荐
      
      setRecentJobs(jobsData || [])
    } catch (error) {
      console.error('获取推荐职位错误:', error)
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

      // 确保是学生用户
      if (profileData.user_type !== 'student') {
        router.push('/dashboard/employer')
        return
      }

      setProfile(profileData)
      
      // 加载推荐职位
      await loadRecentJobs()
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
            <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
            <p className="mt-2 text-gray-600">
              管理您的求职信息和申请记录
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
                <p className="mt-1 text-sm text-gray-900">学生</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">电话</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center">
                <div className="text-2xl mb-2">📄</div>
                <div>完善简历</div>
              </button>
              <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center">
                <div className="text-2xl mb-2">🔍</div>
                <div>浏览职位</div>
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div>申请记录</div>
              </button>
            </div>
          </div>

          {/* 推荐职位 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">推荐职位</h2>
              <button 
                onClick={loadRecentJobs}
                className="text-sm text-blue-600 hover:text-blue-800"
                title="刷新推荐"
              >
                🔄 刷新
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                暂无职位推荐，请稍后再试
              </p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600 text-sm">{job.company_name}</p>
                        <p className="text-gray-600 text-sm">{job.location} • {job.salary_range}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          发布于 {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">查看详情</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">立即申请</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 申请统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📊</div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">申请职位</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">✉️</div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">收到回复</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🎯</div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">面试邀请</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}