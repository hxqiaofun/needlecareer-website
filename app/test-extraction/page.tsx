// app/test-extraction/page.tsx
'use client';

import { useState, useRef } from 'react';
import { 
  extractTextFromFile, 
  ExtractionResult, 
  ExtractionStatus,
  isFileSupported,
  formatFileSize,
  validateExtractionQuality
} from '@/lib/file-extractors/index';

export default function TestExtractionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      setError(null);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setExtractionResult(null);
      setError(null);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const startExtraction = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Starting extraction...');

    try {
      // 检查文件是否支持
      if (!isFileSupported(selectedFile)) {
        throw new Error('File type not supported. Please use PDF, DOC, or DOCX files.');
      }

      // 开始提取
      const result = await extractTextFromFile(
        selectedFile,
        (progressInfo) => {
          setProgress(progressInfo.progress);
          setCurrentStep(progressInfo.currentStep);
        }
      );

      setExtractionResult(result);

      if (result.success) {
        setCurrentStep('Extraction completed successfully!');
      } else {
        setError(result.error?.message || 'Unknown extraction error');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setCurrentStep('Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setExtractionResult(null);
    setError(null);
    setProgress(0);
    setCurrentStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'docx': return '📝';
      default: return '📄';
    }
  };

  const qualityInfo = extractionResult?.success 
    ? validateExtractionQuality(extractionResult)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Extraction Test
          </h1>
          <p className="text-gray-600">
            Test PDF and Word document text extraction functionality
          </p>
        </div>

        {/* 文件选择区域 */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select File</h2>
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-3">
                <div className="text-4xl">{getFileTypeIcon(selectedFile.name)}</div>
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  <p className="text-sm text-gray-400">
                    {isFileSupported(selectedFile) ? '✅ Supported format' : '❌ Unsupported format'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📁</div>
                <div>
                  <p className="text-gray-600">Drop a file here or click to select</p>
                  <p className="text-sm text-gray-400">Supports PDF, DOC, DOCX files</p>
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={startExtraction}
              disabled={!selectedFile || isExtracting || !isFileSupported(selectedFile)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExtracting ? '🔄' : '🚀'} 
              {isExtracting ? 'Extracting...' : 'Start Extraction'}
            </button>
            
            <button
              onClick={clearAll}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* 进度显示 */}
        {isExtracting && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Extraction Progress</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Extraction Failed</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 提取结果 */}
        {extractionResult && (
          <div className="space-y-6">
            {/* 结果概览 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {extractionResult.success ? '✅ Extraction Results' : '❌ Extraction Failed'}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{extractionResult.metadata.wordCount}</p>
                  <p className="text-sm text-gray-600">Words</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{extractionResult.metadata.characterCount}</p>
                  <p className="text-sm text-gray-600">Characters</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{extractionResult.metadata.extractionTime}ms</p>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{extractionResult.fileType.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Format</p>
                </div>
              </div>

              {/* 质量评估 */}
              {qualityInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Quality Assessment</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      qualityInfo.isGoodQuality 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {qualityInfo.isGoodQuality ? 'Good Quality' : 'Needs Review'}
                    </span>
                    <span className="text-sm text-gray-600">Score: {qualityInfo.score}/100</span>
                  </div>
                  {qualityInfo.suggestions.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Suggestions:</p>
                      <ul className="list-disc list-inside">
                        {qualityInfo.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 提取的文本内容 */}
            {extractionResult.success && extractionResult.extractedText && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">📝 Extracted Text</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {extractionResult.extractedText}
                  </pre>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(extractionResult.extractedText)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    📋 Copy Text
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([extractionResult.extractedText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `extracted-${selectedFile?.name || 'text'}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                  >
                    💾 Download Text
                  </button>
                </div>
              </div>
            )}

            {/* 错误详情 */}
            {!extractionResult.success && extractionResult.error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Error Details</h3>
                <div className="space-y-2">
                  <p><strong>Code:</strong> {extractionResult.error.code}</p>
                  <p><strong>Message:</strong> {extractionResult.error.message}</p>
                  {extractionResult.error.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">
                        View technical details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
                        {extractionResult.error.details}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <a 
            href="/dashboard/student/resumes/upload" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Resume Upload
          </a>
        </div>
      </div>
    </div>
  );
}