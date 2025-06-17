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

CRITICAL INSTRUCTIONS:
1. You MUST analyze the ACTUAL paper content provided below - DO NOT say "paper is not provided"
2. The content IS provided in the "Paper content:" section below
3. Generate REAL analysis based on the ACTUAL content, not generic responses
4. If the content appears to be a DOI, abstract, or partial content, work with what is provided
5. Create personalized scores and insights based on the SPECIFIC content provided
6. DO NOT use template responses or say content is missing

IMPORTANT: You must analyze the ACTUAL content provided and generate PERSONALIZED scores based on the specific paper. Do NOT use generic or template scores. Each paper should have unique scores based on its actual quality, completeness, and credibility.

Please analyze the following scientific paper content and provide a structured response in JSON format with these exact fields. IMPORTANT: All scores must be based on the actual analysis of the PROVIDED content:

{
  "one_line_summary": "Based on the actual content provided, create a specific one-line summary of what this research studies and finds",
  "abstract_summary": "Detailed summary based on the ACTUAL content provided - analyze what is given",
  "aim_of_paper": "Extract the specific research objectives from the ACTUAL content provided",
  "methodology_technology_used": "Describe the research methods found in the ACTUAL content provided",
  "results_obtained": "Summarize the findings from the ACTUAL content provided",
  "observations": "Key observations from the ACTUAL content provided",
  "limitations_detailed": ["Extract specific limitations from the ACTUAL content", "If not explicitly stated, infer reasonable limitations", "Based on the methodology described"],
  "methodology_improvements": ["Suggest specific improvements based on the ACTUAL methodology described", "Provide realistic suggestions for the research approach shown", "Based on the actual study design"],
  "section_completeness": {
    "abstract": [Rate 1-10 based on the abstract quality in the provided content],
    "introduction": [Rate 1-10 based on introduction/background in the provided content],
    "literature_review": [Rate 1-10 based on literature review in the provided content],
    "methodology": [Rate 1-10 based on methodology detail in the provided content],
    "results": [Rate 1-10 based on results presentation in the provided content],
    "discussion": [Rate 1-10 based on discussion/interpretation in the provided content],
    "conclusion": [Rate 1-10 based on conclusions in the provided content]
  },
  "paper_quality_score": {
    "total": [Calculate sum of components below],
    "grammar": [Rate 1-20 based on language quality in the ACTUAL content],
    "structure": [Rate 1-20 based on organization in the ACTUAL content],
    "readability": [Rate 1-20 based on clarity in the ACTUAL content],
    "argument_clarity": [Rate 1-20 based on argument presentation in the ACTUAL content],
    "referencing": [Rate 1-20 based on citations in the ACTUAL content]
  },
  "core_concepts": ["Extract 4-6 key concepts from the ACTUAL content provided"],
  "glossary": [{"term": "Technical term from the ACTUAL content", "definition": "Definition based on context in the content"}],
  "credibility_analysis": {
    "score": [Rate 1-100 based on the quality of the ACTUAL content provided],
    "factors": ["Credibility factor based on ACTUAL content", "Another factor from ACTUAL content"],
    "journal_impact": "Assess based on content quality: High/Medium/Low",
    "citation_count": [Omit this field unless explicitly mentioned in content]
  },
  "citations": {
    "apa": "Generate APA citation based on the ACTUAL content and title provided",
    "mla": "Generate MLA citation based on the ACTUAL content and title provided", 
    "ieee": "Generate IEEE citation based on the ACTUAL content and title provided"
  }
}

REMEMBER: You MUST analyze the content provided below. DO NOT say the paper is not provided. Work with whatever content is given, whether it's a full paper, abstract, or DOI information.

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
          content: 'You are an expert scientific paper analyzer. You MUST analyze the actual content provided by the user. Never say "paper is not provided" or give generic responses. Always work with the content given, whether it\'s a full paper, abstract, DOI, or partial content. Provide personalized analysis based on what is actually provided. Always respond with valid JSON format without markdown code blocks.'
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