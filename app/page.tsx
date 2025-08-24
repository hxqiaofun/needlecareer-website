"use client"

import Link from 'next/link'
import { PT_Sans, PT_Mono } from 'next/font/google'
import { useState } from 'react'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

const ptMono = PT_Mono({ 
  weight: ['400'],
  subsets: ['latin'] 
})

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 顶部导航栏 */}
      <nav className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
           <div>
             <img 
               src="/images/Needle_logo.png" 
               alt="Needle Logo" 
               className="h-8 md:h-10 object-contain"
             />
           </div>
          
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
      <div className="w-full h-3 mb-4" style={{backgroundColor: '#c8ffd2'}}></div>

      {/* 主要内容区域 */}
      <main>
        {/* 绿色英雄区域 */}
        <section className="px-6 pt-14 py-10 md:py-20" style={{backgroundColor: '#c8ffd2'}}>
          <div className="max-w-7xl mx-auto text-center">
            <img 
              src="/images/hi-needle.png" 
              alt="Hi Needle!" 
              className="mx-auto mb-8 max-w-full max-h-32 md:max-h-48 lg:max-h-64 object-contain"
            />
          </div>
        </section>

        {/* 标语区域 */}
        <section className="bg-white px-6 py-2">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
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
                  <Link href="/register">
                    <button className="text-white py-3 px-8 text-lg font-medium hover:opacity-80 transition-colors" style={{backgroundColor: '#4ade80'}}>
                      开始求职
                    </button>
                  </Link>
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
                  <Link href="/register">
                    <button className="bg-black text-white py-3 px-8 text-lg font-medium hover:bg-gray-800 transition-colors">
                      开始招聘
                    </button>
                  </Link>
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