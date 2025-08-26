'use client';

import { useState } from 'react';
import { ResumeDetail } from '@/lib/types/resume';

interface Project {
  name: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  highlights?: string[];
}

interface ProjectsSectionProps {
  data: ResumeDetail;
  onChange: (field: keyof ResumeDetail, value: any) => void;
}

export default function ProjectsSection({ data, onChange }: ProjectsSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newProject, setNewProject] = useState<Project>({
    name: '',
    role: '',
    start_date: '',
    end_date: '',
    description: '',
    technologies: [],
    url: '',
    github_url: '',
    highlights: []
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  const projects: Project[] = (data.projects as Project[]) || [];

  // 常用技术栈选项
  const commonTechnologies = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular',
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring',
    'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Sass', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
    'Azure', 'Google Cloud', 'Firebase', 'Supabase', 'GraphQL', 'REST API'
  ];

  // 添加新项目
  const addProject = () => {
    if (!newProject.name.trim() || !newProject.role.trim()) {
      alert('Please fill in project name and your role.');
      return;
    }

    const updatedProjects = [...projects, { ...newProject }];
    onChange('projects', updatedProjects);
    
    // 重置表单
    setNewProject({
      name: '',
      role: '',
      start_date: '',
      end_date: '',
      description: '',
      technologies: [],
      url: '',
      github_url: '',
      highlights: []
    });
    setNewTechnology('');
    setNewHighlight('');
  };

  // 更新项目
  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    onChange('projects', updatedProjects);
  };

  // 删除项目
  const removeProject = (index: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      onChange('projects', updatedProjects);
      setEditingIndex(-1);
    }
  };

  // 添加技术到新项目
  const addTechnologyToNew = (technology: string) => {
    if (!technology.trim()) return;
    if (newProject.technologies.includes(technology.trim())) return;
    
    setNewProject({
      ...newProject,
      technologies: [...newProject.technologies, technology.trim()]
    });
    setNewTechnology('');
  };

  // 删除新项目的技术
  const removeTechnologyFromNew = (techIndex: number) => {
    const technologies = [...newProject.technologies];
    technologies.splice(techIndex, 1);
    setNewProject({ ...newProject, technologies });
  };

  // 添加亮点到新项目
  const addHighlightToNew = () => {
    if (!newHighlight.trim()) return;
    
    setNewProject({
      ...newProject,
      highlights: [...(newProject.highlights || []), newHighlight.trim()]
    });
    setNewHighlight('');
  };

  // 删除新项目的亮点
  const removeHighlightFromNew = (highlightIndex: number) => {
    const highlights = [...(newProject.highlights || [])];
    highlights.splice(highlightIndex, 1);
    setNewProject({ ...newProject, highlights });
  };

  // 添加技术到现有项目
  const addTechnologyToExisting = (projIndex: number, technology: string) => {
    if (!technology.trim()) return;
    
    const updatedProjects = [...projects];
    const technologies = updatedProjects[projIndex].technologies || [];
    if (technologies.includes(technology.trim())) return;
    
    technologies.push(technology.trim());
    updatedProjects[projIndex].technologies = technologies;
    onChange('projects', updatedProjects);
  };

  // 删除现有项目的技术
  const removeTechnologyFromExisting = (projIndex: number, techIndex: number) => {
    const updatedProjects = [...projects];
    const technologies = updatedProjects[projIndex].technologies || [];
    technologies.splice(techIndex, 1);
    updatedProjects[projIndex].technologies = technologies;
    onChange('projects', updatedProjects);
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
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <p className="text-gray-600 mt-1">
          Showcase your personal and professional projects
        </p>
      </div>

      {/* 添加新项目表单 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Project</h3>
        
        <div className="space-y-4">
          {/* 项目名称和角色 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., E-commerce Platform, Mobile App"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProject.role}
                onChange={(e) => setNewProject({...newProject, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Full-Stack Developer, Lead Designer"
              />
            </div>
          </div>

          {/* 日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="month"
                value={newProject.start_date}
                onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="month"
                value={newProject.end_date}
                onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* 链接 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL (Optional)
              </label>
              <input
                type="url"
                value={newProject.url}
                onChange={(e) => setNewProject({...newProject, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://your-project.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL (Optional)
              </label>
              <input
                type="url"
                value={newProject.github_url}
                onChange={(e) => setNewProject({...newProject, github_url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>

          {/* 项目描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
              placeholder="Describe what the project does, its purpose, and your contributions..."
            />
          </div>

          {/* 技术栈 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technologies Used
            </label>
            
            {/* 技术输入 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add a technology..."
                onKeyPress={(e) => e.key === 'Enter' && addTechnologyToNew(newTechnology)}
              />
              <button
                onClick={() => addTechnologyToNew(newTechnology)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* 快速添加常用技术 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {commonTechnologies.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => addTechnologyToNew(tech)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      newProject.technologies.includes(tech)
                        ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    disabled={newProject.technologies.includes(tech)}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* 已添加的技术 */}
            {newProject.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newProject.technologies.map((tech, index) => (
                  <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>{tech}</span>
                    <button
                      onClick={() => removeTechnologyFromNew(index)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 项目亮点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Highlights
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add a key feature or achievement..."
                onKeyPress={(e) => e.key === 'Enter' && addHighlightToNew()}
              />
              <button
                onClick={addHighlightToNew}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* 已添加的亮点 */}
            {newProject.highlights && newProject.highlights.length > 0 && (
              <div className="space-y-2">
                {newProject.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 bg-purple-50 p-2 rounded-lg">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="flex-1 text-sm text-gray-700">{highlight}</span>
                    <button
                      onClick={() => removeHighlightFromNew(index)}
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

        <div className="mt-6">
          <button
            onClick={addProject}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Add Project
          </button>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Projects Added Yet</h3>
            <p className="text-gray-500">Showcase your projects above</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              {editingIndex === index ? (
                // 编辑模式
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) => updateProject(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={project.start_date}
                        onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={project.end_date}
                        onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="View Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                            title="View Code"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium mb-1">Role: {project.role}</p>
                      <div className="text-sm text-gray-500">
                        {project.start_date && project.end_date && (
                          <span>
                            {formatDate(project.start_date)} - {formatDate(project.end_date)}
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
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{project.description}</p>
                  )}

                  {/* 技术栈 */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            <span>{tech}</span>
                            <button
                              onClick={() => removeTechnologyFromExisting(index, techIndex)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 项目亮点 */}
                  {project.highlights && project.highlights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Highlights:</h4>
                      <ul className="space-y-1">
                        {project.highlights.map((highlight, highlightIndex) => (
                          <li key={highlightIndex} className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1 text-sm">•</span>
                            <span className="flex-1 text-sm text-gray-600">{highlight}</span>
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
      {projects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">💡</div>
            <div>
              <h4 className="text-blue-900 font-medium">Project Tips</h4>
              <ul className="text-blue-800 text-sm mt-1 space-y-1">
                <li>• Include both personal and professional projects</li>
                <li>• Focus on projects that demonstrate relevant skills</li>
                <li>• Provide live links and source code when possible</li>
                <li>• Quantify the impact or scale of your projects</li>
                <li>• Keep descriptions concise but informative</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}