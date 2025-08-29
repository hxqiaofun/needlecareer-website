'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'student',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // 注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setMessage('注册失败: ' + authError.message)
        return
      }

      if (authData.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            user_type: formData.userType,
            company_name: formData.userType === 'employer' ? formData.companyName : null
          })

        if (profileError) {
          setMessage('资料创建失败: ' + profileError.message)
          return
        }

        setMessage('注册成功！请检查邮箱进行验证。')
      }
    } catch (error) {
      setMessage('发生错误，请重试')
      console.error('注册错误:', error)
    } finally {
      setLoading(false)
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
                  Let Needle help you shine the haystack.
                </p>
                <p className="text-xl lg:text-2xl text-black font-bold mt-2">
                  Join today.
                </p>
              </div>

              {/* 登录链接 */}
              <div className="text-sm text-gray-600">
                Already have your account?{' '}
                <Link href="/login" className="text-black font-medium hover:underline transition-colors">
                  log in
                </Link>
              </div>
            </div>
          </div>

          {/* 右侧 - 注册表单区域 (手机端全宽) */}
          <div className="flex items-top justify-center px-8 py-14 lg:col-span-1 col-span-2" style={{backgroundColor: '#ffffffff'}}>
            <div className="w-full max-w-md">
              {/* 注册表单 */}
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    I am a
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                    style={{backgroundColor: '#c8ffd2'}}
                  >
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>

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
                      minLength={8}
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
                  <p className="text-xs text-gray-600 mt-1">
                    Use 8 or more characters with uppercase letters, numbers and symbols
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    {formData.userType === 'employer' ? 'Contact Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                    style={{backgroundColor: '#c8ffd2'}}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Company Name (Only for employers) */}
                {formData.userType === 'employer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                      style={{backgroundColor: '#c8ffd2'}}
                      placeholder="Your Company Name"
                    />
                  </div>
                )}

                {/* Sign up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-1 text-lg font-bold transition-colors mt-18 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  style={!loading ? {color: '#c8ffd2'} : {}}
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </button>

                {/* OR divider */}
                <div className="relative mt-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-600 font-medium" style={{backgroundColor: '#ffffff'}}>OR</span>
                  </div>
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  className="w-full py-1 mt-1 text-lg font-bold bg-gray-500 text-[#c8ffd2] hover:bg-gray-600 transition-colors"
                >
                  Sign up with Google
                </button>

                {/* Terms and Privacy */}
                <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                  By continuing, you agree to the{' '}
                  <a href="#" className="text-black hover:underline">Terms of Use</a>,{' '}
                  <a href="#" className="text-black hover:underline">Private Policy</a>, and{' '}
                  Receive a <a href="#" className="text-black hover:underline">Text G@</a>
                </p>

                {/* 消息显示 */}
                {message && (
                  <div className={`p-3 rounded text-sm font-medium ${
                    message.includes('成功') 
                      ? 'bg-white text-green-700' 
                      : 'bg-white text-red-700'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}