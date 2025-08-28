import React, { useState } from 'react';
import { User, Mail, Phone, Star, Heart, Award, Target, Calendar, Bell } from 'lucide-react';

export default function DesignSystemDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">表单设计系统演示</h1>
          <p className="text-lg text-gray-600">品牌绿色主题的表单和卡片组件</p>
        </div>

        {/* 表单部分 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">表单样式演示</h2>
          
          <div className="max-w-2xl mx-auto bg-white shadow-sm border-2 rounded-lg p-8" style={{ borderColor: '#c8ffd2' }}>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm border-0 rounded-full focus:ring-2 focus:ring-black focus:outline-none"
                  style={{ backgroundColor: '#c8ffd2' }}
                  placeholder="请输入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm border-0 rounded-full focus:ring-2 focus:ring-black focus:outline-none"
                  style={{ backgroundColor: '#c8ffd2' }}
                  placeholder="请输入邮箱地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  电话号码
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm border-0 rounded-full focus:ring-2 focus:ring-black focus:outline-none"
                  style={{ backgroundColor: '#c8ffd2' }}
                  placeholder="请输入电话号码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  留言内容
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 text-sm border-0 rounded-lg focus:ring-2 focus:ring-black focus:outline-none resize-none"
                  style={{ backgroundColor: '#c8ffd2' }}
                  placeholder="请输入您的留言内容"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-black focus:outline-none"
                >
                  提交表单
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 基础卡片部分 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">基础卡片样式</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer" style={{ borderColor: '#c8ffd2' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">产品特性</h3>
              <p className="text-gray-600 mb-4">
                这是一个基础卡片的演示，展示了白色背景、品牌绿色边框和阴影效果。
              </p>
              <div className="text-sm text-gray-500">
                悬停查看透明度变化效果
              </div>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer" style={{ borderColor: '#c8ffd2' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">用户体验</h3>
              <p className="text-gray-600 mb-4">
                优雅的圆角设计和适中的内边距，为用户提供舒适的视觉体验。
              </p>
              <div className="text-sm text-gray-500">
                简洁而实用的设计风格
              </div>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer" style={{ borderColor: '#c8ffd2' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">品牌一致性</h3>
              <p className="text-gray-600 mb-4">
                统一的品牌绿色元素贯穿整个设计系统，确保视觉一致性。
              </p>
              <div className="text-sm text-gray-500">
                保持品牌识别度
              </div>
            </div>
          </div>
        </div>

        {/* 特色卡片 (Hero Cards) 部分 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">特色卡片 (Hero Cards)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 大图标卡片 */}
            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Star className="w-10 h-10 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">优质服务</h3>
              <p className="text-gray-600">
                提供专业、高效的服务体验，满足用户的各种需求和期望。
              </p>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Heart className="w-10 h-10 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">用户至上</h3>
              <p className="text-gray-600">
                以用户为中心的设计理念，创造温暖贴心的产品体验。
              </p>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Award className="w-10 h-10 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">卓越品质</h3>
              <p className="text-gray-600">
                追求卓越，不断创新，为用户提供最优质的产品和服务。
              </p>
            </div>

            {/* 小图标卡片 */}
            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Target className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">精准定位</h3>
              <p className="text-gray-600">
                准确把握用户需求，提供个性化的解决方案。
              </p>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Calendar className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">及时响应</h3>
              <p className="text-gray-600">
                快速响应用户需求，确保服务的时效性和可靠性。
              </p>
            </div>

            <div className="bg-white shadow-sm border-2 rounded-lg p-8 hover:opacity-80 transition-opacity cursor-pointer text-center" style={{ borderColor: '#c8ffd2' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#c8ffd2' }}>
                <Bell className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能提醒</h3>
              <p className="text-gray-600">
                智能化的提醒功能，帮助用户不错过重要信息。
              </p>
            </div>
          </div>
        </div>

        {/* 设计规范说明 */}
        <div className="bg-white shadow-sm border-2 rounded-lg p-8" style={{ borderColor: '#c8ffd2' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">设计规范说明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">表单输入框</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 背景色：#c8ffd2（品牌绿）</li>
                <li>• 边框：无边框设计</li>
                <li>• 圆角：rounded-full（胶囊形）</li>
                <li>• 焦点状态：黑色环形高亮</li>
                <li>• 内边距：px-4 py-2</li>
                <li>• 字体大小：text-sm</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">表单标签</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 颜色：text-gray-800</li>
                <li>• 字重：font-medium</li>
                <li>• 字体大小：text-sm</li>
                <li>• 下边距：mb-2</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基础卡片</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 背景：bg-white</li>
                <li>• 阴影：shadow-sm</li>
                <li>• 边框：2px #c8ffd2</li>
                <li>• 圆角：rounded-lg</li>
                <li>• 内边距：p-8</li>
                <li>• 悬停效果：opacity-80</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">特色卡片</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 基础样式继承基础卡片</li>
                <li>• 圆形图标背景：#c8ffd2</li>
                <li>• 大图标容器：w-20 h-20</li>
                <li>• 小图标容器：w-16 h-16</li>
                <li>• 居中对齐布局</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}