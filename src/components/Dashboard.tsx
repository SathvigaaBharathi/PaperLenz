import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generatePDFReport } from '../lib/pdfGenerator';
import { PaperAnalysis, AcademicLevel } from '../types';
import toast from 'react-hot-toast';

interface PaperHistory {
  id: string;
  title: string;
  doi?: string;
  input_type: 'doi' | 'abstract' | 'pdf';
  academic_level: AcademicLevel;
  created_at: string;
  analysis: PaperAnalysis;
  notes?: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<PaperHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'doi' | 'abstract' | 'pdf'>('all');
  const [selectedPaper, setSelectedPaper] = useState<PaperHistory | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<PaperHistory | null>(null);

  useEffect(() => {
    if (user) {
      fetchPapers();
    }
  }, [user]);

  const fetchPapers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching papers:', error);
        toast.error('Failed to load papers');
        return;
      }

      setPapers(data || []);
    } catch (err) {
      console.error('Error fetching papers:', err);
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || paper.input_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleNotesUpdate = async (paperId: string, newNotes: string) => {
    try {
      const { error } = await supabase
        .from('papers')
        .update({ notes: newNotes })
        .eq('id', paperId)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error updating notes:', error);
        toast.error('Failed to update notes');
        return;
      }

      setPapers(prev => prev.map(paper => 
        paper.id === paperId ? { ...paper, notes: newNotes } : paper
      ));
      toast.success('Notes updated successfully');
    } catch (err) {
      console.error('Error updating notes:', err);
      toast.error('Failed to update notes');
    }
  };

  // Open delete confirmation modal
  const handleDeletePaper = (paper: PaperHistory) => {
    setPaperToDelete(paper);
    setShowDeleteModal(true);
  };

  // Confirm and execute deletion
  const confirmDelete = async () => {
    if (!paperToDelete) return;

    try {
      const { error } = await supabase
        .from('papers')
        .delete()
        .eq('id', paperToDelete.id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Error deleting paper:', error);
        toast.error('Failed to delete paper');
        return;
      }

      setPapers(prev => prev.filter(paper => paper.id !== paperToDelete.id));
      toast.success('Paper deleted successfully');
    } catch (err) {
      console.error('Error deleting paper:', err);
      toast.error('Failed to delete paper');
    } finally {
      setShowDeleteModal(false);
      setPaperToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPaperToDelete(null);
  };

  const handleViewPaper = (paperId: string) => {
    navigate(`/analysis/${paperId}`);
  };

  const handleDownloadPDF = (paper: PaperHistory) => {
    generatePDFReport(paper.title, paper.analysis, paper.academic_level, paper.doi);
  };

  const openNotesModal = (paper: PaperHistory) => {
    setSelectedPaper(paper);
    setNotes(paper.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    if (selectedPaper) {
      handleNotesUpdate(selectedPaper.id, notes);
      setShowNotesModal(false);
      setSelectedPaper(null);
      setNotes('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'doi': return 'bg-amber-100 text-amber-800';
      case 'abstract': return 'bg-gray-100 text-gray-800';
      case 'pdf': return 'bg-amber-200 text-amber-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateStats = () => {
    const totalPapers = papers.length;
    const avgCredibility = totalPapers > 0 
      ? Math.round(papers.reduce((acc, p) => acc + p.analysis.credibility_analysis.score, 0) / totalPapers)
      : 0;
    const papersWithNotes = papers.filter(p => p.notes).length;
    const daysSinceLastAnalysis = totalPapers > 0 
      ? Math.ceil((Date.now() - new Date(papers[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return { totalPapers, avgCredibility, papersWithNotes, daysSinceLastAnalysis };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.username}! Here's your research analysis overview.
            </p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-2 bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Analyze New Paper</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-amber-900" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
              <p className="text-sm text-gray-600">Papers Analyzed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-200 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-amber-900" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgCredibility}</p>
              <p className="text-sm text-gray-600">Avg. Credibility</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-gray-800" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.papersWithNotes}</p>
              <p className="text-sm text-gray-600">With Notes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-3 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.daysSinceLastAnalysis}</p>
              <p className="text-sm text-gray-600">Days Since Last</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            >
              <option value="all">All Types</option>
              <option value="doi">DOI</option>
              <option value="abstract">Abstract</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-6">
        {filteredPapers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-amber-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Papers Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start by analyzing your first scientific paper!'
              }
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Analyze Paper</span>
            </Link>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div key={paper.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200">
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Main content area */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                      <FileText className="h-6 w-6 text-amber-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                        {paper.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(paper.input_type)}`}>
                          {paper.input_type.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(paper.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`text-sm font-medium ${getCredibilityColor(paper.analysis.credibility_analysis.score)}`}>
                            {paper.analysis.credibility_analysis.score}/100
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 break-words">
                        {paper.analysis.one_line_summary}
                      </p>
                      {paper.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 line-clamp-2 break-words">
                            <strong>Notes:</strong> {paper.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons - always visible on separate row for mobile */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openNotesModal(paper)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm"
                      title="Add/Edit Notes"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Notes</span>
                    </button>
                    <button
                      onClick={() => handleViewPaper(paper.id)}
                      className="flex items-center space-x-1 px-3 py-2 text-amber-900 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all text-sm"
                      title="View Analysis"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(paper)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all text-sm"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleDeletePaper(paper)}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-sm"
                      title="Delete Paper"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Notes
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 break-words">
              {selectedPaper.title}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this paper..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent resize-none"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveNotes}
                className="flex-1 bg-amber-900 text-white py-3 rounded-xl font-semibold hover:bg-amber-800 transition-all"
              >
                Save Notes
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && paperToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Paper
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this paper? This action cannot be undone.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-gray-900 line-clamp-2 break-words">
                {paperToDelete.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {new Date(paperToDelete.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Delete Paper
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}