'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'student' | 'employer'
  company_name?: string
  phone?: string
}

interface JobFormData {
  title: string
  job_types: string[]
  location: string
  salary_range: string
  description: string
  requirements: string
}

interface JobFormErrors {
  title?: string
  job_types?: string
  location?: string
  salary_range?: string
  description?: string
  requirements?: string
}

const JOB_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'commission-based', label: 'Commission-based' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'gc-sponsorship', label: 'GC Sponsorship' },
  { value: 'h1b-sponsorship', label: 'H1B Sponsorship' },
  { value: 'otp-sponsorship', label: 'OTP Sponsorship' }
]

function PostJobContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    job_types: [],
    location: '',
    salary_range: '',
    description: '',
    requirements: ''
  })
  const [errors, setErrors] = useState<JobFormErrors>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const editJobId = searchParams.get('edit')
  const isEditMode = Boolean(editJobId)

  useEffect(() => {
    checkUserPermission()
  }, [])

  useEffect(() => {
    if (isEditMode && editJobId && profile) {
      loadJobForEdit(editJobId)
    }
  }, [isEditMode, editJobId, profile])

  const checkUserPermission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        router.push('/dashboard')
        return
      }

      if (profileData.user_type !== 'employer') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
    } catch (error) {
      console.error('Permission check error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadJobForEdit = async (jobId: string) => {
    try {
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('employer_id', profile?.id)
        .single()

      if (error) {
        throw error
      }

      if (!jobData) {
        alert('Job not found or you do not have permission to edit this job.')
        router.push('/dashboard/employer')
        return
      }

      setFormData({
        title: jobData.title || '',
        job_types: jobData.job_types || [],
        location: jobData.location || '',
        salary_range: jobData.salary_range || '',
        description: jobData.description || '',
        requirements: jobData.requirements || ''
      })

    } catch (error: unknown) {
      console.error('Load job error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('Failed to load job data: ' + errorMessage)
      router.push('/dashboard/employer')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name as keyof JobFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleJobTypeToggle = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      job_types: prev.job_types.includes(jobType)
        ? prev.job_types.filter(type => type !== jobType)
        : [...prev.job_types, jobType]
    }))
    
    if (errors.job_types) {
      setErrors(prev => ({
        ...prev,
        job_types: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: JobFormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter job title'
    }

    if (formData.job_types.length === 0) {
      newErrors.job_types = 'Please select at least one job type'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please enter location'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter job description'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !profile) return

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not logged in')
      }

      const jobData = {
        title: formData.title.trim(),
        job_types: formData.job_types,
        company_name: profile.company_name || profile.full_name,
        location: formData.location.trim(),
        salary_range: formData.salary_range.trim() || null,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        employer_id: user.id
      }

      if (isEditMode && editJobId) {
        const { error } = await supabase
          .from('jobs')
          .update({
            ...jobData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editJobId)
          .eq('employer_id', user.id)

        if (error) {
          throw error
        }

        router.push(`/jobs/${editJobId}?success=job_updated`)
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert(jobData)

        if (error) {
          throw error
        }

        router.push('/dashboard/employer?success=job_posted')
      }

    } catch (error: unknown) {
      console.error('Job operation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`${isEditMode ? 'Update' : 'Posting'} failed: ` + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Access Denied</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      <Header />

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">
              {isEditMode ? 'Edit Job' : 'Post New Job'}
            </h1>
            <p className="mt-2 text-gray-600 font-medium">
              {isEditMode 
                ? 'Update your job posting information below'
                : 'Fill in the information below to post your job opportunity'
              }
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg border-2 border-green-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-black mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-bold text-black">
                      Job Title <span className="text-green-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border-2 rounded-md shadow-sm focus:outline-none font-medium ${
                        errors.title 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="e.g., Frontend Developer"
                    />
                    {errors.title && <p className="mt-1 text-sm font-medium text-red-700">{errors.title}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black mb-3">
                      Job Types <span className="text-green-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {JOB_TYPE_OPTIONS.map(option => {
                        const isSelected = formData.job_types.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleJobTypeToggle(option.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                              isSelected
                                ? 'text-black border-black bg-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                            {isSelected && (
                              <span className="ml-1 text-black">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-1 text-xs text-gray-600 font-medium">
                      Click to select multiple job types. You can choose more than one.
                    </p>
                    {errors.job_types && <p className="mt-2 text-sm font-medium text-red-700">{errors.job_types}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-bold text-black">
                      Location <span className="text-green-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border-2 rounded-md shadow-sm focus:outline-none font-medium ${
                        errors.location 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="e.g., New York, NY"
                    />
                    {errors.location && <p className="mt-1 text-sm font-medium text-red-700">{errors.location}</p>}
                  </div>

                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-bold text-black">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black font-medium"
                      placeholder="e.g., $60k-80k"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-black">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profile.company_name || profile.full_name}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm text-gray-600 font-medium bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-600 font-medium">
                      Company name is from your account information. Please go to profile settings to modify
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-black mb-4">Detailed Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-black">
                      Job Description <span className="text-green-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border-2 rounded-md shadow-sm focus:outline-none font-medium ${
                        errors.description 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="Please describe the job responsibilities, duties, and work content in detail..."
                    />
                    {errors.description && <p className="mt-1 text-sm font-medium text-red-700">{errors.description}</p>}
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-bold text-black">
                      Job Requirements
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      rows={6}
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-black font-medium"
                      placeholder="Please describe the skills, experience, and qualifications required for candidates..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-green-200">
                <Link
                  href={isEditMode ? `/jobs/${editJobId}` : "/dashboard/employer"}
                  className="px-6 py-2 border-2 border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-black text-green-300 rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:text-black font-bold transition-colors"
                >
                  {submitting 
                    ? (isEditMode ? 'Updating...' : 'Posting...') 
                    : (isEditMode ? 'Update Job' : 'Post Job')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PostJob() {
  return (
    <Suspense fallback={
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600 font-medium">Loading...</div>
      </div>
    }>
      <PostJobContent />
    </Suspense>
  )
}