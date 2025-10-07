'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PT_Sans } from 'next/font/google'
import Header from '@/app/components/Header'

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
})

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  salary_range?: string
  job_types?: string[] | null  // 允许为null
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
  company_name?: string
}

// Job Type标签显示映射
const JOB_TYPE_LABELS: { [key: string]: string } = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'remote': 'Remote',
  'freelance': 'Freelance',
  'temporary': 'Temporary',
  'commission-based': 'Commission-based',
  'volunteer': 'Volunteer',
  'gc-sponsorship': 'GC Sponsorship',
  'h1b-sponsorship': 'H1B Sponsorship',
  'otp-sponsorship': 'OTP Sponsorship'
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, selectedJobTypes, locationFilter])

  const checkUserAndLoadJobs = async () => {
    try {
      // 检查用户登录状态
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      let profileData = null
      if (user) {
        // 获取用户资料
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error loading user profile:', error)
        }
        profileData = data
        setProfile(profileData)
      }

      // 加载职位数据
      await loadJobs(user, profileData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async (user: any, profile: UserProfile | null) => {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      // 根据用户状态决定显示数量
      if (!user) {
        // 未登录：显示最新4个职位
        query = query.limit(4)
      }
      // 登录用户显示所有职位

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Job Type筛选
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter(job => {
        // 确保job_types存在且不为null
        if (!job.job_types || job.job_types.length === 0) {
          return false
        }
        // 现在TypeScript知道job_types肯定存在且是数组
        return selectedJobTypes.some(type => job.job_types!.includes(type))
      })
    }

    // 地点筛选
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }

  const handleJobTypeToggle = (jobType: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(type => type !== jobType)
        : [...prev, jobType]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPageTitle = () => {
    if (!user) return 'Latest Job Opportunities'
    if (profile?.user_type === 'student') return 'Recommended Jobs For You'
    return 'Browse All Jobs'
  }

  const getPageDescription = () => {
    if (!user) return 'Discover exciting career opportunities. Sign up to see personalized recommendations.'
    if (profile?.user_type === 'student') return 'Jobs matched to your profile and interests'
    return 'Explore job opportunities in the market'
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${ptSans.className}`}>
        <div className="text-xl text-gray-600">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${ptSans.className}`}>
      {/* 使用 Header 组件 */}
      <Header />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">{getPageTitle()}</h1>
            <p className="mt-2 text-gray-600">{getPageDescription()}</p>
          </div>

          {/* Search and Filters - Only show for logged in users */}
          {user && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2" style={{borderColor: '#c8ffd2'}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Search Jobs
                  </label>
                  <input
                    type="text"
                    placeholder="Job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                    style={{backgroundColor: '#c8ffd2'}}
                  />
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                    style={{backgroundColor: '#c8ffd2'}}
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedJobTypes([])
                      setLocationFilter('')
                    }}
                    className="w-full px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-bold transition-colors"
                    style={{color: '#c8ffd2'}}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Job Type Filters */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-black mb-2">
                  Job Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => {
                    const isSelected = selectedJobTypes.includes(value)
                    return (
                      <button
                        key={value}
                        onClick={() => handleJobTypeToggle(value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'text-black border-2 border-black'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                        style={isSelected ? {backgroundColor: '#c8ffd2'} : {}}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Job Results Count */}
          <div className="mb-4">
            <p className="text-gray-600 font-medium">
              Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-2 hover:opacity-90" style={{borderColor: '#c8ffd2'}}>
                {/* Job Title & Company */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-black mb-1">
                    {job.title}
                  </h3>
                  <p className="text-gray-700 font-medium">{job.company_name}</p>
                </div>

                {/* Location & Salary */}
                <div className="mb-4 space-y-1">
                  <p className="text-sm text-gray-600 font-medium">📍 {job.location}</p>
                  {job.salary_range && (
                    <p className="text-sm text-gray-600 font-medium">💰 {job.salary_range}</p>
                  )}
                </div>

                {/* Job Types Tags */}
                {job.job_types && job.job_types.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {job.job_types.map((type, index) => (
                        <span
                          key={`${type}-${index}`}
                          className="px-2 py-1 text-black text-xs rounded-full font-medium"
                          style={{backgroundColor: '#c8ffd2'}}
                        >
                          {JOB_TYPE_LABELS[type] || type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Job Types Fallback */}
                {(!job.job_types || job.job_types.length === 0) && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      Job Type Not Specified
                    </span>
                  </div>
                )}

                {/* Description Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {job.description.length > 100
                      ? `${job.description.substring(0, 100)}...`
                      : job.description
                    }
                  </p>
                </div>

                {/* Posted Date */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium">
                    Posted {formatDate(job.created_at)}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="w-full bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 text-sm font-bold transition-colors"
                      style={{color: '#c8ffd2'}}
                    >
                      View Details
                    </button>
                  ) : (
                    <Link
                      href="/register"
                      className="block w-full bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-700 text-sm font-bold text-center transition-colors"
                      style={{color: '#c8ffd2'}}
                    >
                      Sign Up to Apply
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-black mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {jobs.length === 0 
                  ? "No jobs have been posted yet." 
                  : "Try adjusting your search criteria or filters."
                }
              </p>
            </div>
          )}

          {/* Call to Action for Non-logged Users */}
          {!user && (
            <div className="mt-12 rounded-lg p-8 text-center border-2" style={{backgroundColor: '#c8ffd2', borderColor: '#c8ffd2'}}>
              <h3 className="text-xl font-bold text-black mb-2">
                Ready to Start Your Career Journey?
              </h3>
              <p className="text-gray-700 mb-6 font-medium">
                Sign up to unlock all job opportunities and get personalized recommendations
              </p>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 font-bold transition-colors"
                  style={{color: '#c8ffd2'}}
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-black px-6 py-3 rounded-full border-2 border-black hover:bg-gray-100 font-bold transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}