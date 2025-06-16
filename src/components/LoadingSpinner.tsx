import React from 'react';
import { AnalysisState } from '../types';
import { Zap, FileText, Brain, CheckCircle, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  state: AnalysisState;
}

export function LoadingSpinner({ state }: LoadingSpinnerProps) {
  const steps = [
    { id: 'parsing', label: 'Parsing document', icon: FileText, description: 'Reading your paper' },
    { id: 'analyzing', label: 'AI analysis in progress', icon: Brain, description: 'Understanding content' },
    { id: 'generating', label: 'Generating insights', icon: Sparkles, description: 'Creating summary' },
    { id: 'complete', label: 'Analysis complete', icon: CheckCircle, description: 'Ready to view' },
  ];

  const currentStepIndex = steps.findIndex(step => 
    step.label.toLowerCase().includes(state.currentStep.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-200">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="h-10 w-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Paper</h2>
            <p className="text-gray-600">Our AI is processing your scientific document with care</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="bg-amber-900 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">{state.progress}% Complete</p>
              <div className="flex items-center space-x-1 text-amber-900">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">AI Working</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              
              return (
                <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-amber-50 border border-amber-200' : 
                  isComplete ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-amber-900 text-white' :
                    isComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${
                      isActive ? 'text-amber-900' :
                      isComplete ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                  {isComplete && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-amber-900 rounded-full animate-pulse"></div>
              <span>This usually takes 30-60 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}