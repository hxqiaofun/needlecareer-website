'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PT_Sans } from 'next/font/google'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

export default function Login() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

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
        setMessage('登录失败: ' + error.message)
        return
      }

      if (data.user) {
        setMessage('登录成功！正在跳转...')
        // 跳转到仪表板
        router.push('/dashboard')
      }
    } catch (error) {
      setMessage('发生错误，请重试')
      console.error('登录错误:', error)
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
                message.includes('成功') 
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