'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  is_current?: boolean;
}

interface ExperienceSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newExperience, setNewExperience] = useState<Experience>({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    achievements: [],
    is_current: false
  });
  const [newAchievement, setNewAchievement] = useState('');

  const experience: Experience[] = (data.experience as Experience[]) || [];

  // 添加新工作经历
  const addExperience = () => {
    if (!newExperience.company.trim() || !newExperience.position.trim()) {
      alert('Please fill in company name and position.');
      return;
    }

    const expToAdd = { ...newExperience };
    if (expToAdd.is_current) {
      expToAdd.end_date = '';
    }

    const updatedExperience = [...experience, expToAdd];
    onChange('experience', updatedExperience);
    
    // 重置表单
    setNewExperience({
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: '',
      achievements: [],
      is_current: false
    });
    setNewAchievement('');
  };

  // 更新工作经历
  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updatedExperience = [...experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    // 如果设置为当前工作，清空结束日期
    if (field === 'is_current' && value) {
      updatedExperience[index].end_date = '';
    }
    
    onChange('experience', updatedExperience);
  };

  // 删除工作经历
  const removeExperience = (index: number) => {
    if (confirm('Are you sure you want to delete this work experience?')) {
      const updatedExperience = [...experience];
      updatedExperience.splice(index, 1);
      onChange('experience', updatedExperience);
      setEditingIndex(-1);
    }
  };

  // 添加成就到新经历
  const addAchievementToNew = () => {
    if (!newAchievement.trim()) return;
    
    setNewExperience({
      ...newExperience,
      achievements: [...newExperience.achievements, newAchievement.trim()]
    });
    setNewAchievement('');
  };

  // 删除新经历的成就
  const removeAchievementFromNew = (achIndex: number) => {
    const achievements = [...newExperience.achievements];
    achievements.splice(achIndex, 1);
    setNewExperience({ ...newExperience, achievements });
  };

  // 添加成就到现有经历
  const addAchievementToExisting = (expIndex: number, achievement: string) => {
    if (!achievement.trim()) return;
    
    const updatedExperience = [...experience];
    const achievements = updatedExperience[expIndex].achievements || [];
    achievements.push(achievement.trim());
    updatedExperience[expIndex].achievements = achievements;
    onChange('experience', updatedExperience);
  };

  // 删除现有经历的成就
  const removeAchievementFromExisting = (expIndex: number, achIndex: number) => {
    const updatedExperience = [...experience];
    const achievements = updatedExperience[expIndex].achievements || [];
    achievements.splice(achIndex, 1);
    updatedExperience[expIndex].achievements = achievements;
    onChange('experience', updatedExperience);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* 节标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        <p className="text-gray-600 mt-1">
          Add your professional work experience and achievements
        </p>
      </div>

      {/* 添加新工作经历表单 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Work Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 公司名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newExperience.company}
              onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Google, Microsoft, ABC Corp"
            />
          </div>

          {/* 职位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newExperience.position}
              onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Software Engineer, Marketing Manager"
            />
          </div>

          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="month"
              value={newExperience.start_date}
              onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="space-y-2">
              <input
                type="month"
                value={newExperience.end_date}
                onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                disabled={newExperience.is_current}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  newExperience.is_current ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newExperience.is_current}
                  onChange={(e) => setNewExperience({...newExperience, is_current: e.target.checked})}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">I currently work here</span>
              </label>
            </div>
          </div>

          {/* 工作描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={newExperience.description}
              onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
              placeholder="Describe your role, responsibilities, and key activities..."
            />
          </div>

          {/* 成就列表 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Achievements
            </label>
            
            {/* 成就输入 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add a specific achievement or accomplishment..."
                onKeyPress={(e) => e.key === 'Enter' && addAchievementToNew()}
              />
              <button
                onClick={addAchievementToNew}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* 成就列表显示 */}
            {newExperience.achievements.length > 0 && (
              <div className="space-y-2">
                {newExperience.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-2 bg-blue-50 p-2 rounded-lg">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="flex-1 text-sm text-gray-700">{achievement}</span>
                    <button
                      onClick={() => removeAchievementFromNew(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={addExperience}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Experience
        </button>
      </div>

      {/* 工作经历列表 */}
      <div className="space-y-4">
        {experience.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Work Experience Added Yet</h3>
            <p className="text-gray-500">Add your professional experience above</p>
          </div>
        ) : (
          experience.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              {editingIndex === index ? (
                // 编辑模式
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <div className="space-y-2">
                        <input
                          type="month"
                          value={exp.end_date}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          disabled={exp.is_current}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                            exp.is_current ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.is_current || false}
                            onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600">Currently working here</span>
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setEditingIndex(-1)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingIndex(-1)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // 显示模式
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700 font-medium">{exp.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>
                          {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                        </span>
                        {exp.is_current && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Current Position
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">{exp.description}</p>
                  )}

                  {/* 成就列表 */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Achievements:</h4>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1 text-sm">•</span>
                            <span className="flex-1 text-sm text-gray-600">{achievement}</span>
                            <button
                              onClick={() => removeAchievementFromExisting(index, achIndex)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              title="Remove achievement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 提示信息 */}
      {experience.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">💡</div>
            <div>
              <h4 className="text-blue-900 font-medium">Experience Tips</h4>
              <ul className="text-blue-800 text-sm mt-1 space-y-1">
                <li>• List experiences in reverse chronological order</li>
                <li>• Use action verbs to describe your accomplishments</li>
                <li>• Quantify achievements with numbers when possible</li>
                <li>• Focus on results and impact, not just duties</li>
                <li>• Tailor descriptions to match job requirements</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}