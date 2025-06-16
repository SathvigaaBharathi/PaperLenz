export interface User {
  id: string;
  email: string;
  username: string;
  academic_level: AcademicLevel;
  created_at: string;
}

export type AcademicLevel = 'high_school' | 'undergraduate' | 'graduate' | 'professor';

export interface Paper {
  id: string;
  user_id: string;
  title: string;
  doi?: string;
  abstract?: string;
  input_type: 'doi' | 'abstract' | 'pdf';
  academic_level: AcademicLevel;
  analysis: PaperAnalysis;
  created_at: string;
}

export interface PaperAnalysis {
  // One-line summary at the top
  one_line_summary: string;
  
  // Main content sections
  abstract_summary: string;
  aim_of_paper: string;
  methodology_technology_used: string;
  results_obtained: string;
  observations: string;
  limitations_detailed: string[];
  methodology_improvements: string[];
  
  // Quality metrics
  section_completeness: {
    abstract: number;
    introduction: number;
    literature_review: number;
    methodology: number;
    results: number;
    discussion: number;
    conclusion: number;
  };
  paper_quality_score: {
    total: number;
    grammar: number;
    structure: number;
    readability: number;
    argument_clarity: number;
    referencing: number;
  };
  
  // Supporting content
  core_concepts: string[];
  glossary: Array<{ term: string; definition: string; }>;
  credibility_analysis: {
    score: number;
    factors: string[];
    journal_impact: string;
    citation_count?: number;
  };
  citations: {
    apa: string;
    mla: string;
    ieee: string;
  };
}

export interface AnalysisState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}