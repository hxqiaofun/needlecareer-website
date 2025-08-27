'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
  url?: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface AdditionalInfoSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function AdditionalInfoSection({ data, onChange }: AdditionalInfoSectionProps) {
  const [newCertification, setNewCertification] = useState<Certification>({
    name: '',
    issuer: '',
    date: '',
    credential_id: '',
    url: ''
  });

  const [newLanguage, setNewLanguage] = useState<Language>({
    language: '',
    proficiency: ''
  });

  const certifications: Certification[] = (data.certifications as Certification[]) || [];
  const languages: Language[] = (data.languages as Language[]) || [];

  // 语言熟练程度选项
  const proficiencyLevels = [
    { value: 'native', label: 'Native' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'basic', label: 'Basic' }
  ];

  // 常见语言列表
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
    'Arabic', 'Russian', 'Hindi', 'Dutch', 'Swedish', 'Norwegian'
  ];

  // 添加证书
  const addCertification = () => {
    if (!newCertification.name.trim() || !newCertification.issuer.trim()) {
      alert('Please fill in certification name and issuer.');
      return;
    }

    const updatedCertifications = [...certifications, { ...newCertification }];
    onChange('certifications', updatedCertifications);
    
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      credential_id: '',
      url: ''
    });
  };

  // 删除证书
  const removeCertification = (index: number) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      const updatedCertifications = [...certifications];
      updatedCertifications.splice(index, 1);
      onChange('certifications', updatedCertifications);
    }
  };

  // 添加语言
  const addLanguage = () => {
    if (!newLanguage.language.trim() || !newLanguage.proficiency) {
      alert('Please select a language and proficiency level.');
      return;
    }

    // 检查是否已存在
    if (languages.some(lang => lang.language.toLowerCase() === newLanguage.language.toLowerCase())) {
      alert('This language is already added.');
      return;
    }

    const updatedLanguages = [...languages, { ...newLanguage }];
    onChange('languages', updatedLanguages);
    
    setNewLanguage({
      language: '',
      proficiency: ''
    });
  };

  // 删除语言
  const removeLanguage = (index: number) => {
    if (confirm('Are you sure you want to delete this language?')) {
      const updatedLanguages = [...languages];
      updatedLanguages.splice(index, 1);
      onChange('languages', updatedLanguages);
    }
  };

  // 更新文本字段
  const updateTextField = (field: keyof ResumeDetail, value: string) => {
    onChange(field, value);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8">
      {/* 节标题 */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
        <p className="text-gray-600 mt-1">
          Add certifications, languages, interests, and other relevant information
        </p>
      </div>

      {/* 证书和认证 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Certifications & Awards
          </h3>

          {/* 添加证书表单 */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="e.g., AWS Certified Developer, Google Analytics IQ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="e.g., Amazon Web Services, Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Earned
                </label>
                <input
                  type="month"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({...newCertification, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID (Optional)
                </label>
                <input
                  type="text"
                  value={newCertification.credential_id}
                  onChange={(e) => setNewCertification({...newCertification, credential_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Certificate ID or Badge number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate URL (Optional)
                </label>
                <input
                  type="url"
                  value={newCertification.url}
                  onChange={(e) => setNewCertification({...newCertification, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Link to certificate or badge"
                />
              </div>
            </div>

            <button
              onClick={addCertification}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Add Certification
            </button>
          </div>

          {/* 证书列表 */}
          {certifications.length > 0 && (
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                        {cert.url && (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="View Certificate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">{cert.issuer}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        {cert.date && <span>Earned: {formatDate(cert.date)}</span>}
                        {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 语言能力 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            Languages
          </h3>

          {/* 添加语言表单 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newLanguage.language}
                    onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Select or type a language"
                    list="languages-list"
                  />
                  <datalist id="languages-list">
                    {commonLanguages.map((lang) => (
                      <option key={lang} value={lang} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency <span className="text-red-500">*</span>
                </label>
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage({...newLanguage, proficiency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={addLanguage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Language
            </button>
          </div>

          {/* 语言列表 */}
          {languages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languages.map((lang, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{lang.language}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lang.proficiency === 'native' ? 'bg-green-100 text-green-800' :
                          lang.proficiency === 'fluent' ? 'bg-blue-100 text-blue-800' :
                          lang.proficiency === 'advanced' ? 'bg-purple-100 text-purple-800' :
                          lang.proficiency === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {proficiencyLevels.find(p => p.value === lang.proficiency)?.label || lang.proficiency}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeLanguage(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 兴趣爱好 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Interests & Hobbies
        </h3>
        
        <div className="bg-green-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Interests
          </label>
          <textarea
            value={data.interests || ''}
            onChange={(e) => updateTextField('interests', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
            placeholder="Share your hobbies, interests, volunteer work, or other activities that showcase your personality and values..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {(data.interests || '').length}/500 characters
          </p>
        </div>
      </div>

      {/* 推荐人信息 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          References
        </h3>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Contacts
          </label>
          <textarea
            value={data.reference_contacts || ''}
            onChange={(e) => updateTextField('reference_contacts', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
            placeholder="You can list reference contacts here, or simply state 'Available upon request'..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: It's often better to state "References available upon request" and provide them when asked.
          </p>
        </div>
      </div>

      {/* 完成度和提示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 统计信息 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Section Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Certifications:</span>
              <span className="font-medium">{certifications.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Languages:</span>
              <span className="font-medium">{languages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interests:</span>
              <span className="font-medium">{data.interests ? 'Added' : 'Not added'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">References:</span>
              <span className="font-medium">{data.reference_contacts ? 'Added' : 'Not added'}</span>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">💡</div>
            <div>
              <h4 className="text-blue-900 font-medium">Additional Info Tips</h4>
              <ul className="text-blue-800 text-sm mt-1 space-y-1">
                <li>• Include relevant certifications and licenses</li>
                <li>• List languages if relevant to your target role</li>
                <li>• Share interests that show leadership or teamwork</li>
                <li>• Keep references ready but don't include contact details</li>
                <li>• Only add information that strengthens your profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 完成提示 */}
      {certifications.length > 0 || languages.length > 0 || data.interests || data.reference_contacts ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-600 text-xl">🎉</div>
            <div>
              <h4 className="text-green-900 font-medium">Great Job!</h4>
              <p className="text-green-800 text-sm mt-1">
                You've added additional information that will help your resume stand out. 
                Don't forget to save your changes!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Additional Information</h3>
          <p className="text-gray-500">
            Add certifications, languages, and other relevant information to strengthen your resume
          </p>
        </div>
      )}
    </div>
  );
}