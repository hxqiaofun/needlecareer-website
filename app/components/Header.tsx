"use client"

import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
  company_name?: string
}

interface HeaderProps {
  showHeroSection?: boolean  // 是否显示绿色英雄区域
  heroContent?: React.ReactNode  // 自定义英雄区域内容
  className?: string  // 额外的CSS类
}

export default function Header({ 
  showHeroSection = false, 
  heroContent = null,
  className = "" 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 检查用户登录状态
  useEffect(() => {
    checkUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleDashboardClick = () => {
    setIsUserMenuOpen(false)
    if (profile?.user_type === 'student') {
      router.push('/dashboard/student')
    } else if (profile?.user_type === 'employer') {
      router.push('/dashboard/employer')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={`${ptSans.className} ${className}`}>
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
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user && profile ? (
              // 已登录用户：显示用户名和下拉菜单
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-0.5 text-xl font-bold hover:opacity-60 transition-colors"
                  style={{backgroundColor: '#c8ffd2', color: 'black'}}
                >
                  <span>
                    {profile.full_name || profile.email}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleDashboardClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8ffd2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">🏠</span>
                        Dashboard
                      </div>
                    </button>
                    {profile?.user_type === 'employer' ? (
                      <Link
                        href="/dashboard/post-job"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8ffd2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">📝</span>
                          Post a Job
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href="/browse-jobs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8ffd2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">💼</span>
                          Browse Jobs
                        </div>
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8ffd2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">🚪</span>
                        Log out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 未登录用户：显示登录和注册按钮
              <>
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
              </>
            )}
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
              <Link href="/browse-jobs" className="hover:opacity-80 transition-colors" style={{color: '#191919ff'}}>
                Jobs
              </Link>
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
                <a 
                  href="#" 
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Students
                </a>
                <a 
                  href="#" 
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Employers
                </a>
                <Link
                  href="/browse-jobs"
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Jobs
                </Link>
                <a 
                  href="#" 
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </a>
                <a 
                  href="#" 
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Resources
                </a>
                <a 
                  href="#" 
                  className="px-6 py-4 text-lg font-bold hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </a>
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
      <div className="w-full h-3" style={{backgroundColor: '#c8ffd2'}}></div>

      {/* 可选的英雄区域 */}
      {showHeroSection && (
        <section className="mt-8 px-6 pt-8 py-16 md:py-14" style={{backgroundColor: '#c8ffd2'}}>
          <div className="max-w-7xl mx-auto text-center">
            {heroContent || (
              <img 
                src="/images/needlecareer.png"
                alt="Neddlecareer" 
                className="mx-auto mb-8 max-w-full max-h-32 md:max-h-48 lg:max-h-64 object-contain"
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}