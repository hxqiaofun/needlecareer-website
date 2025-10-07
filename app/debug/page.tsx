// 临时调试页面 - 可以放在任何测试路径
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugResumePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. 检查用户认证状态
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      info.auth = {
        session: session ? 'Found' : 'Not found',
        user_id: session?.user?.id || 'None',
        email: session?.user?.email || 'None',
        error: authError
      };

      if (session) {
        // 2. 检查用户资料
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        info.profile = {
          found: profileData ? 'Yes' : 'No',
          user_type: profileData?.user_type || 'None',
          error: profileError
        };

        // 3. 检查简历表
        const { data: resumesData, error: resumesError } = await supabase
          .from('resumes')
          .select('*')
          .eq('student_id', session.user.id);
        
        info.resumes = {
          count: resumesData?.length || 0,
          resumes: resumesData || [],
          error: resumesError
        };

        // 4. 检查数据库表结构
        const { data: tableInfo, error: tableError } = await supabase
          .from('resumes')
          .select('*')
          .limit(1);
        
        info.database = {
          resumes_table_accessible: tableError ? 'No' : 'Yes',
          sample_columns: tableInfo?.[0] ? Object.keys(tableInfo[0]) : [],
          error: tableError
        };

        // 5. 检查 resume_details 表
        const { data: detailsInfo, error: detailsError } = await supabase
          .from('resume_details')
          .select('*')
          .limit(1);
        
        info.resume_details = {
          table_accessible: detailsError ? 'No' : 'Yes',
          sample_columns: detailsInfo?.[0] ? Object.keys(detailsInfo[0]) : [],
          error: detailsError
        };
      }

    } catch (error) {
      info.fatal_error = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">NeedleCareer 简历系统调试工具</h1>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? '检查中...' : '运行诊断'}
      </button>

      {debugInfo && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">🔍 诊断结果</h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* 快速创建测试简历按钮 */}
          {debugInfo.auth?.session === 'Found' && debugInfo.resumes?.count === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 没有找到简历</h3>
              <p className="text-yellow-700 mb-3">您还没有创建任何简历。</p>
              <CreateTestResumeButton userId={debugInfo.auth.user_id} />
            </div>
          )}

          {/* 显示现有简历的编辑链接 */}
          {debugInfo.resumes?.resumes?.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ 找到简历</h3>
              <div className="space-y-2">
                {debugInfo.resumes.resumes.map((resume: any) => (
                  <div key={resume.id} className="flex items-center justify-between bg-white p-2 rounded">
                    <span>{resume.title}</span>
                    <a
                      href={`/dashboard/student/resumes/edit/${resume.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      编辑
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateTestResumeButton({ userId }: { userId: string }) {
  const [creating, setCreating] = useState(false);

  const createTestResume = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          student_id: userId,
          title: 'My First Resume',
          status: 'draft',
          is_default: true
        })
        .select()
        .single();

      if (error) {
        alert('创建失败: ' + error.message);
      } else {
        alert('测试简历创建成功！');
        window.location.href = `/dashboard/student/resumes/edit/${data.id}`;
      }
    } catch (error) {
      alert('创建时出错: ' + error);
    }
    setCreating(false);
  };

  return (
    <button
      onClick={createTestResume}
      disabled={creating}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
    >
      {creating ? '创建中...' : '创建测试简历'}
    </button>
  );
}