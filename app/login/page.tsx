'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PT_Sans } from 'next/font/google'
import Header from '../components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

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
        // 跳转到首页而不是dashboard
        router.push('/')
      }
    } catch (error) {
      setMessage('An error occurred, please try again')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 使用 Header 组件 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-sm w-full space-y-2">
          {/* Needle Logo and Welcome */}
          <div className="text-center">
            <div className="mb-1">
              <img 
                src="/images/needle_600x116.png" 
                alt="Needle" 
                className="h-22 mx-auto object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-black mb-8">Welcome</h1>
            <p className="text-gray-500 text-xl">
              Please log in to continue to Needle Career
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-0"
                style={{backgroundColor: '#c8ffd2'}}
                placeholder="Email address"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-0 pr-10"
                style={{backgroundColor: '#c8ffd2'}}
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                👁
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Forgot password?
              </Link>
            </div>

            {/* Log in Button (Black) */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-1 text-lg mt-10 font-bold transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800'
              }`}
              style={!loading ? {color: '#c8ffd2'} : {}}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>

            {/* OR divider */}
              <div className="relative mt-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-400"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-600 font-medium" style={{backgroundColor: '#c8ffd2'}}>OR</span>
                </div>
              </div>

            {/* Login with Google (Gray) */}
            <button
              type="button"
              className="w-full text-lg py-1 bg-gray-400 text-white font-bold hover:bg-gray-500 transition-colors"
            >
              Log in with Google
            </button>

            {/* 消息显示 */}
            {message && (
              <div className={`p-3 rounded text-sm font-medium text-center ${
                message.includes('successful') || message.includes('成功')
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-black font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}