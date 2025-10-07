'use client';

import React, { useState } from 'react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email && email.includes('@')) {
      console.log('Email submitted:', email);
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-[#c8ffd2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/images/Needle_logo.png" alt="NeedleCareer Logo" className="h-10 w-auto" />              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          {/* Logo or Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-[#c8ffd2] rounded-full flex items-center justify-center p-4">
              <img src="/images/Needle_logo.png" alt="NeedleCareer Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-5xl sm:text-6xl font-bold text-black mb-4">
            Coming Soon...
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 mb-8">
            We're working hard to bring you the best job matching experience.
          </p>

          <p className="text-lg text-gray-600 mb-12">
            NeedleCareer is currently in development. Sign up to be notified when we launch!
          </p>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="bg-[#c8ffd2] text-black px-6 py-3 rounded-full text-center">
                ✓ Thank you! We'll notify you when we launch.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-[#c8ffd2] text-black placeholder-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-black text-[#c8ffd2] rounded-full hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                >
                  Notify Me
                </button>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-[#c8ffd2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-black mb-2">For Job Seekers</h3>
              <p className="text-gray-600 text-sm">Find your perfect job match with AI-powered recommendations</p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-[#c8ffd2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-bold text-black mb-2">For Employers</h3>
              <p className="text-gray-600 text-sm">Connect with top talent and streamline your hiring process</p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-[#c8ffd2] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-black mb-2">Smart Matching</h3>
              <p className="text-gray-600 text-sm">Advanced algorithms to find your needle in the haystack</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#c8ffd2] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2025 NeedleCareer. All rights reserved.</p>
            <p className="mt-2">
              Questions? Contact us at{' '}
              <a href="mailto:info@needlecareer.com" className="text-black hover:underline">
                info@needlecareer.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}