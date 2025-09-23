"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, ArrowRight, Users, Heart, Shield, Sparkles, MessageCircle, Globe, Menu, X, User, LogOut, Briefcase, Home, FileText } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({ 
  weight: ['400', '700'],
  subsets: ['latin'] 
});

// 真实用户认证 Hook
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkUser();
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await loadUserProfile(user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  return { user, profile, loading };
};

// 用户类型定义
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'employer';
  company_name?: string;
}

// 品牌色彩
const colors = {
  mint: "#C8FFD2",
  ink: "#000000",
  slate: "#7C7F81",
  canvas: "#FFFFFF",
};

// UI 组件类型定义
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({ children, variant = "primary", className = "", onClick, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2";
  
  const variants: Record<string, string> = {
    primary: "bg-black text-white hover:bg-gray-800 hover:translate-y-[-1px]",
    secondary: `border-2 border-black text-black hover:bg-gray-100`,
    ghost: "text-gray-700 hover:text-black hover:bg-gray-50",
    outline: "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      onClick={onClick}
      {...props}
      style={variant === "secondary" ? { backgroundColor: colors.mint } : undefined}
    >
      {children}
    </button>
  );
};

interface InputProps {
  placeholder?: string;
  className?: string;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({ placeholder, className = "", ...props }) => (
  <input
    className={`flex-1 rounded-2xl border-0 bg-transparent px-4 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-0 ${className}`}
    placeholder={placeholder}
    {...props}
  />
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = "", hover = true }) => (
  <div className={`rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${hover ? 'transition-transform hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, size = "md" }) => {
  const sizes: Record<string, string> = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-medium text-gray-600">{fallback}</span>
      )}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-xs text-gray-600 border border-black/10 ${className}`}>
    {children}
  </span>
);

// 头部组件
interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, profile, loading }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDashboardClick = () => {
    setUserMenuOpen(false);
    if (profile?.user_type === 'student') {
      router.push('/dashboard/student');
    } else if (profile?.user_type === 'employer') {
      router.push('/dashboard/employer');
    } else {
      router.push('/dashboard');
    }
  };

  const handleBrowseJobs = () => {
    router.push('/browse-jobs');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-md">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/Needle_logo.png" 
              alt="Needle Logo" 
              className="h-8 md:h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Badge>beta</Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-black transition">Features</a>
            <a href="#community" className="hover:text-black transition">Community</a>
            <a href="#how" className="hover:text-black transition">How it works</a>
            <a href="#faq" className="hover:text-black transition">FAQ</a>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-2xl"></div>
            ) : user && profile ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-2xl px-3 py-2 transition"
                >
                  <Avatar 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=c8ffd2&color=000`} 
                    fallback={profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'} 
                    size="sm" 
                  />
                  <span className="hidden md:inline text-sm font-medium">{profile.full_name || profile.email}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-black/10 py-2">
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </button>
                    
                    {profile?.user_type === 'employer' ? (
                      <Link
                        href="/dashboard/post-job"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Post a Job
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleBrowseJobs();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left transition-colors"
                      >
                        <Briefcase className="h-4 w-4" />
                        Browse Jobs
                      </button>
                    )}
                    
                    <hr className="my-2" />
                    <button 
                      onClick={handleSignOut} 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={handleSignIn}>
                  Sign in
                </Button>
                <Button onClick={handleSignUp}>
                  Join free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/5 py-4">
            <div className="flex flex-col gap-3">
              <a href="#features" className="py-2 text-sm text-gray-600 hover:text-black">Features</a>
              <a href="#community" className="py-2 text-sm text-gray-600 hover:text-black">Community</a>
              <a href="#how" className="py-2 text-sm text-gray-600 hover:text-black">How it works</a>
              <a href="#faq" className="py-2 text-sm text-gray-600 hover:text-black">FAQ</a>
              {!user && (
                <div className="pt-3 border-t border-black/5 flex gap-2">
                  <Button variant="ghost" onClick={handleSignIn}>Sign in</Button>
                  <Button onClick={handleSignUp}>Join free</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// 主页面组件
export default function NeedleCareerLanding() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const handleBrowseJobs = () => {
    router.push('/browse-jobs');
  };

  const handlePostJob = () => {
    router.push('/dashboard/post-job');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-black ${ptSans.className}`}
      style={{
        background: "radial-gradient(1000px 600px at 10% -10%, rgba(200,255,210,0.35), transparent 60%), radial-gradient(800px 500px at 90% -20%, rgba(200,255,210,0.25), transparent 60%), linear-gradient(#FFFFFF, #FFFFFF)",
      }}
    >
      <Header user={user} profile={profile} loading={loading} />

      {/* HERO Section */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-8 md:pb-10 relative">
        {/* 浮动装饰 */}
        <div
          className="pointer-events-none absolute -top-24 right-[-6rem] h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ background: "rgba(200,255,210,0.6)" }}
        />

        <div className="grid md:grid-cols-12 gap-10 items-center">
          {/* 左侧内容 */}
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-black/10 bg-white/70 backdrop-blur rounded-2xl">
              {user && profile ? `Welcome back, ${profile.full_name || profile.email}!` : "Made for students & early‑career talent"}
            </div>
            
            <h1 className="mt-4 text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight">
              {user && profile ? (
                <>Find your perfect <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-black to-gray-600">career match</span> today.</>
              ) : (
                <>A <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-black to-gray-600">modern, kinder</span> way to find work.</>
              )}
            </h1>
            
            <p className="mt-4 text-gray-600 text-[clamp(1rem,2.2vw,1.125rem)] leading-relaxed max-w-xl">
              {user && profile ? (
                profile.user_type === 'student' ? 
                  "Browse verified jobs, connect with mentors, and take the next step in your career journey." :
                  "Post jobs, find talent, and build your dream team with our community-first approach."
              ) : (
                "Visa‑transparent roles, verified posts, and a sincere community. Light‑hearted vibes, professional results."
              )}
            </p>

            {/* CTA Section */}
            {user && profile ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {profile.user_type === 'student' ? (
                  <Button onClick={handleBrowseJobs}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                ) : (
                  <Button onClick={handlePostJob}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur border border-black/10 p-2.5 flex items-center gap-2 w-full max-w-xl">
                <Input placeholder="Enter your email" />
                <Button onClick={handleSignUp}>Get early access</Button>
              </div>
            )}

            {/* Trust indicators */}
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Verified jobs</div>
              <div className="flex items-center gap-2"><Heart className="h-4 w-4" /> Friendly mentors</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Community first</div>
            </div>
          </div>

          {/* 右侧卡片 */}
          <div className="md:col-span-5">
            <div className="relative">
              {/* 浮动卡片1 - 社区圈子 */}
              <div className="absolute -top-6 -left-6 rotate-[-3deg] rounded-2xl border border-black/10 bg-white/70 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-4 w-56">
                <div className="text-xs text-gray-600 mb-2">Peer Circles</div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((n) => (
                    <Avatar key={n} src={`https://i.pravatar.cc/88?img=${n + 10}`} fallback={`P${n}`} size="md" />
                  ))}
                </div>
              </div>

              {/* 主卡片 - 特色职位 */}
              <Card className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-600">Featured role</div>
                    <div className="font-medium">Product Analyst — Visa‑friendly</div>
                  </div>
                  <div className="px-2 py-1 text-xs rounded-2xl border border-black/10" style={{ background: colors.mint }}>
                    Fair pay
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">$85–105k · H‑1B possible · NYC</p>
                <Button variant="outline" className="mt-4" onClick={handleBrowseJobs}>View role</Button>
              </Card>

              {/* 浮动卡片2 - 社区问答 */}
              <div className="absolute -bottom-8 -right-6 rotate-[2.5deg] rounded-2xl border border-black/10 bg-white/70 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-4 w-64">
                <div className="text-xs text-gray-600 mb-2">Community Q&A</div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <p className="text-sm leading-relaxed">"How did you negotiate OPT timing?" — 14 answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 社会证明 */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-8 pb-10">
        <div className="flex flex-wrap items-center gap-4 opacity-90">
          {["NYU", "Columbia", "Cornell", "CMU", "UCLA"].map((school) => (
            <div key={school} className="text-sm text-gray-600 border border-black/10 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur">
              Trusted by <span className="text-black font-medium">{school}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-[1120px] mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Verified roles, real pay",
              desc: "Every job is checked for sponsorship clarity and honest salary info—so you can decide with confidence.",
              icon: <Shield className="h-5 w-5" />,
            },
            {
              title: "A kinder network",
              desc: "Peer circles, alumni mentors, and hiring managers who actually reply. Professional, not performative.",
              icon: <Heart className="h-5 w-5" />,
            },
            {
              title: "Made for your journey",
              desc: "From F‑1 to H‑1B to OPT—get tips, templates, and community stories without the jargon.",
              icon: <Sparkles className="h-5 w-5" />,
            },
          ].map((feature, i) => (
            <Card key={i} className="p-6">
              <div className="h-10 w-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: colors.mint }}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Community testimonials */}
      <section id="community" className="max-w-[1120px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <Card className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">What our community says</h2>
            <Button variant="outline">Join the Discord</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Lina • MS CS",
                img: "https://i.pravatar.cc/100?img=12",
                quote: "The job posts feel… human. Recruiters actually answered my questions—no black box.",
              },
              {
                name: "Victor • Data Analyst", 
                img: "https://i.pravatar.cc/100?img=20",
                quote: "Finally saw salary ranges up front. Saved me weeks of guessing and ghosting.",
              },
              {
                name: "Ava • Product",
                img: "https://i.pravatar.cc/100?img=32", 
                quote: "Visa tips from peers who've been there. It's sincere and practical, not hypey.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={testimonial.img} alt={testimonial.name} fallback={testimonial.name.charAt(0)} />
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-600">Verified member</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-[1120px] mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: 1, title: "Create your profile", desc: "Import a resume or start fresh in minutes." },
            { step: 2, title: "Explore verified jobs", desc: "Filter by visa‑friendliness, salary, and role." },
            { step: 3, title: "Connect & apply kindly", desc: "Ask questions, get intros, and apply with clarity." },
          ].map((step, i) => (
            <Card key={i} className="p-6">
              <div className="h-8 w-8 rounded-2xl flex items-center justify-center mb-3 text-sm font-semibold" style={{ background: colors.mint }}>
                {step.step}
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-[1120px] mx-auto px-4 md:px-8 pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)]" style={{ background: colors.mint }}>
            <div className="grid md:grid-cols-2 gap-6 p-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold">We're building a kinder career platform—together.</h3>
                <p className="text-sm mt-2 opacity-80">Join as a founding member to shape features, mentor peers, and grow with a sincere, global community.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="your@email.com" className="rounded-2xl border-2 border-black bg-white/80" />
                <Button variant="outline" onClick={handleSignUp}>Request invite</Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="max-w-[1120px] mx-auto px-4 md:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: "Is NeedleCareer free?", a: "Yes—core features are free while we're in beta. We'll always keep a generous free tier for students." },
            { q: "How do you verify jobs?", a: "We review postings for sponsorship clarity, compensation signals, and employer track record—then label them transparently." },
            { q: "Who's this for?", a: "Students and early‑career folks who want a friendly, professional space to grow without the gatekeeping or fluff." },
            { q: "Do I need to be in the U.S.?", a: "No. We're global, with localized tips and stories from the community to support different paths." },
          ].map((faq, i) => (
            <Card key={i} className="p-6">
              <h3 className="font-medium mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-10 grid md:grid-cols-2 gap-6 items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} NeedleCareer — "Find your needle in the haystack"
          </div>
          <div className="flex gap-6 text-sm justify-start md:justify-end">
            <a className="hover:underline text-gray-600 hover:text-black" href="#">Privacy</a>
            <a className="hover:underline text-gray-600 hover:text-black" href="#">Terms</a>
            <a className="hover:underline text-gray-600 hover:text-black" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}