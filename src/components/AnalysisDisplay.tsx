import React from 'react';
import { PaperAnalysis, AcademicLevel } from '../types';
import { 
  FileText, 
  BookOpen, 
  Key, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Quote,
  Download,
  Star,
  BarChart3,
  Brain,
  CheckCircle,
  Award,
  Zap,
  Microscope,
  Settings,
  Eye,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { generatePDFReport } from '../lib/pdfGenerator';
import { CredibilityChart } from './charts/CredibilityChart';

interface AnalysisDisplayProps {
  analysis: PaperAnalysis;
  paperTitle: string;
  academicLevel: AcademicLevel;
  doi?: string;
}

export function AnalysisDisplay({ analysis, paperTitle, academicLevel, doi }: AnalysisDisplayProps) {
  const handleDownloadPDF = () => {
    generatePDFReport(paperTitle, analysis, academicLevel, doi);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 16) return 'bg-green-500';
    if (score >= 12) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{paperTitle}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {academicLevel.replace('_', ' ').toUpperCase()} Level
              </span>
              {doi && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  DOI: {doi}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Download className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* One-Line Summary */}
      <div className="bg-amber-50 rounded-2xl shadow-lg p-8 border border-amber-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-amber-900 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">One-Line Summary</h2>
        </div>
        <p className="text-lg text-gray-800 font-medium leading-relaxed bg-white p-4 rounded-xl border border-amber-200">
          {analysis.one_line_summary}
        </p>
      </div>

      {/* Abstract Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-800 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Abstract Summary</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{analysis.abstract_summary}</p>
      </div>

      {/* Aim of Paper */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-900 p-2 rounded-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Aim of Paper</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{analysis.aim_of_paper}</p>
      </div>

      {/* Methodology/Technology Used */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-black p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Methodology/Technology Used</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{analysis.methodology_technology_used}</p>
      </div>

      {/* Results Obtained */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-800 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Results Obtained</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{analysis.results_obtained}</p>
      </div>

      {/* Observations */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-900 p-2 rounded-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Observations</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{analysis.observations}</p>
      </div>

      {/* Limitations & Improvements */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Limitations */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-500 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Limitations</h2>
          </div>
          <ul className="space-y-3">
            {analysis.limitations_detailed.map((limitation, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Methodology Improvements */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-500 p-2 rounded-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Methodology Improvements</h2>
          </div>
          <ul className="space-y-3">
            {analysis.methodology_improvements.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Glossary */}
      {analysis.glossary.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-black p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Glossary</h2>
          </div>
          <div className="space-y-4">
            {analysis.glossary.map(({ term, definition }, index) => (
              <div key={index} className="border-l-4 border-amber-900 pl-4">
                <h3 className="font-semibold text-gray-900">{term}</h3>
                <p className="text-gray-700 mt-1">{definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Score & Section Completeness */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Paper Quality Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-900 p-2 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Paper Quality Score</h2>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-amber-900 mb-2">{analysis.paper_quality_score.total}/100</div>
            <p className="text-gray-600">Overall Quality</p>
          </div>

          <div className="space-y-3">
            {Object.entries(analysis.paper_quality_score).filter(([key]) => key !== 'total').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getQualityScoreColor(value)}`}
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{value}/20</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Completeness */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-800 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Section Completeness</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(analysis.section_completeness).map(([section, score]) => (
              <div key={section} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{section.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credibility Analysis & Core Concepts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Credibility Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-500 p-2 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Credibility Analysis</h2>
          </div>
          
          <div className="mb-6">
            <CredibilityChart score={analysis.credibility_analysis.score} />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.credibility_analysis.score)}`}>
                {analysis.credibility_analysis.score}/100
              </div>
              <div>
                <p className="font-semibold text-gray-900">Overall Score</p>
                <p className="text-gray-600">{analysis.credibility_analysis.journal_impact}</p>
              </div>
            </div>
            
            {analysis.credibility_analysis.citation_count && (
              <p className="text-gray-600">
                <strong>Citations:</strong> {analysis.credibility_analysis.citation_count}
              </p>
            )}
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Factors</h3>
              <ul className="space-y-2">
                {analysis.credibility_analysis.factors.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-900 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Core Concepts */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-900 p-2 rounded-lg">
              <Key className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Core Concepts</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {analysis.core_concepts.map((concept, index) => (
              <span 
                key={index} 
                className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg font-medium text-base"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Citations */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gray-600 p-2 rounded-lg">
            <Quote className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Citations</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">APA Format</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {analysis.citations.apa}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">MLA Format</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {analysis.citations.mla}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">IEEE Format</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {analysis.citations.ieee}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}