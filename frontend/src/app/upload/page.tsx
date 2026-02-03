'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Logo from '@/components/Logo';

interface UploadedDocument {
  id: string;
  name: string;
  uploadedAt: Date;
  size: string;
  status: 'processing' | 'completed' | 'failed';
}

export default function UploadPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');

  const handleUploadComplete = (fileName: string, fileSize: number) => {
    const newDoc: UploadedDocument = {
      id: Date.now().toString(),
      name: fileName,
      uploadedAt: new Date(),
      size: formatFileSize(fileSize),
      status: 'completed',
    };
    setDocuments([newDoc, ...documents]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-teal-100 text-teal-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      setAnalysisProgress(0);
      
      // Stage 1: Starting
      setAnalysisStage('Initializing...');
      setAnalysisProgress(10);
      
      // Stage 2: OCR
      setTimeout(() => {
        setAnalysisStage('Performing OCR on documents...');
        setAnalysisProgress(30);
      }, 500);
      
      // Stage 3: Extracting data
      setTimeout(() => {
        setAnalysisStage('Extracting medical information...');
        setAnalysisProgress(60);
      }, 2000);
      
      console.log('Starting analysis...');
      const response = await fetch('http://127.0.0.1:8000/analyze/all', {
        method: 'GET',
      });

      const data = await response.json();
      console.log('Analysis complete:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      // Stage 4: Filling form
      setAnalysisStage('Auto-filling EMR form...');
      setAnalysisProgress(90);
      
      // Small delay to show completion
      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisStage('Complete!');
        setAnalysisResult(data);
      }, 1000);
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
      setAnalysisProgress(0);
      setAnalysisStage('');
    } finally {
      setTimeout(() => setAnalyzing(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-800">Recepta</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, User</span>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Upload Section */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Documents</h2>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Analyze Button */}
            {documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Process Medical Documents</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyze uploaded documents with OCR, extract medical information, and automatically fill the EMR form.
                    </p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="ml-4 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
                  >
                    {analyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>Analyze & Process</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Analysis Progress */}
                {analyzing && (
                  <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-teal-800">{analysisStage}</p>
                        <p className="text-xs text-teal-600 mt-1">{analysisProgress}% complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-teal-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Analysis Result */}
                {analysisResult && !analyzing && (
                  <div className="mt-4 p-4 bg-white border border-teal-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Analysis Complete!</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Processed {analysisResult.num_files_processed} document(s)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Data Display */}
                    {analysisResult.cleaned_data && (
                      <div className="space-y-4">
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Extracted Medical Information</h4>
                          
                          {/* Document Type */}
                          <div className="mb-3 bg-teal-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-teal-700">Document Type</p>
                            <p className="text-sm text-gray-800 mt-1">{analysisResult.cleaned_data.document_type || 'N/A'}</p>
                          </div>

                          {/* Patient Info */}
                          <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 mb-2">Patient Information</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-xs text-gray-500">Name:</span>
                                <p className="text-gray-800 font-medium">{analysisResult.cleaned_data.patient_info?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">DOB:</span>
                                <p className="text-gray-800">{analysisResult.cleaned_data.patient_info?.dob || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Patient ID:</span>
                                <p className="text-gray-800">{analysisResult.cleaned_data.patient_info?.id || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Provider Info */}
                          <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 mb-2">Provider Information</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-xs text-gray-500">Provider:</span>
                                <p className="text-gray-800">{analysisResult.cleaned_data.provider_info?.name || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Contact:</span>
                                <p className="text-gray-800">{analysisResult.cleaned_data.provider_info?.contact || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Clinical Info */}
                          {analysisResult.cleaned_data.clinical_info && (
                            <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-600 mb-2">Clinical Information</p>
                              
                              {/* Diagnosis */}
                              {analysisResult.cleaned_data.clinical_info.diagnosis && (
                                <div className="mb-2">
                                  <span className="text-xs text-gray-500">Diagnosis:</span>
                                  <ul className="text-sm text-gray-800 list-disc list-inside mt-1">
                                    {(Array.isArray(analysisResult.cleaned_data.clinical_info.diagnosis) 
                                      ? analysisResult.cleaned_data.clinical_info.diagnosis 
                                      : [analysisResult.cleaned_data.clinical_info.diagnosis]
                                    ).map((diag: string, idx: number) => (
                                      <li key={idx}>{diag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Medications */}
                              {analysisResult.cleaned_data.clinical_info.medications?.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs text-gray-500">Medications:</span>
                                  <div className="mt-1 space-y-1">
                                    {analysisResult.cleaned_data.clinical_info.medications.map((med: any, idx: number) => (
                                      <div key={idx} className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200">
                                        <span className="font-medium">{med.name}</span>
                                        {med.dosage && <span className="text-gray-600"> - {med.dosage}</span>}
                                        {med.instructions && <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Vital Signs */}
                              {analysisResult.cleaned_data.clinical_info.vital_signs && (
                                <div>
                                  <span className="text-xs text-gray-500">Vital Signs:</span>
                                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                                    {analysisResult.cleaned_data.clinical_info.vital_signs.blood_pressure && (
                                      <div className="bg-white p-2 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500">BP</p>
                                        <p className="text-gray-800">{analysisResult.cleaned_data.clinical_info.vital_signs.blood_pressure}</p>
                                      </div>
                                    )}
                                    {analysisResult.cleaned_data.clinical_info.vital_signs.heart_rate && (
                                      <div className="bg-white p-2 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500">HR</p>
                                        <p className="text-gray-800">{analysisResult.cleaned_data.clinical_info.vital_signs.heart_rate}</p>
                                      </div>
                                    )}
                                    {analysisResult.cleaned_data.clinical_info.vital_signs.temperature && (
                                      <div className="bg-white p-2 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500">Temp</p>
                                        <p className="text-gray-800">{analysisResult.cleaned_data.clinical_info.vital_signs.temperature}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Notes */}
                          {analysisResult.cleaned_data.additional_notes && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <p className="text-xs font-medium text-yellow-800 mb-1">Additional Notes</p>
                              <p className="text-sm text-gray-700">{analysisResult.cleaned_data.additional_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Document List Sidebar */}
          <div className="w-96">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Uploads</h2>
                <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {documents.length}
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-800 truncate text-sm">
                            {doc.name}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)} flex-shrink-0 ml-2`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 ml-7">
                        <span>{doc.size}</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
