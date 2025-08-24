'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
  company_name?: string
  phone?: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserAndRedirect()
  }, [])

  const checkUserAndRedirect = async () => {
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
        router.push('/login')
        return
      }

      // 根据用户类型重定向到对应的仪表板
      if (profileData.user_type === 'employer') {
        router.push('/dashboard/employer')
      } else if (profileData.user_type === 'student') {
        router.push('/dashboard/student')
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('用户检查错误:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-gray-600">
        {loading ? '正在加载...' : '重定向中...'}
      </div>
    </div>
  )
}