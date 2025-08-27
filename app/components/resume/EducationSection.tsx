'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface Education {
  school: string;
  degree: string;
  major: string;
  gpa?: string;
  start_date: string;
  end_date: string;
  description?: string;
  achievements?: string[];
}

interface EducationSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function EducationSection({ data, onChange }: EducationSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newEducation, setNewEducation] = useState<Education>({
    school: '',
    degree: '',
    major: '',
    gpa: '',
    start_date: '',
    end_date: '',
    description: '',
    achievements: []
  });

  const education: Education[] = (data.education as Education[]) || [];

  // 学位类型选项
  const degreeTypes = [
    'High School Diploma',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Certificate',
    'Other'
  ];

  // 添加新教育经历
  const addEducation = () => {
    if (!newEducation.school.trim() || !newEducation.degree.trim()) {
      alert('Please fill in school name and degree.');
      return;
    }

    const updatedEducation = [...education, { ...newEducation }];
    onChange('education', updatedEducation);
    
    // 重置表单
    setNewEducation({
      school: '',
      degree: '',
      major: '',
      gpa: '',
      start_date: '',
      end_date: '',
      description: '',
      achievements: []
    });
  };

  // 更新教育经历
  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    onChange('education', updatedEducation);
  };

  // 删除教育经历
  const removeEducation = (index: number) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      const updatedEducation = [...education];
      updatedEducation.splice(index, 1);
      onChange('education', updatedEducation);
      setEditingIndex(-1);
    }
  };

  // 添加成就到教育经历
  const addAchievement = (index: number, achievement: string) => {
    if (!achievement.trim()) return;
    
    const updatedEducation = [...education];
    const achievements = updatedEducation[index].achievements || [];
    achievements.push(achievement.trim());
    updatedEducation[index].achievements = achievements;
    onChange('education', updatedEducation);
  };

  // 删除成就
  const removeAchievement = (eduIndex: number, achIndex: number) => {
    const updatedEducation = [...education];
    const achievements = updatedEducation[eduIndex].achievements || [];
    achievements.splice(achIndex, 1);
    updatedEducation[eduIndex].achievements = achievements;
    onChange('education', updatedEducation);
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
        <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        <p className="text-gray-600 mt-1">
          Add your educational background and academic achievements
        </p>
      </div>

      {/* 添加新教育经历表单 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Education</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 学校名称 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School/Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newEducation.school}
              onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Harvard University, MIT"
            />
          </div>

          {/* 学位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree <span className="text-red-500">*</span>
            </label>
            <select
              value={newEducation.degree}
              onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select degree</option>
              {degreeTypes.map((degree) => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
          </div>

          {/* 专业 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Major/Field of Study
            </label>
            <input
              type="text"
              value={newEducation.major}
              onChange={(e) => setNewEducation({...newEducation, major: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Computer Science, Business Administration"
            />
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPA (Optional)
            </label>
            <input
              type="text"
              value={newEducation.gpa}
              onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 3.8/4.0, 3.8"
            />
          </div>

          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="month"
              value={newEducation.start_date}
              onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="month"
              value={newEducation.end_date}
              onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* 描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newEducation.description}
              onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
              placeholder="Relevant coursework, thesis, or additional details..."
            />
          </div>
        </div>

        <button
          onClick={addEducation}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Education
        </button>
      </div>

      {/* 教育经历列表 */}
      <div className="space-y-4">
        {education.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🎓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Education Added Yet</h3>
            <p className="text-gray-500">Add your educational background above</p>
          </div>
        ) : (
          education.map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              {editingIndex === index ? (
                // 编辑模式
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <select
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {degreeTypes.map((degree) => (
                          <option key={degree} value={degree}>{degree}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => updateEducation(index, 'major', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {edu.degree} {edu.major && `in ${edu.major}`}
                      </h3>
                      <p className="text-gray-700 font-medium">{edu.school}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {edu.start_date && edu.end_date && (
                          <span>
                            {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                          </span>
                        )}
                        {edu.gpa && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            GPA: {edu.gpa}
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
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {edu.description && (
                    <p className="text-gray-600 text-sm mb-3">{edu.description}</p>
                  )}

                  {/* 成就列表 */}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {edu.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start justify-between">
                            <span className="flex-1">{achievement}</span>
                            <button
                              onClick={() => removeAchievement(index, achIndex)}
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
      {education.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">💡</div>
            <div>
              <h4 className="text-blue-900 font-medium">Education Tips</h4>
              <ul className="text-blue-800 text-sm mt-1 space-y-1">
                <li>• List education in reverse chronological order (most recent first)</li>
                <li>• Include GPA only if it's 3.5 or higher</li>
                <li>• Mention relevant coursework for entry-level positions</li>
                <li>• Include academic honors, scholarships, or awards</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}