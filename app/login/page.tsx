'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setMessage('Login failed: ' + error.message)
        return
      }

      if (data.user) {
        setMessage('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      setMessage('An error occurred, please try again')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setMessage('')

    try {
      // 只使用生产环境 URL
      const redirectTo = 'https://needlecareer.com/auth/callback'

      console.log('Redirect URL:', redirectTo) // 调试用

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
        setMessage('Google sign in failed: ' + error.message)
        setGoogleLoading(false)
      }
      // 如果成功，用户会被重定向到 Google，然后回到 callback 页面
    } catch (error) {
      setMessage('Google sign in error, please try again')
      console.error('Google sign in error:', error)
      setGoogleLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 使用 Header 组件 */}
      <Header />

      {/* 主要内容区域 - 响应式布局 */}
      <main className="min-h-screen">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* 左侧 - 品牌介绍区域 (手机端隐藏) */}
          <div className="hidden lg:flex bg-white items-top justify-center px-8 py-5 lg:py-14">
            <div className="max-w-md">
              {/* Needle Logo */}
              <div className="mb-8">
                <img 
                  src="/images/needle_600x116.png" 
                  alt="Needle" 
                  className="w-full max-w-xs object-contain"
                />
              </div>
              
              {/* 标语 */}
              <div className="mb-8">
                <p className="text-xl lg:text-2xl text-black font-medium leading-tight">
                  Welcome back to NeedleCareer.
                </p>
                <p className="text-xl lg:text-2xl text-black font-bold mt-2">
                  Sign in to continue.
                </p>
              </div>

              {/* 注册链接 */}
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-black font-medium hover:underline transition-colors">
                  sign up
                </Link>
              </div>
            </div>
          </div>

          {/* 右侧 - 登录表单区域 (手机端全宽) */}
          <div className="flex items-top justify-center px-8 py-14 lg:col-span-1 col-span-2" style={{backgroundColor: '#ffffffff'}}>
            <div className="w-full max-w-md">
              {/* 登录表单 */}
              <div className="space-y-6">
                {/* Continue with Google Button - 置顶 */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className={`w-full py-2 text-lg font-bold transition-colors ${
                    googleLoading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gray-500 text-[#c8ffd2] hover:bg-gray-600'
                  }`}
                >
                  {googleLoading ? 'Signing in...' : '🚀 Continue with Google'}
                </button>

                {/* OR divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-600 font-medium" style={{backgroundColor: '#ffffff'}}>OR</span>
                  </div>
                </div>

                {/* Email/Password Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                      style={{backgroundColor: '#c8ffd2'}}
                      placeholder="johnsmith@gmail.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black pr-10"
                        style={{backgroundColor: '#c8ffd2'}}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        👁
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Sign in Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 text-lg font-bold transition-colors ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                    style={!loading ? {color: '#c8ffd2'} : {}}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                {/* Sign up link */}
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-black font-medium hover:underline transition-colors">
                    Sign up
                  </Link>
                </div>

                {/* 消息显示 */}
                {message && (
                  <div className={`p-3 rounded text-sm font-medium ${
                    message.includes('successful') 
                      ? 'bg-white text-green-700' 
                      : 'bg-white text-red-700'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}