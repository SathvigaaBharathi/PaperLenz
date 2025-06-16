import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AnalysisDisplay } from './AnalysisDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAnalysis, AcademicLevel } from '../types';

interface Paper {
  id: string;
  title: string;
  doi?: string;
  academic_level: AcademicLevel;
  analysis: PaperAnalysis;
}

export function AnalysisView() {
  const { paperId } = useParams<{ paperId: string }>();
  const { user } = useAuth();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId || !user) return;

    const fetchPaper = async () => {
      try {
        const { data, error } = await supabase
          .from('papers')
          .select('id, title, doi, academic_level, analysis')
          .eq('id', paperId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Paper not found');
          } else {
            setError('Failed to load paper');
          }
          return;
        }

        setPaper(data);
      } catch (err) {
        console.error('Error fetching paper:', err);
        setError('Failed to load paper');
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId, user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <LoadingSpinner 
        state={{
          isProcessing: true,
          progress: 50,
          currentStep: 'Loading paper analysis...'
        }} 
      />
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Paper Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested paper could not be found.'}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <AnalysisDisplay
        analysis={paper.analysis}
        paperTitle={paper.title}
        academicLevel={paper.academic_level}
        doi={paper.doi}
      />
    </div>
  );
}