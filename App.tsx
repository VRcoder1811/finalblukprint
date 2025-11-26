import React, { useState, useEffect } from 'react';
import { UploadedFile, AppStatus, CoverSheetData } from './types';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';
import PDFPreview from './components/PDFPreview';
import FeatureSplitter from './components/FeatureSplitter';
import { mergePDFs } from './services/pdfService';
import { generateSmartCoverSheet } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [useCoverSheet, setUseCoverSheet] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'merger' | 'splitter'>('merger');

  useEffect(() => {
    // Check if API Key is available for AI features
    if (process.env.API_KEY) {
      setIsAiEnabled(true);
    }
  }, []);

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newFiles.length) {
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      }
      return newFiles;
    });
  };

  const handleMergeAndPreview = async () => {
    if (files.length === 0) return;

    setStatus(AppStatus.PROCESSING);
    setAiError(null);

    try {
      let coverSheet: CoverSheetData | undefined;

      if (useCoverSheet && isAiEnabled) {
        setAiLoading(true);
        try {
            const fileNames = files.map(f => f.file.name);
            const summary = await generateSmartCoverSheet(fileNames);
            coverSheet = {
                title: "Bulk Print Job",
                summary,
                generatedByAI: true
            };
        } catch (e) {
            setAiError("Could not generate AI cover sheet. Proceeding without it.");
            console.error(e);
        } finally {
            setAiLoading(false);
        }
      }

      const mergedBytes = await mergePDFs(files, coverSheet);
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      alert('Failed to merge PDFs. Please ensure all files are valid.');
    }
  };

  const handleClosePreview = () => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Bulk Print <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-extrabold" style={{ fontFamily: "'Inter', sans-serif" }}>Raghu</span>
              </h1>
            </div>

            {/* Navbar */}
            <nav className="hidden sm:flex space-x-1 bg-slate-100/50 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('merger')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'merger' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    PDF Merger
                </button>
                <button
                    onClick={() => setActiveTab('splitter')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'splitter' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    PDF Splitter
                </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Nav (Visible only on small screens) */}
        <div className="sm:hidden mb-6 bg-white p-1 rounded-lg border border-slate-200 flex text-center">
            <button
                onClick={() => setActiveTab('merger')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'merger' ? 'bg-slate-100 text-indigo-700' : 'text-slate-500'}`}
            >
                Merger
            </button>
            <button
                onClick={() => setActiveTab('splitter')}
                className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'splitter' ? 'bg-slate-100 text-indigo-700' : 'text-slate-500'}`}
            >
                Splitter
            </button>
        </div>

        {activeTab === 'splitter' ? (
           <FeatureSplitter />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Upload & Options */}
            <div className="lg:col-span-2 space-y-6">
              <section aria-label="Upload Section">
                  <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-slate-800">1. Upload Files</h2>
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">Merger Active</span>
                  </div>
                  <FileUploader onFilesAdded={handleFilesAdded} />
              </section>

              <section aria-label="Files List">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-800">2. Arrange Order</h2>
                    {files.length > 0 && (
                        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">{files.length} files</span>
                    )}
                </div>
                <FileList 
                  files={files} 
                  onRemove={handleRemoveFile}
                  onMoveUp={(idx) => moveFile(idx, 'up')}
                  onMoveDown={(idx) => moveFile(idx, 'down')}
                />
              </section>
            </div>

            {/* Right Column: Actions & Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                  
                  {/* Options Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Print Options
                      </h3>

                      <div className="space-y-4">
                          <label className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${useCoverSheet ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                  type="checkbox" 
                                  checked={useCoverSheet} 
                                  onChange={(e) => setUseCoverSheet(e.target.checked)}
                                  disabled={!isAiEnabled || files.length === 0}
                                  className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                              />
                              <div>
                                  <span className={`block text-sm font-medium ${!isAiEnabled ? 'text-slate-400' : 'text-slate-900'}`}>
                                      Add Smart Cover Sheet
                                  </span>
                                  <span className="block text-xs text-slate-500 mt-0.5">
                                      {isAiEnabled 
                                          ? "Uses Gemini AI to generate a summary page." 
                                          : "AI features unavailable (Missing API Key)."
                                      }
                                  </span>
                              </div>
                          </label>
                      </div>

                      {aiError && (
                          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                              {aiError}
                          </div>
                      )}
                  </div>

                  {/* Action Button */}
                  <button
                      onClick={handleMergeAndPreview}
                      disabled={files.length === 0 || status === AppStatus.PROCESSING}
                      className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                      {status === AppStatus.PROCESSING || aiLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {aiLoading ? 'Generating Cover...' : 'Merging Files...'}
                          </>
                      ) : (
                          <>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Generate Print Job
                          </>
                      )}
                  </button>
                  
                  <p className="text-xs text-center text-slate-400">
                      Processed locally in your browser.
                  </p>

              </div>
            </div>

          </div>
        )}
      </main>

      <PDFPreview 
        pdfUrl={mergedPdfUrl} 
        onClose={handleClosePreview} 
      />
    </div>
  );
};

export default App;