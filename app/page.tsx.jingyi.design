"use client"

import Link from 'next/link'
import { PT_Sans, PT_Mono } from 'next/font/google'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

const ptMono = PT_Mono({ 
  weight: ['400'],
  subsets: ['latin'] 
})

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
  company_name?: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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

  const handleDashboardClick = () => {
    if (profile?.user_type === 'student') {
      router.push('/dashboard/student')
    } else if (profile?.user_type === 'employer') {
      router.push('/dashboard/employer')
    } else {
      router.push('/dashboard')
    }
  }

  // 自定义英雄区域内容（用于已登录用户的个性化欢迎）
  const heroContent = (
    <>
      <img 
        src="/images/needlecareer.png" 
        alt="Needlecareer" 
        className="mx-auto mb-1 max-w-full max-h-32 md:max-h-48 lg:max-h-64 object-contain"
      />
      
      {/* 登录状态欢迎消息 */}
      {user && profile && (
        <div className="mt-6">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
            Welcome back, {profile.full_name}! 👋
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {profile.user_type === 'employer' ? (
              <Link href="/dashboard/post-job">
                <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                  Post a Job 📝
                </button>
              </Link>
            ) : (
              <Link href="/browse-jobs">
                <button className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                  Browse Jobs 💼
                </button>
              </Link>
            )}
            <button 
              onClick={handleDashboardClick}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
            >
              Go to Dashboard 🏠
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 使用 Header 组件，显示英雄区域和自定义内容 */}
      <Header 
        showHeroSection={true} 
        heroContent={heroContent}
      />

      {/* 主要内容区域 */}
      <main>
        {/* 标语区域 */}
        <section className="bg-white px-6 py-2">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl lg:text-4xl mb-10 text-right font-medium text-[#7b7f80]">
              From overlooked to unforgettable.
            </h2>
          </div>
        </section>

        {/* 邮箱订阅区域 */}
        <section className="bg-white px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <input
                  type="email"
                  placeholder="hi@needlecareer.com"
                  className="w-full px-6 py-4 text-xl border-2 focus:outline-none focus:border-green-500"
                  style={{
                    borderColor: '#c8ffd2',
                    backgroundColor: '#fafafaff'
                  }}
                />
              </div>
              <button className="bg-black px-8 py-4 text-xl font-bold hover:bg-gray-800 transition-colors w-full md:w-auto" style={{color: '#c8ffd2'}}>
                Join
              </button>
            </div>
          </div>
        </section>

        {/* 功能介绍区域 */}
        <section className="bg-gray-50 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* 求职者区域 */}
              <div className="bg-white rounded-lg p-8 shadow-sm border-2 hover:opacity-80 transition-colors" style={{borderColor: '#c8ffd2'}}>
                <div className="text-center">
                  <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#c8ffd2'}}>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    寻找机会
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    发现适合你的职位，展示你的才能，让雇主主动找到你
                  </p>
                  {user && profile?.user_type === 'student' ? (
                    <Link href="/browse-jobs">
                      <button className="text-white py-3 px-8 text-lg font-medium hover:opacity-80 transition-colors" style={{backgroundColor: '#4ade80'}}>
                        浏览职位
                      </button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <button className="text-white py-3 px-8 text-lg font-medium hover:opacity-80 transition-colors" style={{backgroundColor: '#4ade80'}}>
                        开始求职
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              {/* 招聘者区域 */}
              <div className="bg-white rounded-lg p-8 shadow-sm border-2 hover:opacity-80 transition-colors" style={{borderColor: '#c8ffd2'}}>
                <div className="text-center">
                  <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#c8ffd2'}}>
                    <span className="text-2xl">🏢</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    发现人才
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    发布职位，寻找合适的候选人，建立优秀的团队
                  </p>
                  {user && profile?.user_type === 'employer' ? (
                    <button
                      onClick={handleDashboardClick}
                      className="bg-black text-white py-3 px-8 text-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      管理职位
                    </button>
                  ) : (
                    <Link href="/register">
                      <button className="bg-black text-white py-3 px-8 text-lg font-medium hover:bg-gray-800 transition-colors">
                        开始招聘
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 特色展示区域 */}
        <section className="bg-white px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                为什么选择 Needle？
              </h2>
              <p className="text-xl text-gray-600">
                让每个人才都被看见，让每个机会都被发现
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#c8ffd2'}}>
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">快速匹配</h3>
                <p className="text-gray-600">智能算法帮助求职者和雇主快速找到最佳匹配</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#c8ffd2'}}>
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">个性展示</h3>
                <p className="text-gray-600">展示真实的你，让个性和才能成为亮点</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#c8ffd2'}}>
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">真诚连接</h3>
                <p className="text-gray-600">建立真实、有意义的职业连接</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">Needle</div>
          <p className="text-gray-400 mb-6">
            From overlooked to unforgettable.
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#eff4f0ff'}}>隐私政策</a>
            <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#eff4f0ff'}}>服务条款</a>
            <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#eff4f0ff'}}>联系我们</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
            © 2025 Needle. 让每个人才都闪闪发光.
          </div>
        </div>
      </footer>
    </div>
  )
}