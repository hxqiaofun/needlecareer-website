'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

// Google 注册表单组件
function GoogleSignupForm() {
  const router = useRouter()
  const [userType, setUserType] = useState<'student' | 'employer'>('student')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGoogleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userType === 'employer' && !companyName.trim()) {
      setMessage('Please enter your company name.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 将用户选择的类型存储到 localStorage
      localStorage.setItem('pendingUserType', userType)
      localStorage.setItem('pendingCompanyName', companyName)

      // 只使用生产环境 URL
      const redirectTo = 'https://demo.needlecareer.com/auth/callback'

      console.log('Starting Google signup with user type:', userType)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        setMessage('Google sign up failed: ' + error.message)
        setLoading(false)
      }
      // 如果成功，用户会被重定向到 Google，然后回到 callback 页面
    } catch (error) {
      setMessage('Google sign up error, please try again')
      console.error('Google sign up error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: '#c8ffd2'}}>
          <span className="text-2xl">🚀</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sign up with Google
        </h1>
        <p className="text-gray-600">
          First, tell us about yourself to create your personalized experience.
        </p>
      </div>

      <form onSubmit={handleGoogleSignup} className="space-y-6">
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
                  <div className="font-medium text-gray-900">🎓 Student</div>
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
                  <div className="font-medium text-gray-900">🏢 Employer</div>
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
              Company Name *
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

        {/* Continue with Google Button */}
        <button
          type="submit"
          disabled={loading || (userType === 'employer' && !companyName.trim())}
          className={`w-full py-3 text-lg font-bold transition-colors ${
            loading || (userType === 'employer' && !companyName.trim())
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-gray-500 text-[#c8ffd2] hover:bg-gray-600'
          }`}
        >
          {loading ? 'Connecting to Google...' : '🚀 Continue with Google'}
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

        {/* Back to Regular Sign Up */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ← Back to regular sign up
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>By continuing with Google, you agree to our Terms of Service and Privacy Policy</p>
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
          Please wait while we prepare the Google sign up.
        </p>
      </div>
    </div>
  )
}

export default function GoogleSignup() {
  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <Suspense fallback={<LoadingFallback />}>
          <GoogleSignupForm />
        </Suspense>
      </main>
    </div>
  )
}