'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface Skill {
  category: string;
  items: string[];
}

interface SkillsSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillItem, setNewSkillItem] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');

  // 预定义的技能分类
  const skillCategories = [
    'Programming Languages',
    'Web Technologies',
    'Frameworks & Libraries',
    'Databases',
    'Tools & Software',
    'Cloud Platforms',
    'Soft Skills',
    'Languages',
    'Other'
  ];

  const skills: Skill[] = (data.skills as Skill[]) || [];

  // 添加新的技能分类
  const addSkillCategory = () => {
    if (!newSkillCategory.trim()) return;

    const existingCategory = skills.find(s => s.category.toLowerCase() === newSkillCategory.toLowerCase());
    if (existingCategory) {
      alert('This skill category already exists!');
      return;
    }

    const newSkill: Skill = {
      category: newSkillCategory.trim(),
      items: []
    };

    const updatedSkills = [...skills, newSkill];
    onChange('skills', updatedSkills);
    setNewSkillCategory('');
    setActiveCategory(newSkill.category);
  };

  // 添加技能项目到指定分类
  const addSkillItem = (categoryIndex: number) => {
    if (!newSkillItem.trim()) return;

    const updatedSkills = [...skills];
    const category = updatedSkills[categoryIndex];
    
    if (category.items.includes(newSkillItem.trim())) {
      alert('This skill already exists in this category!');
      return;
    }

    category.items.push(newSkillItem.trim());
    onChange('skills', updatedSkills);
    setNewSkillItem('');
  };

  // 删除技能项目
  const removeSkillItem = (categoryIndex: number, itemIndex: number) => {
    const updatedSkills = [...skills];
    updatedSkills[categoryIndex].items.splice(itemIndex, 1);
    onChange('skills', updatedSkills);
  };

  // 删除技能分类
  const removeSkillCategory = (categoryIndex: number) => {
    if (confirm('Are you sure you want to delete this skill category and all its items?')) {
      const updatedSkills = [...skills];
      updatedSkills.splice(categoryIndex, 1);
      onChange('skills', updatedSkills);
      setActiveCategory('');
    }
  };

  // 使用预定义分类
  const addPredefinedCategory = (category: string) => {
    const existingCategory = skills.find(s => s.category.toLowerCase() === category.toLowerCase());
    if (existingCategory) {
      setActiveCategory(category);
      return;
    }

    const newSkill: Skill = {
      category: category,
      items: []
    };

    const updatedSkills = [...skills, newSkill];
    onChange('skills', updatedSkills);
    setActiveCategory(category);
  };

  return (
    <div className="space-y-6">
      {/* 节标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
        <p className="text-gray-600 mt-1">
          Organize your skills into categories to showcase your expertise
        </p>
      </div>

      {/* 快速添加预定义分类 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Add Categories</h3>
        <div className="flex flex-wrap gap-2">
          {skillCategories.map((category) => (
            <button
              key={category}
              onClick={() => addPredefinedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                skills.some(s => s.category === category)
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义分类添加 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Custom Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            placeholder="e.g., Design Tools, Marketing Skills..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addSkillCategory()}
          />
          <button
            onClick={addSkillCategory}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* 技能分类列表 */}
      <div className="space-y-6">
        {skills.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">⚡</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Skills Added Yet</h3>
            <p className="text-gray-500">Start by adding a skill category above</p>
          </div>
        ) : (
          skills.map((skillCategory, categoryIndex) => (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
              {/* 分类标题 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {skillCategory.category}
                  <span className="ml-2 text-sm text-gray-500">
                    ({skillCategory.items.length} skills)
                  </span>
                </h3>
                <button
                  onClick={() => removeSkillCategory(categoryIndex)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete category"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* 技能项目列表 */}
              <div className="mb-4">
                {skillCategory.items.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No skills added to this category yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillCategory.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{item}</span>
                        <button
                          onClick={() => removeSkillItem(categoryIndex, itemIndex)}
                          className="text-green-600 hover:text-green-800 transition-colors"
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

              {/* 添加技能项目 */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={activeCategory === skillCategory.category ? newSkillItem : ''}
                  onChange={(e) => {
                    setNewSkillItem(e.target.value);
                    setActiveCategory(skillCategory.category);
                  }}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addSkillItem(categoryIndex)}
                />
                <button
                  onClick={() => addSkillItem(categoryIndex)}
                  disabled={activeCategory !== skillCategory.category || !newSkillItem.trim()}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 技能建议 */}
      {skills.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-xl">💡</div>
            <div>
              <h4 className="text-yellow-900 font-medium">Skill Tips</h4>
              <ul className="text-yellow-800 text-sm mt-1 space-y-1">
                <li>• List skills relevant to your target job</li>
                <li>• Include both technical and soft skills</li>
                <li>• Be specific (e.g., "React.js" instead of just "JavaScript")</li>
                <li>• Keep the most important skills in earlier categories</li>
                <li>• Regularly update based on new skills learned</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {skills.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex gap-6">
              <span>
                <strong>{skills.length}</strong> categories
              </span>
              <span>
                <strong>{skills.reduce((total, cat) => total + cat.items.length, 0)}</strong> total skills
              </span>
            </div>
            <div className="text-xs">
              Remember to save your changes!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}