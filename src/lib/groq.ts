import { AcademicLevel, PaperAnalysis } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Helper function to clean JSON response from markdown code blocks
function cleanJsonResponse(text: string): string {
  // Remove markdown code block fences
  let cleaned = text.trim();
  
  // Remove ```json at the beginning
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  // Remove ``` at the beginning (without json)
  else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  // Remove ``` at the end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return cleaned.trim();
}

export async function analyzePaper(
  content: string,
  academicLevel: AcademicLevel,
  title?: string
): Promise<PaperAnalysis> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const levelPrompts = {
    high_school: 'Explain this scientific paper in simple terms suitable for high school students. Use basic vocabulary and clear examples. Keep explanations concise but comprehensive. Focus on making complex concepts accessible through analogies and everyday language.',
    
    undergraduate: 'Analyze this paper for undergraduate students. Use appropriate scientific terminology with clear explanations. Provide moderate detail in each section, explaining methodologies and results with sufficient context. Include background information that helps understand the research significance. Each analysis section should be 2-3 detailed paragraphs.',
    
    graduate: 'Provide a comprehensive analysis suitable for graduate students. Include detailed technical explanations, research methodology insights, and critical evaluation of approaches. Discuss limitations and improvements with specific technical reasoning. Each analysis section should be 3-4 detailed paragraphs with in-depth explanations of methodologies, statistical approaches, and research implications. Include discussion of how this work fits into the broader research landscape.',
    
    professor: 'Deliver a thorough academic analysis for professors and researchers. Include extensive critical evaluation, detailed methodological assessment, comprehensive discussion of research implications, and expert-level insights. Provide detailed analysis of experimental design, statistical validity, and theoretical contributions. Each analysis section should be 4-5 comprehensive paragraphs with expert-level technical detail, critical assessment of methodology rigor, discussion of potential confounding factors, and detailed evaluation of the research\'s contribution to the field. Include suggestions for future research directions and potential collaborations.'
  };

  const prompt = `${levelPrompts[academicLevel]}

CRITICAL: You must analyze the ACTUAL content provided and generate PERSONALIZED scores based on the specific paper. Do NOT use generic or template scores. Each paper should have unique scores based on its actual quality, completeness, and credibility.

IMPORTANT: Adjust the depth and detail of ALL analysis sections based on the academic level:
- For HIGH SCHOOL: Keep explanations simple and concise (1-2 paragraphs per section)
- For UNDERGRADUATE: Provide moderate detail with clear explanations (2-3 paragraphs per section)
- For GRADUATE: Include comprehensive technical details and critical analysis (3-4 paragraphs per section)
- For PROFESSOR: Deliver extensive expert-level analysis with thorough evaluation (4-5 paragraphs per section)

Please analyze the following scientific paper and provide a structured response in JSON format with these exact fields. IMPORTANT: All scores must be based on the actual analysis of THIS specific paper, and the detail level must match the academic level (${academicLevel}):

{
  "one_line_summary": "This paper studies how X affects Y using Z method and finds that A improves B by C%.",
  "abstract_summary": "Detailed summary of the paper's abstract and main findings based on the actual content - adjust detail level for ${academicLevel} level",
  "aim_of_paper": "The specific research objectives and goals of THIS study - provide ${academicLevel}-appropriate detail",
  "methodology_technology_used": "Detailed description of the ACTUAL research methods, technologies, tools, and approaches used in THIS paper - expand detail significantly for higher academic levels",
  "results_obtained": "Comprehensive summary of the ACTUAL findings, data, and outcomes from THIS paper - include statistical details and significance for higher levels",
  "observations": "Key observations, patterns, and insights discovered in THIS specific research - provide deeper analysis for graduate/professor levels",
  "limitations_detailed": ["Specific limitation 1 from THIS paper", "Specific limitation 2 from THIS paper", "Specific limitation 3 from THIS paper"],
  "methodology_improvements": ["Specific improvement suggestion 1 for THIS paper", "Specific improvement suggestion 2 for THIS paper", "Specific improvement suggestion 3 for THIS paper"],
  "section_completeness": {
    "abstract": [ANALYZE ACTUAL ABSTRACT QUALITY: Rate 1-10 based on how complete and informative the abstract is],
    "introduction": [ANALYZE ACTUAL INTRODUCTION: Rate 1-10 based on background provided and problem statement clarity],
    "literature_review": [ANALYZE ACTUAL LITERATURE REVIEW: Rate 1-10 based on comprehensiveness of related work coverage],
    "methodology": [ANALYZE ACTUAL METHODOLOGY: Rate 1-10 based on detail and clarity of methods described],
    "results": [ANALYZE ACTUAL RESULTS: Rate 1-10 based on completeness and clarity of findings presentation],
    "discussion": [ANALYZE ACTUAL DISCUSSION: Rate 1-10 based on interpretation and implications provided],
    "conclusion": [ANALYZE ACTUAL CONCLUSION: Rate 1-10 based on how well conclusions are supported and future work is outlined]
  },
  "paper_quality_score": {
    "total": [CALCULATE ACTUAL TOTAL: Sum of all components below],
    "grammar": [ANALYZE ACTUAL GRAMMAR: Rate 1-20 based on language quality, sentence structure, and clarity],
    "structure": [ANALYZE ACTUAL STRUCTURE: Rate 1-20 based on logical flow, organization, and section coherence],
    "readability": [ANALYZE ACTUAL READABILITY: Rate 1-20 based on how easy it is to understand for the target audience],
    "argument_clarity": [ANALYZE ACTUAL ARGUMENTS: Rate 1-20 based on how clearly the research questions, hypotheses, and conclusions are presented],
    "referencing": [ANALYZE ACTUAL REFERENCES: Rate 1-20 based on citation quality, relevance, and completeness]
  },
  "core_concepts": ["Extract 4-6 ACTUAL key concepts/terms from THIS specific paper"],
  "glossary": [{"term": "ACTUAL technical term from the paper", "definition": "clear definition based on context"}],
  "credibility_analysis": {
    "score": [ANALYZE ACTUAL CREDIBILITY: Rate 1-100 based on methodology rigor, data quality, author credentials, journal quality if available],
    "factors": ["ACTUAL credibility factor 1 from THIS paper", "ACTUAL credibility factor 2 from THIS paper"],
    "journal_impact": "Assess journal quality if mentioned, otherwise rate based on research quality: High/Medium/Low",
    "citation_count": [If available in the paper, otherwise omit this field]
  },
  "citations": {
    "apa": "Generate ACTUAL APA format citation for THIS specific paper",
    "mla": "Generate ACTUAL MLA format citation for THIS specific paper", 
    "ieee": "Generate ACTUAL IEEE format citation for THIS specific paper"
  }
}

REMEMBER: Every score, rating, and analysis point must be based on the ACTUAL content of this specific paper. Do not use template values or generic scores. Analyze the real quality, completeness, and characteristics of the provided content. Adjust the verbosity and technical depth of explanations to match the ${academicLevel} academic level.

Paper content:
${content}

${title ? `Paper title: ${title}` : ''}`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert scientific paper analyzer. You must provide personalized, accurate analysis based on the actual content provided. Never use template or generic scores. Always respond with valid JSON format without markdown code blocks. Analyze each paper individually and provide unique scores based on its specific quality, completeness, and credibility. 

CRITICAL: Adjust the depth and detail of your analysis based on the academic level:
- HIGH SCHOOL: Simple language, basic explanations, concise summaries
- UNDERGRADUATE: Moderate technical detail, clear explanations with context
- GRADUATE: Comprehensive technical analysis, detailed methodology discussion
- PROFESSOR: Extensive expert-level analysis, critical evaluation, detailed technical assessment

The verbosity and technical depth should increase significantly from high school to professor level.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2, // Lower temperature for more consistent, analytical responses
      max_tokens: 8000 // Increased for more detailed responses at higher academic levels
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content_text = data.choices[0]?.message?.content;
  
  if (!content_text) {
    throw new Error('No response from Groq API');
  }

  try {
    // Clean the response to remove markdown code blocks
    const cleanedResponse = cleanJsonResponse(content_text);
    const analysis = JSON.parse(cleanedResponse);
    
    // Validate that scores are realistic and not template values
    if (analysis.paper_quality_score && typeof analysis.paper_quality_score.total === 'number') {
      // Ensure total is calculated correctly
      const components = analysis.paper_quality_score;
      const calculatedTotal = (components.grammar || 0) + (components.structure || 0) + 
                             (components.readability || 0) + (components.argument_clarity || 0) + 
                             (components.referencing || 0);
      analysis.paper_quality_score.total = calculatedTotal;
    }
    
    return analysis;
  } catch (error) {
    console.error('Failed to parse Groq response:', content_text);
    throw new Error('Invalid response format from AI service');
  }
}