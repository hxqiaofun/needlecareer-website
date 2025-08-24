'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function Register() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'student',
    companyName: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 清理移动端菜单状态
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 防止背景滚动
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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
      {/* 顶部导航栏 */}
      <nav className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
           <Link href="/">
             <img 
               src="/images/Needle_logo.png" 
               alt="Needle Logo" 
               className="h-8 md:h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
             />
           </Link>
          
          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-3">
            <Link href="/register">
              <button className="bg-black px-4 py-0.5 text-lg font-bold hover:bg-gray-800 transition-colors" style={{color: '#c8ffd2'}}>
                Sign Up
              </button>
            </Link>
            <Link href="/login">
              <button className="px-4 py-0.5 text-xl font-bold hover:opacity-60 transition-colors" style={{backgroundColor: '#c8ffd2', color: 'black'}}>
                Log in
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 导航菜单栏 */}
      <div className="bg-white px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-3">
            {/* 左侧语言切换 */}
            <span className="text-lg md:text-xl text-gray-800 font-bold">中/ENG</span>
            
            {/* 桌面端导航菜单 */}
            <div className="hidden md:flex items-center space-x-6 text-xl text-gray-800 font-bold">
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>Students</a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>Employers</a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>Events</a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>Resources</a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>About Us</a>
            </div>

            {/* 手机端汉堡菜单按钮 */}
            <button 
              className="md:hidden flex flex-col space-y-1 p-2 z-50 relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              type="button"
            >
              <div className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>
          </div>

          {/* 手机端悬浮下拉菜单 */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 shadow-2xl z-40 transform transition-all duration-300">
              <div className="flex flex-col text-white">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700 text-left"
                >
                  Students
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700 text-left"
                >
                  Employers
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700 text-left"
                >
                  Events
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700 text-left"
                >
                  Resources
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors text-left"
                >
                  About Us
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 背景遮罩 */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
      </div>

      {/* 全宽度装饰横线 */}
      <div className="w-full h-3 mb-0" style={{backgroundColor: '#c8ffd2'}}></div>

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
                    <span className="px-2 text-gray-600 font-medium" style={{backgroundColor: '#c8ffd2'}}>OR</span>
                  </div>
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  className="w-full py-1 mt-1 text-lg font-bold bg-gray-500 text-white hover:bg-gray-600 transition-colors"
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