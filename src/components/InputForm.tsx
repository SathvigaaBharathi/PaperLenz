import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Link, Upload, Zap, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface InputFormProps {
  onSubmit: (data: { 
    type: 'doi' | 'abstract' | 'pdf'; 
    content: string; 
    title?: string;
    academicLevel: string;
  }) => void;
  loading: boolean;
}

export function InputForm({ onSubmit, loading }: InputFormProps) {
  const [inputType, setInputType] = useState<'doi' | 'abstract' | 'pdf'>('doi');
  const [doiInput, setDoiInput] = useState('');
  const [abstractInput, setAbstractInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [academicLevel, setAcademicLevel] = useState('undergraduate');

  const academicLevels = [
    { value: 'high_school', label: 'High School', description: 'Simple explanations', icon: '🎓' },
    { value: 'undergraduate', label: 'Undergraduate', description: 'Balanced detail', icon: '📚' },
    { value: 'graduate', label: 'Graduate', description: 'Technical depth', icon: '🔬' },
    { value: 'professor', label: 'Professor', description: 'Expert analysis', icon: '👨‍🏫' },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onSubmit({ 
          type: 'pdf', 
          content: result, 
          title: file.name.replace('.pdf', ''),
          academicLevel
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, [onSubmit, academicLevel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (inputType) {
      case 'doi':
        if (!doiInput.trim()) {
          toast.error('Please enter a DOI');
          return;
        }
        onSubmit({ type: 'doi', content: doiInput.trim(), academicLevel });
        break;
      case 'abstract':
        if (!abstractInput.trim()) {
          toast.error('Please enter an abstract');
          return;
        }
        onSubmit({ 
          type: 'abstract', 
          content: abstractInput.trim(),
          title: titleInput.trim() || undefined,
          academicLevel
        });
        break;
    }
  };

  const inputOptions = [
    { 
      type: 'doi' as const, 
      label: 'DOI Link', 
      icon: Link,
      description: 'Quick & accurate',
      color: 'amber'
    },
    { 
      type: 'abstract' as const, 
      label: 'Abstract', 
      icon: FileText,
      description: 'Copy & paste',
      color: 'gray'
    },
    { 
      type: 'pdf' as const, 
      label: 'PDF Upload', 
      icon: Upload,
      description: 'Full document',
      color: 'black'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Analyze Your Scientific Paper
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose your preferred input method and let our AI break down complex research into clear, understandable insights
        </p>
      </div>

      {/* Academic Level Selection */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-900 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Academic Level</h3>
              <p className="text-sm text-gray-600">Choose your academic level for tailored analysis</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {academicLevels.map((level) => (
              <label
                key={level.value}
                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                  academicLevel === level.value
                    ? 'border-amber-900 bg-amber-50 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="academic-level"
                  value={level.value}
                  checked={academicLevel === level.value}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">{level.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{level.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{level.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Input Type Selector */}
      <div className="flex justify-center mb-10">
        <div className="bg-amber-50 p-2 rounded-2xl inline-flex border border-amber-200">
          {inputOptions.map(({ type, label, icon: Icon, description, color }) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className={`flex flex-col items-center space-y-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 min-w-[120px] ${
                inputType === type
                  ? `bg-white text-${color === 'amber' ? 'amber-900' : color === 'gray' ? 'gray-800' : 'black'} shadow-lg border border-${color === 'amber' ? 'amber-200' : color === 'gray' ? 'gray-200' : 'gray-300'}`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs opacity-75">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Forms */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        {inputType === 'doi' && (
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-amber-900 p-2 rounded-lg">
                <Link className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enter DOI</h3>
                <p className="text-sm text-gray-600">Digital Object Identifier for precise paper lookup</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-3">
                  DOI (Digital Object Identifier)
                </label>
                <div className="relative">
                  <input
                    id="doi"
                    type="text"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                    placeholder="e.g., 10.1038/nature12373"
                    className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent transition-all text-lg bg-gray-50 focus:bg-white"
                  />
                  <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Most accurate method - directly fetches paper metadata and content</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !doiInput.trim()}
                className="w-full bg-amber-900 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-amber-800 focus:ring-2 focus:ring-amber-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Zap className="h-5 w-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Paper'}</span>
              </button>
            </form>
          </div>
        )}

        {inputType === 'abstract' && (
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gray-800 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Paste Abstract</h3>
                <p className="text-sm text-gray-600">Copy the abstract from your research paper</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-3">
                  Paper Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Enter the paper title for better context"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div>
                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-3">
                  Abstract
                </label>
                <textarea
                  id="abstract"
                  value={abstractInput}
                  onChange={(e) => setAbstractInput(e.target.value)}
                  placeholder="Paste the complete abstract from the scientific paper here..."
                  rows={8}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                />
                <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Analysis quality depends on abstract completeness and detail</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !abstractInput.trim()}
                className="w-full bg-gray-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-900 focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Zap className="h-5 w-5" />
                <span>{loading ? 'Analyzing...' : 'Analyze Abstract'}</span>
              </button>
            </form>
          </div>
        )}

        {inputType === 'pdf' && (
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-black p-2 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload PDF</h3>
                <p className="text-sm text-gray-600">Upload your research paper for comprehensive analysis</p>
              </div>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-black bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                  isDragActive ? 'bg-black' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-8 w-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Supports PDF files up to 10MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-900" />
          <span>Need help? Try starting with a DOI for the most accurate results</span>
        </div>
      </div>
    </div>
  );
}