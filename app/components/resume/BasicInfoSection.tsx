'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface BasicInfoSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 表单验证
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'website':
      case 'linkedin_url':
      case 'github_url':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          newErrors[field] = 'Please enter a valid URL (include http:// or https://)';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        delete newErrors[field];
    }

    setErrors(newErrors);
  };

  const handleChange = (field: keyof ResumeDetail, value: string) => {
    onChange(field, value);
    validateField(field, value);
  };

  return (
    <div className="space-y-6">
      {/* 节标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-600 mt-1">
          Add your personal information and contact details
        </p>
      </div>

      {/* 个人信息区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 姓名 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.full_name || ''}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="e.g., John Doe"
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
          )}
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
              errors.email 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* 电话 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
              errors.phone 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* 地址 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="City, State, Country"
          />
        </div>
      </div>

      {/* 在线链接区域 */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Presence</h3>
        <div className="space-y-4">
          {/* 个人网站 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Website
            </label>
            <input
              type="url"
              value={data.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                errors.website 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="https://yourwebsite.com"
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={data.linkedin_url || ''}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                errors.linkedin_url 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="https://linkedin.com/in/your-profile"
            />
            {errors.linkedin_url && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>
            )}
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={data.github_url || ''}
              onChange={(e) => handleChange('github_url', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                errors.github_url 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
              }`}
              placeholder="https://github.com/your-username"
            />
            {errors.github_url && (
              <p className="text-red-500 text-sm mt-1">{errors.github_url}</p>
            )}
          </div>
        </div>
      </div>

      {/* 职业概述区域 */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
        <div className="space-y-4">
          {/* 职业概述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <textarea
              value={data.professional_summary || ''}
              onChange={(e) => handleChange('professional_summary', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
              placeholder="Brief overview of your professional background, key skills, and career goals..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {(data.professional_summary || '').length}/500 characters
            </p>
          </div>

          {/* 职业目标 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Objective
            </label>
            <textarea
              value={data.career_objective || ''}
              onChange={(e) => handleChange('career_objective', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical"
              placeholder="What are your career goals and aspirations?"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(data.career_objective || '').length}/300 characters
            </p>
          </div>
        </div>
      </div>

      {/* 保存提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">💡</div>
          <div>
            <h4 className="text-blue-900 font-medium">Pro Tips</h4>
            <ul className="text-blue-800 text-sm mt-1 space-y-1">
              <li>• Use a professional email address</li>
              <li>• Keep your summary concise and impactful</li>
              <li>• Include links to your professional profiles</li>
              <li>• Make sure all contact information is up-to-date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}