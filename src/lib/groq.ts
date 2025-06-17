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
    high_school: 'Explain this scientific paper in simple, concise terms suitable for high school students. Use basic vocabulary, clear examples, and avoid complex jargon. Keep explanations brief and focused on the main points.',
    undergraduate: 'Analyze this paper for undergraduate students with detailed explanations of scientific concepts and methodology. Use appropriate scientific terminology with clear explanations. Provide comprehensive insights into research methods, data interpretation, and implications. Include technical details that help students understand the research process and significance.',
    graduate: 'Provide a thorough, detailed analysis suitable for graduate students. Include comprehensive technical details, critical evaluation of research methodology, in-depth discussion of statistical approaches, and detailed assessment of study limitations. Offer extensive insights into research implications, theoretical frameworks, and connections to broader scientific literature.',
    professor: 'Deliver an exhaustive academic analysis for professors and researchers with extensive critical evaluation and detailed technical insights. Provide comprehensive assessment of methodology rigor, statistical validity, theoretical contributions, and research implications. Include detailed critique of experimental design, data analysis approaches, and thorough evaluation of the study\'s contribution to the field.'
  };

  const prompt = `${levelPrompts[academicLevel]}

CRITICAL: You must analyze the ACTUAL content provided and generate PERSONALIZED scores based on the specific paper. Do NOT use generic or template scores. Each paper should have unique scores based on its actual quality, completeness, and credibility.

Please analyze the following scientific paper and provide a structured response in JSON format with these exact fields. IMPORTANT: All scores must be based on the actual analysis of THIS specific paper:

{
  "one_line_summary": "This paper studies how X affects Y using Z method and finds that A improves B by C%.",
  "abstract_summary": "Detailed summary of the paper's abstract and main findings based on the actual content",
  "aim_of_paper": "The specific research objectives and goals of THIS study",
  "methodology_technology_used": "Detailed description of the ACTUAL research methods, technologies, tools, and approaches used in THIS paper",
  "results_obtained": "Comprehensive summary of the ACTUAL findings, data, and outcomes from THIS paper",
  "observations": "Key observations, patterns, and insights discovered in THIS specific research",
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

REMEMBER: Every score, rating, and analysis point must be based on the ACTUAL content of this specific paper. Do not use template values or generic scores. Analyze the real quality, completeness, and characteristics of the provided content.

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
          content: 'You are an expert scientific paper analyzer. You must provide personalized, accurate analysis based on the actual content provided. Never use template or generic scores. Always respond with valid JSON format without markdown code blocks. Analyze each paper individually and provide unique scores based on its specific quality, completeness, and credibility.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2, // Lower temperature for more consistent, analytical responses
      max_tokens: 6000
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