'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

// TypeScript type definitions
interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_range: string;
  job_types: string[];
  description: string;
  created_at: string;
}
interface Resume {
  id: string;
  title: string;
  is_default: boolean;
  status: 'draft' | 'active' | 'archived';
}
interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    user_type?: string;
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
       
        if (error || !authUser) {
          router.push('/login');
          return;
        }
        // Check user type
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', authUser.id)
          .single();
        if (profile?.user_type !== 'student') {
          router.push('/dashboard');
          return;
        }
        setUser(authUser as User);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch latest jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        // Fetch user resumes
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('id, title, is_default, status')
          .eq('student_id', user.id)
          .order('is_default', { ascending: false })
          .order('updated_at', { ascending: false });
        setRecentJobs(jobsData || []);
        setResumes(resumesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#c8ffd2' }}></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultResume = resumes.find(r => r.is_default);

  return (
    <div className="min-h-screen bg-white">
      <Header />
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your job search journey and discover more opportunities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Resume Stats */}
          <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-black">{resumes.length}</p>
                <p className="text-gray-600">My Resumes</p>
              </div>
            </div>
            {defaultResume && (
              <div className="mt-2 text-sm text-green-500">
                Default: {defaultResume.title}
              </div>
            )}
          </div>
          {/* Job Application Stats */}
          <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-black">0</p>
                <p className="text-gray-600">Pending Applications</p>
              </div>
            </div>
          </div>
          {/* Interview Invitations */}
          <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-black">0</p>
                <p className="text-gray-600">Interview Invitations</p>
              </div>
            </div>
          </div>
          {/* Saved Jobs */}
          <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-black">0</p>
                <p className="text-gray-600">Saved Jobs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Recommended Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 rounded-lg shadow-sm" style={{ borderColor: '#c8ffd2' }}>
              <div className="px-8 py-4 border-b-2" style={{ borderColor: '#c8ffd2' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-black">Recommended Jobs for You</h2>
                  <button
                    onClick={() => router.push('/browse-jobs')}
                    className="text-black hover:opacity-70 text-sm font-medium transition-opacity"
                  >
                    Browse All Jobs →
                  </button>
                </div>
              </div>
             
              <div className="p-8">
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                      <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <p className="text-gray-600">No recommended jobs yet</p>
                    <button
                      onClick={() => router.push('/browse-jobs')}
                      className="mt-4 bg-black px-6 py-2 hover:bg-gray-800 text-sm font-medium transition-colors"
                      style={{ color: '#c8ffd2' }}
                    >
                      Browse All Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="border-4 rounded-lg p-6 transition-opacity" style={{ borderColor: '#c8ffd2' }}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <button className="bg-black px-2 py-1 hover:bg-gray-800 text-sm font-bold transition-colors" style={{ color: '#c8ffd2' }}>
                             {job.title}
                            </button>
                            <p className="text-gray-600 mt-1">{job.company_name}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span>{job.location}</span>
                              {job.salary_range && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{job.salary_range}</span>
                                </>
                              )}
                            </div>
                            {job.job_types && job.job_types.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.job_types.slice(0, 3).map((type, index) => (
                                  <span
                                    key={index}
                                    className="inline-block border-3 bg-white rounded-full font-bold text-black text-xs px-2 py-1"
                                    style={{ borderColor: '#c8ffd2' }}
                                  >
                                    {type}
                                  </span>
                                ))}
                                {job.job_types.length > 3 && (
                                  <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1">
                                    +{job.job_types.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {new Date(job.created_at).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="bg-[#c8ffd2] px-6 py-2 hover:bg-gray-200 text-black text-sm font-bold transition-colors">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Actions and Resume Management */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
              <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/browse-jobs')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-black">Browse Jobs</p>
                    <p className="text-sm text-gray-600">Discover new opportunities</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/student/resumes')}
                  className="w-full flex items-center p-3 text-left hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-black">Manage Resumes</p>
                    <p className="text-sm text-gray-600">Edit and optimize resumes</p>
                  </div>
                </button>
                <button className="w-full flex items-center p-3 text-left hover:bg-gray-200 rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-black">Application History</p>
                    <p className="text-sm text-gray-600">View application status</p>
                  </div>
                </button>
                <button className="w-full flex items-center p-3 text-left hover:bg-gray-200 rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-black">Account Settings</p>
                    <p className="text-sm text-gray-600">Manage personal information</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Resume Management Summary */}
            <div className="bg-white border-2 rounded-lg shadow-sm p-8" style={{ borderColor: '#c8ffd2' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">My Resumes</h3>
                <button
                  onClick={() => router.push('/dashboard/student/resumes')}
                  className="text-black hover:opacity-70 text-sm font-medium transition-opacity"
                >
                  Manage All →
                </button>
              </div>
              {resumes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">No resumes yet</p>
                  <button
                    onClick={() => router.push('/dashboard/student/resumes/edit/new')}
                    className="bg-black px-6 py-2 hover:bg-gray-800 text-sm font-medium transition-colors"
                    style={{ color: '#c8ffd2' }}
                  >
                    Create Your First Resume
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.slice(0, 3).map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8ffd2' }}>
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-black text-sm">{resume.title}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 ${
                              resume.status === 'active'
                                ? 'text-black'
                                : resume.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            style={resume.status === 'active' ? { backgroundColor: '#c8ffd2' } : {}}
                            >
                              {resume.status === 'active' ? 'Active' : resume.status === 'draft' ? 'Draft' : 'Archived'}
                            </span>
                            {resume.is_default && (
                              <span className="text-xs px-2 py-1 text-black" style={{ backgroundColor: '#c8ffd2' }}>
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/student/resumes/edit/${resume.id}`)}
                        className="text-black hover:opacity-70 text-sm font-medium transition-opacity"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                 
                  {resumes.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => router.push('/dashboard/student/resumes')}
                        className="text-black hover:opacity-70 text-sm font-medium transition-opacity"
                      >
                        View All {resumes.length} Resumes →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Job Search Tips */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-8" style={{ color: '#c8ffd2' }}>
              <h3 className="text-lg font-bold mb-2">Job Search Tips</h3>
              <p className="text-sm opacity-90 mb-3">
                Keep your resume updated and regularly optimize keywords to improve matching
              </p>
              <button className="px-6 py-2 text-black hover:bg-gray-100 text-sm font-medium transition-colors" style={{ backgroundColor: '#c8ffd2' }}>
                View More Tips →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}