'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

// 将使用 useSearchParams 的组件分离出来
function UserTypeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<'student' | 'employer'>('student')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 从 URL 参数获取用户信息
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')
  const fullName = searchParams.get('fullName')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId || !email || !fullName) {
      setMessage('Missing user information. Please try signing in again.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 创建用户资料
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          user_type: userType,
          company_name: userType === 'employer' ? companyName : null
        })

      if (insertError) {
        setMessage('Failed to create profile: ' + insertError.message)
        return
      }

      // 成功创建后重定向到首页
      setMessage('Profile created successfully! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 1500)

    } catch (error) {
      console.error('Error creating profile:', error)
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#c8ffd2'}}>
          <span className="text-2xl">👋</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to NeedleCareer!
        </h1>
        <p className="text-gray-600">
          To complete your registration, please tell us about yourself.
        </p>
        {fullName && (
          <p className="text-sm text-gray-500 mt-2">
            Signed in as: <span className="font-medium">{fullName}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-3">
            I am a:
          </label>
          <div className="space-y-3">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                userType === 'student' 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUserType('student')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value as 'student')}
                  className="mr-3 text-black focus:ring-black"
                  style={{accentColor: '#c8ffd2'}}
                />
                <div>
                  <div className="font-medium text-gray-900">🎓 Student / Job Seeker</div>
                  <div className="text-sm text-gray-600">Looking for job opportunities</div>
                </div>
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                userType === 'employer' 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUserType('employer')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="employer"
                  checked={userType === 'employer'}
                  onChange={(e) => setUserType(e.target.value as 'employer')}
                  className="mr-3 text-black focus:ring-black"
                  style={{accentColor: '#c8ffd2'}}
                />
                <div>
                  <div className="font-medium text-gray-900">🏢 Employer / Recruiter</div>
                  <div className="text-sm text-gray-600">Looking to hire talent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Name (Only for employers) */}
        {userType === 'employer' && (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="block w-full px-4 py-3 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
              style={{backgroundColor: '#c8ffd2'}}
              placeholder="Enter your company name"
            />
            <p className="text-xs text-gray-600 mt-1">
              This will be displayed on your job postings
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (userType === 'employer' && !companyName.trim())}
          className={`w-full py-3 text-lg font-bold transition-colors ${
            loading || (userType === 'employer' && !companyName.trim())
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
          style={!loading && !(userType === 'employer' && !companyName.trim()) ? {color: '#c8ffd2'} : {}}
        >
          {loading ? 'Creating Profile...' : 'Complete Registration'}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium text-center ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* Help Text */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>You can change this later in your profile settings</p>
      </div>
    </div>
  )
}

// 加载状态组件
function LoadingFallback() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#c8ffd2'}}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Loading...
        </h1>
        <p className="text-gray-600">
          Please wait while we prepare your registration.
        </p>
      </div>
    </div>
  )
}

export default function SelectUserType() {
  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <Suspense fallback={<LoadingFallback />}>
          <UserTypeForm />
        </Suspense>
      </main>
    </div>
  )
}