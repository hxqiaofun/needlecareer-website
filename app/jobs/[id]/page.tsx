'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface JobData {
  id: string
  title: string
  job_types: string[]
  company_name: string
  location: string
  salary_range?: string
  description: string
  requirements?: string
  created_at: string
  employer_id: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
}

interface EmployerProfile {
  id: string
  full_name: string
  company_name?: string
  company_logo_url?: string
  company_description?: string
  company_website?: string
  industry?: string
  company_size?: string
  company_location?: string
}

// Job Type Options for display
const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'remote': 'Remote',
  'freelance': 'Freelance',
  'temporary': 'Temporary',
  'commission-based': 'Commission-based',
  'volunteer': 'Volunteer',
  'gc-sponsorship': 'GC',
  'h1b-sponsorship': 'H1B',
  'otp-sponsorship': 'OPT'
}

export default function JobDetailsView() {
  const [job, setJob] = useState<JobData | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  useEffect(() => {
    if (jobId) {
      loadJobDetails()
      checkUser()
    }
  }, [jobId])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
      }
    } catch (error) {
      console.error('User check error:', error)
    }
  }

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        router.push('/dashboard')
        return
      }

      setJob(data)

      // 获取发布这个职位的雇主信息
      const { data: employerData, error: employerError } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_name, company_logo_url, company_description, company_website, industry, company_size, company_location')
        .eq('id', data.employer_id)
        .eq('user_type', 'employer')
        .single()

      if (!employerError && employerData) {
        setEmployerProfile(employerData)
      }

    } catch (error) {
      console.error('Job loading error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!profile) {
      router.push('/login')
      return
    }

    if (profile.user_type !== 'student') {
      alert('Only students can apply for jobs')
      return
    }

    setApplying(true)

    try {
      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('student_id', profile.id)
        .single()

      if (existingApplication) {
        alert('You have already applied for this job')
        return
      }

      // Create application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          student_id: profile.id,
          status: 'pending'
        })

      if (error) {
        throw error
      }

      alert('Application submitted successfully!')
      router.push('/dashboard/student?success=application_submitted')

    } catch (error: any) {
      console.error('Application error:', error)
      alert('Application failed: ' + (error?.message || 'Unknown error'))
    } finally {
      setApplying(false)
    }
  }

  const handleDelete = async () => {
    if (!profile || !job || profile.id !== job.employer_id) {
      alert('You do not have permission to delete this job')
      return
    }

    // 确认删除
    const confirmed = window.confirm(
      `Are you sure you want to delete this job posting?\n\n"${job.title}" at ${job.company_name}\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('employer_id', profile.id) // 确保只能删除自己的职位

      if (error) {
        throw error
      }

      alert('Job deleted successfully!')
      router.push('/dashboard/employer?success=job_deleted')

    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Failed to delete job: ' + (error?.message || 'Unknown error'))
    }
  }

  // 智能返回链接逻辑
  const getBackLink = () => {
    if (!profile) {
      return '/browse-jobs'
    }
    
    if (profile.user_type === 'employer') {
      if (profile.id === job?.employer_id) {
        return '/dashboard/employer'
      }
      return '/browse-jobs'
    }
    
    return '/browse-jobs'
  }

  const getBackText = () => {
    if (!profile) {
      return 'Back to Jobs'
    }
    
    if (profile.user_type === 'employer' && profile.id === job?.employer_id) {
      return 'Back to Dashboard'
    }
    
    return 'Back to Jobs'
  }

  // 公司Logo组件
  const CompanyLogo = ({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) => {
    const sizeClasses = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16', 
      large: 'w-20 h-20'
    }
    
    const textSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    }

    const companyName = employerProfile?.company_name || job?.company_name || 'Company'
    
    return (
      <div className={`${sizeClasses[size]} bg-black rounded flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        {employerProfile?.company_logo_url ? (
          <img 
            src={employerProfile.company_logo_url} 
            alt={`${companyName} Logo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-medium ${textSizeClasses[size]}`} style={{ color: '#c8ffd2' }}>
            {companyName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Loading...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Job not found</div>
      </div>
    )
  }

  const canApply = profile && profile.user_type === 'student' && profile.id !== job.employer_id
  const isOwnJob = profile && profile.id === job.employer_id

  return (
    <div className={`min-h-screen bg-gray-50 ${ptSans.className}`}>
      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Company Header */}
            <div className="flex items-center space-x-4 mb-6">
              <CompanyLogo size="large" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-black mb-1">
                  {employerProfile?.company_name || job.company_name}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {employerProfile?.industry && (
                    <span>{employerProfile.industry}</span>
                  )}
                  {employerProfile?.company_size && (
                    <>
                      <span>|</span>
                      <span>{employerProfile.company_size}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: job.title,
                        text: `Check out this job opportunity: ${job.title} at ${job.company_name}`,
                        url: window.location.href,
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Job URL copied to clipboard!')
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                </button>
                <Link
                  href={getBackLink()}
                  className="p-2 hover:bg-gray-100 rounded flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </Link>
              </div>
            </div>

            {/* Job Title */}
            <h2 className="text-4xl font-bold text-black mb-2">{job.title}</h2>
            <p className="text-lg text-gray-600 mb-6">{job.location}</p>

            {/* Job Type Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {job.job_types.map(type => (
                <span
                  key={type}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium"
                >
                  {JOB_TYPE_LABELS[type] || type}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Hiring Manager */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-bold text-black mb-4">Hiring Manager</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {employerProfile?.full_name ? employerProfile.full_name.charAt(0).toUpperCase() : 'H'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-black">
                    {employerProfile?.full_name || 'Hiring Manager'}
                  </h4>
                  <p className="text-sm text-gray-600">Head of Hiring</p>
                  <p className="text-xs text-gray-500 mt-1">57 mutual connections</p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Moved from main content */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="space-y-3">
                {canApply && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 disabled:bg-gray-300 font-medium transition-colors"
                      style={{color: applying ? '#000' : '#c8ffd2'}}
                    >
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 font-medium transition-colors">
                      Save
                    </button>
                  </div>
                )}
                
                {!profile && (
                  <div className="flex space-x-3">
                    <Link
                      href="/login"
                      className="flex-1 text-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 font-medium transition-colors"
                      style={{color: '#c8ffd2'}}
                    >
                      Apply
                    </Link>
                    <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 font-medium transition-colors">
                      Save
                    </button>
                  </div>
                )}
                
                {isOwnJob && (
                  <div className="flex space-x-3">
                    <Link
                      href={`/dashboard/post-job?edit=${job.id}`}
                      className="flex-1 text-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 font-medium transition-colors"
                      style={{color: '#c8ffd2'}}
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={handleDelete}
                      className="flex-1 border border-red-500 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
                
                {profile && profile.user_type === 'employer' && !isOwnJob && (
                  <div className="text-center">
                    <span className="inline-block w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium">
                      Employer Account
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Content Sections */}
        <div className="mt-8">
          {/* Job Description - Full Width */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-4">About the job</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Job Requirements - Full Width */}
          {job.requirements && (
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-xl font-bold text-black mb-4">Requirements</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}
        </div>

        {/* About the Company Section - Moved to bottom */}
        <div className="mt-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-6">About the company</h3>
            <div className="flex items-start space-x-4 mb-6">
              <CompanyLogo size="medium" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-black">
                    {employerProfile?.company_name || job.company_name}
                  </h4>
                  <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded font-medium">
                    Following
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">2,467,103 Followers</p>
                
                <p className="text-sm text-gray-600 mb-4">
                  {employerProfile?.industry && `${employerProfile.industry} | `}
                  {employerProfile?.company_size && `${employerProfile.company_size} | `}
                  30,702 on Needle
                </p>
              </div>
            </div>
            
            {employerProfile?.company_description && (
              <p className="text-gray-700 leading-relaxed mb-4">
                {employerProfile.company_description}
              </p>
            )}
            
            {employerProfile?.company_website && (
              <div>
                <a 
                  href={employerProfile.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Visit Company Website →
                </a>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="text-blue-600 hover:underline font-medium text-sm">
                See more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}