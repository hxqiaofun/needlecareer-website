"use client"

import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, Briefcase, Home, FileText, ArrowRight } from 'lucide-react'

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
  className?: string
}

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <span className={`inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-xs text-gray-600 border border-black/10 ${className}`}>
    {children}
  </span>
)

const Avatar: React.FC<{ 
  src?: string; 
  alt?: string; 
  fallback?: string; 
  size?: "sm" | "md" | "lg" 
}> = ({ 
  src, 
  alt, 
  fallback, 
  size = "sm" 
}) => {
  const sizes: Record<string, string> = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-medium text-gray-600">{fallback}</span>
      )}
    </div>
  )
}

export default function Header({ className = "" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  if (loading) {
    return (
      <nav className={`sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-md ${ptSans.className} ${className}`}>
        <div className="max-w-[1120px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 md:h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-md ${ptSans.className} ${className}`}>
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/Needle_logo.png" 
              alt="Needle Logo" 
              className="h-8 md:h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Badge>beta</Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <Link href="/browse-jobs" className="hover:text-black transition">
              Jobs
            </Link>
            <a href="#" className="hover:text-black transition">Students</a>
            <a href="#" className="hover:text-black transition">Employers</a>
            <a href="#" className="hover:text-black transition">Resources</a>
            <a href="#" className="hover:text-black transition">About</a>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              // 已登录用户：显示用户名和下拉菜单
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-2xl px-3 py-2 transition"
                >
                  <Avatar 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=c8ffd2&color=000`} 
                    fallback={profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'} 
                    size="sm" 
                  />
                  <span className="hidden md:inline text-sm font-medium">
                    {profile.full_name || profile.email}
                  </span>
                </button>

                {/* 下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-black/10 py-2">
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </button>
                    
                    {profile?.user_type === 'employer' ? (
                      <Link
                        href="/dashboard/post-job"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Post a Job
                      </Link>
                    ) : (
                      <Link
                        href="/browse-jobs"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase className="h-4 w-4" />
                        Browse Jobs
                      </Link>
                    )}
                    
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 未登录用户：显示登录和注册按钮
              <>
                <Link href="/login">
                  <button className="hidden md:inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-gray-700 hover:text-black hover:bg-gray-50">
                    Sign in
                  </button>
                </Link>
                <Link href="/register">
                  <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 bg-black text-white hover:bg-gray-800 hover:translate-y-[-1px]">
                    Join free <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/5 py-4">
            <div className="flex flex-col gap-3">
              <Link 
                href="/browse-jobs" 
                className="py-2 text-sm text-gray-600 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
              <a href="#" className="py-2 text-sm text-gray-600 hover:text-black">Students</a>
              <a href="#" className="py-2 text-sm text-gray-600 hover:text-black">Employers</a>
              <a href="#" className="py-2 text-sm text-gray-600 hover:text-black">Resources</a>
              <a href="#" className="py-2 text-sm text-gray-600 hover:text-black">About</a>
              
              {!user && (
                <div className="pt-3 border-t border-black/5 flex gap-2">
                  <Link href="/login">
                    <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 text-gray-700 hover:text-black hover:bg-gray-50">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 bg-black text-white hover:bg-gray-800">
                      Join free
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}