'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PT_Sans } from 'next/font/google'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 处理 OAuth 回调
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Authentication failed. Please try again.')
          setLoading(false)
          return
        }

        const session = data.session
        if (session?.user) {
          // 检查用户是否已有 profile
          const { data: existingProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is expected for new users
            console.error('Profile check error:', profileError)
            setError('Profile check failed. Please try again.')
            setLoading(false)
            return
          }

          if (!existingProfile) {
            // 新用户，需要创建 profile
            await createNewUserProfile(session.user)
          } else {
            // 现有用户，检查是否需要更新信息
            await handleExistingUser(existingProfile, session.user)
          }

          // 清理 localStorage
          localStorage.removeItem('pendingUserType')
          localStorage.removeItem('pendingCompanyName')

          // 重定向到首页
          router.push('/')
        } else {
          setError('No user session found. Please try again.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  const createNewUserProfile = async (user: any) => {
    try {
      // 检查是否从注册页面来的（有预设的用户类型）
      const pendingUserType = localStorage.getItem('pendingUserType')
      const pendingCompanyName = localStorage.getItem('pendingCompanyName')

      if (pendingUserType) {
        // 从注册页面来的，直接创建资料
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        const email = user.email || ''

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: email,
            full_name: fullName,
            user_type: pendingUserType,
            company_name: pendingUserType === 'employer' ? pendingCompanyName : null
          })

        if (insertError) {
          throw insertError
        }

        console.log('New user profile created successfully from registration')
      } else {
        // 直接 Google 登录的新用户，需要选择用户类型
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        const email = user.email || ''
        
        // 重定向到用户类型选择页面，传递用户信息
        const params = new URLSearchParams({
          userId: user.id,
          email: email,
          fullName: fullName
        })
        
        router.push(`/select-user-type?${params.toString()}`)
        return // 不要继续执行后面的代码
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const handleExistingUser = async (existingProfile: any, user: any) => {
    try {
      // 检查是否需要更新用户信息
      const updates: any = {}
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''

      // 更新 full_name 如果 Google 提供了更新的信息
      if (fullName && fullName !== existingProfile.full_name) {
        updates.full_name = fullName
      }

      // 如果有更新，则更新 profile
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString()
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        } else {
          console.log('User profile updated successfully')
        }
      }

      console.log('Existing user logged in successfully')
    } catch (error) {
      console.error('Error handling existing user:', error)
      throw error
    }
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-center p-8">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/register')}
                className="w-full px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                style={{color: '#c8ffd2'}}
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
      <div className="text-center p-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#c8ffd2'}}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing your sign-up...</h1>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  )
}