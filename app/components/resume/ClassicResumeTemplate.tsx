import React from 'react';
import type { ResumeDetail } from '@/lib/types/resume';

interface ClassicResumeTemplateProps {
  resumeDetail: ResumeDetail;
  resumeTitle?: string;
}

export default function ClassicResumeTemplate({ resumeDetail, resumeTitle }: ClassicResumeTemplateProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // 格式化技能数据
  const formatSkills = (skills: any) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.filter(skill => skill.category && skill.items && skill.items.length > 0);
  };

  // 格式化教育数据
  const formatEducation = (education: any) => {
    if (!education || !Array.isArray(education)) return [];
    return education.filter(edu => edu.school || edu.degree);
  };

  // 格式化工作经历
  const formatExperience = (experience: any) => {
    if (!experience || !Array.isArray(experience)) return [];
    return experience.filter(exp => exp.company || exp.position);
  };

  // 格式化项目经历
  const formatProjects = (projects: any) => {
    if (!projects || !Array.isArray(projects)) return [];
    return projects.filter(project => project.name);
  };

  // 格式化证书
  const formatCertifications = (certifications: any) => {
    if (!certifications || !Array.isArray(certifications)) return [];
    return certifications.filter(cert => cert.name);
  };

  // 格式化语言能力
  const formatLanguages = (languages: any) => {
    if (!languages || !Array.isArray(languages)) return [];
    return languages.filter(lang => lang.language);
  };

  const formattedSkills = formatSkills(resumeDetail.skills);
  const formattedEducation = formatEducation(resumeDetail.education);
  const formattedExperience = formatExperience(resumeDetail.experience);
  const formattedProjects = formatProjects(resumeDetail.projects);
  const formattedCertifications = formatCertifications(resumeDetail.certifications);
  const formattedLanguages = formatLanguages(resumeDetail.languages);

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-900 font-serif leading-relaxed">
      {/* 简历标题 - 仅用于预览，不在模板中显示 */}
      {resumeTitle && (
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-green-600 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Resume: {resumeTitle}</h2>
        </div>
      )}

      {/* 头部 - 个人基本信息 */}
      <header className="text-center mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {resumeDetail.full_name || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-700">
          {resumeDetail.email && (
            <div className="flex items-center">
              <span>📧</span>
              <span className="ml-1">{resumeDetail.email}</span>
            </div>
          )}
          {resumeDetail.phone && (
            <div className="flex items-center">
              <span>📱</span>
              <span className="ml-1">{resumeDetail.phone}</span>
            </div>
          )}
          {resumeDetail.location && (
            <div className="flex items-center">
              <span>📍</span>
              <span className="ml-1">{resumeDetail.location}</span>
            </div>
          )}
        </div>

        {/* 在线链接 */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-2 text-sm text-blue-600">
          {resumeDetail.website && (
            <a href={resumeDetail.website} className="hover:underline">
              🌐 Website
            </a>
          )}
          {resumeDetail.linkedin_url && (
            <a href={resumeDetail.linkedin_url} className="hover:underline">
              💼 LinkedIn
            </a>
          )}
          {resumeDetail.github_url && (
            <a href={resumeDetail.github_url} className="hover:underline">
              🔗 GitHub
            </a>
          )}
        </div>
      </header>

      {/* 职业概述 */}
      {resumeDetail.professional_summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-800 text-justify leading-relaxed">
            {resumeDetail.professional_summary}
          </p>
        </section>
      )}

      {/* 职业目标 */}
      {resumeDetail.career_objective && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            CAREER OBJECTIVE
          </h2>
          <p className="text-gray-800 text-justify leading-relaxed">
            {resumeDetail.career_objective}
          </p>
        </section>
      )}

      {/* 工作经历 */}
      {formattedExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-4">
            {formattedExperience.map((exp, index) => (
              <div key={index} className="pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {exp.position || 'Position Title'}
                    </h3>
                    <p className="font-semibold text-gray-700">
                      {exp.company || 'Company Name'}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-800 mb-2 text-justify">
                    {exp.description}
                  </p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {exp.achievements.map((achievement: string, achIndex: number) => (
                      <li key={achIndex}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 教育背景 */}
      {formattedEducation.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {formattedEducation.map((edu, index) => (
              <div key={index} className="pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {edu.degree || 'Degree'} {edu.major && `in ${edu.major}`}
                    </h3>
                    <p className="font-semibold text-gray-700">
                      {edu.school || 'School Name'}
                    </p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </span>
                </div>
                {edu.description && (
                  <p className="text-gray-800 text-sm mt-1">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 技能 */}
      {formattedSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            SKILLS
          </h2>
          <div className="space-y-2 pl-4">
            {formattedSkills.map((skillGroup, index) => (
              <div key={index}>
                <span className="font-semibold text-gray-900">
                  {skillGroup.category}:
                </span>
                <span className="ml-2 text-gray-800">
                  {skillGroup.items.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 项目经历 */}
      {formattedProjects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            PROJECTS
          </h2>
          <div className="space-y-4">
            {formattedProjects.map((project, index) => (
              <div key={index} className="pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {project.name}
                    </h3>
                    {project.role && (
                      <p className="font-semibold text-gray-700">
                        {project.role}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </span>
                </div>
                {project.description && (
                  <p className="text-gray-800 mb-2 text-justify">
                    {project.description}
                  </p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900">Technologies: </span>
                    <span className="text-gray-800">
                      {project.technologies.join(', ')}
                    </span>
                  </div>
                )}
                {project.url && (
                  <div>
                    <span className="font-semibold text-gray-900">URL: </span>
                    <a href={project.url} className="text-blue-600 hover:underline">
                      {project.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 证书和奖项 */}
      {formattedCertifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            CERTIFICATIONS & AWARDS
          </h2>
          <div className="space-y-2 pl-4">
            {formattedCertifications.map((cert, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{cert.name}</h3>
                    {cert.issuer && (
                      <p className="text-gray-700">{cert.issuer}</p>
                    )}
                    {cert.description && (
                      <p className="text-sm text-gray-600">{cert.description}</p>
                    )}
                  </div>
                  {cert.date && (
                    <span className="text-sm text-gray-600 font-medium">
                      {formatDate(cert.date)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 语言能力 */}
      {formattedLanguages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            LANGUAGES
          </h2>
          <div className="pl-4">
            <div className="flex flex-wrap gap-4">
              {formattedLanguages.map((lang, index) => (
                <div key={index} className="text-gray-800">
                  <span className="font-semibold">{lang.language}</span>
                  {lang.proficiency && (
                    <span className="ml-1 text-gray-600">
                      ({lang.proficiency})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 兴趣爱好 */}
      {resumeDetail.interests && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            INTERESTS
          </h2>
          <p className="text-gray-800 pl-4">
            {resumeDetail.interests}
          </p>
        </section>
      )}

      {/* 推荐人信息 */}
      {resumeDetail.reference_contacts && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-300">
            REFERENCES
          </h2>
          <p className="text-gray-800 pl-4">
            {resumeDetail.reference_contacts}
          </p>
        </section>
      )}

      {/* 页脚 - 仅在预览时显示 */}
      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 print:hidden">
        <p>Generated by NeedleCareer • {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}