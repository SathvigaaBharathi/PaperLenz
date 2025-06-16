import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microscope, BookOpen, Brain, Download, Star, ArrowRight, Users, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      // If user is authenticated, navigate to analyze page
      navigate('/analyze');
    } else {
      // If user is not authenticated, show auth form
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-amber-200">
            <Star className="h-4 w-4" />
            <span>AI-Powered Scientific Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Make Science
            <span className="text-amber-900 block">
              Simple & Clear
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform complex research papers into easy-to-understand insights. 
            Perfect for students, researchers, and anyone curious about science.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-amber-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>{user ? 'Start Analyzing Now' : 'Get Started'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm">Join 10,000+ researchers</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">30s</div>
              <div className="text-sm text-gray-600">Average Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-800">4</div>
              <div className="text-sm text-gray-600">Academic Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">100%</div>
              <div className="text-sm text-gray-600">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PaperLenz?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed to make scientific literature accessible to everyone, regardless of their background
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="bg-amber-900 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Level Adaptation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Content automatically adjusted for your academic level - from high school to professor level understanding.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="bg-amber-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Credibility Check
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive analysis of journal quality, citation metrics, and research reliability indicators.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="bg-black w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Professional Reports
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Generate clean, academic-quality PDF reports with citations, glossaries, and key insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to understand any scientific paper
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="bg-amber-900 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Upload Your Paper
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Paste a DOI link, upload a PDF, or enter an abstract. We support multiple formats for maximum convenience.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="bg-amber-800 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  AI Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI processes the content and adapts the analysis to your academic level for optimal understanding.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Get Clear Insights
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive comprehensive analysis with simplified summaries, key takeaways, and downloadable reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-amber-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Understand Science Better?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and researchers who are already using PaperLenz to decode complex scientific literature.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-amber-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {user ? 'Start Your Analysis' : 'Start Your First Analysis'}
          </button>
          <div className="mt-6 flex items-center justify-center space-x-4 text-amber-100 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Instant results</span>
            </div>
            <span>•</span>
            <span>100% Free</span>
            <span>•</span>
            <span>Easy to use</span>
          </div>
        </div>
      </section>
    </div>
  );
}