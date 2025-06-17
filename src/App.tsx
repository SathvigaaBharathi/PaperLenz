import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { AuthForm } from './components/AuthForm';
import { InputForm } from './components/InputForm';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Dashboard } from './components/Dashboard';
import { AnalysisView } from './components/AnalysisView';
import { Footer } from './components/Footer';
import { ChatAssistant } from './components/ChatAssistant';
import { analyzePaperWithEdgeFunction, analyzePaperDirect } from './lib/edgeFunction';
import { supabase } from './lib/supabase';
import { PaperAnalysis, AnalysisState } from './types';
import toast from 'react-hot-toast';

function AnalyzePage() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [paperDoi, setPaperDoi] = useState<string | undefined>();
  const [currentAcademicLevel, setCurrentAcademicLevel] = useState<string>('undergraduate');
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
  });

  const handleAnalyze = async (data: { 
    type: 'doi' | 'abstract' | 'pdf'; 
    content: string; 
    title?: string;
    academicLevel: string;
  }) => {
    if (!user) return;

    // Store the academic level used for this analysis
    setCurrentAcademicLevel(data.academicLevel);

    setAnalysisState({
      isProcessing: true,
      progress: 10,
      currentStep: 'Parsing document',
      error: undefined, // Clear any previous errors
    });

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 25, step: 'Extracting content' },
        { progress: 50, step: 'AI analysis in progress' },
        { progress: 75, step: 'Generating insights' },
        { progress: 90, step: 'Finalizing results' },
      ];

      for (const { progress, step } of progressSteps) {
        setAnalysisState(prev => ({ ...prev, progress, currentStep: step }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Process different input types
      let content = data.content;
      let title = data.title || 'Scientific Paper Analysis';

      if (data.type === 'doi') {
        content = `DOI: ${data.content}`;
        title = `Paper from DOI: ${data.content}`;
        setPaperDoi(data.content);
      } else if (data.type === 'pdf') {
        content = 'PDF content would be extracted here';
        title = data.title || 'Uploaded PDF Document';
      }

      // Try edge function first, fallback to direct API call
      let result;
      try {
        result = await analyzePaperWithEdgeFunction(content, data.academicLevel, title, data.type);
      } catch (edgeError) {
        console.warn('Edge function failed, trying direct API call:', edgeError);
        result = await analyzePaperDirect(content, data.academicLevel, title, data.type);
      }
      
      // Save to database with the selected academic level
      const { error: insertError } = await supabase
        .from('papers')
        .insert([
          {
            user_id: user.id,
            title: title,
            doi: data.type === 'doi' ? data.content : paperDoi,
            abstract: data.type === 'abstract' ? data.content : null,
            input_type: data.type,
            academic_level: data.academicLevel, // Use the selected academic level
            analysis: result,
          }
        ]);

      if (insertError) {
        console.error('Error saving paper:', insertError);
        toast.error('Analysis completed but failed to save. Please try again.');
      } else {
        toast.success('Paper analyzed and saved successfully!');
      }
      
      setAnalysis(result);
      setPaperTitle(title);
      setAnalysisState({
        isProcessing: false,
        progress: 100,
        currentStep: 'Complete',
        error: undefined,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      setAnalysisState({
        isProcessing: false,
        progress: 0,
        currentStep: '',
        error: error.message || 'Analysis failed. Please try again.',
      });
    }
  };

  const handleNewAnalysis = () => {
    // Reset all analysis-related state
    setAnalysis(null);
    setPaperTitle('');
    setPaperDoi(undefined);
    setCurrentAcademicLevel('undergraduate');
    setAnalysisState({
      isProcessing: false,
      progress: 0,
      currentStep: '',
      error: undefined, // Clear any errors
    });
  };

  // Show loading spinner during processing
  if (analysisState.isProcessing) {
    return <LoadingSpinner state={analysisState} />;
  }

  // Show error state
  if (analysisState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{analysisState.error}</p>
            <button
              onClick={handleNewAnalysis}
              className="bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show analysis results or input form
  return (
    <main className="py-8 px-4 sm:px-6 lg:px-8">
      {analysis ? (
        <div>
          <div className="max-w-6xl mx-auto mb-8">
            <button
              onClick={handleNewAnalysis}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              ← Analyze New Paper
            </button>
          </div>
          <AnalysisDisplay
            analysis={analysis}
            paperTitle={paperTitle}
            academicLevel={currentAcademicLevel as any} // Use the selected academic level
            doi={paperDoi}
          />
        </div>
      ) : (
        <InputForm 
          onSubmit={handleAnalyze} 
          loading={analysisState.isProcessing}
          key="input-form" // Force re-render to reset form state
        />
      )}
    </main>
  );
}

function AppContent() {
  const { loading, user, session } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Reset showAuth when user is successfully authenticated
  useEffect(() => {
    if (user && session) {
      console.log('User authenticated, navigating to dashboard:', user);
      setShowAuth(false);
    }
  }, [user, session]);

  // Listen for custom auth event from header
  useEffect(() => {
    const handleShowAuth = () => setShowAuth(true);
    window.addEventListener('showAuth', handleShowAuth);
    return () => window.removeEventListener('showAuth', handleShowAuth);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Show landing page if no session exists and auth form is not requested */}
        {!session && !showAuth && (
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        )}

        {/* Show auth form if requested or if session exists but no user profile is loaded yet */}
        {(showAuth || (session && !user)) && (
          <AuthForm onBack={() => setShowAuth(false)} />
        )}

        {/* Show main app with routing if user is fully authenticated */}
        {user && session && (
          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={() => setShowAuth(true)} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/analysis/:paperId" element={<AnalysisView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;