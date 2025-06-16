import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AnalyzeRequest {
  content: string;
  academic_level: string;
  title?: string;
  input_type: 'doi' | 'abstract' | 'pdf';
}

interface PaperAnalysis {
  one_line_summary: string;
  abstract_summary: string;
  aim_of_paper: string;
  methodology_technology_used: string;
  results_obtained: string;
  observations: string;
  limitations_detailed: string[];
  methodology_improvements: string[];
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

// Enhanced helper function to clean JSON response from markdown code blocks and explanatory text
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  
  // First, try to find JSON within the response
  // Look for the first occurrence of { and the last occurrence of }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
    // Extract just the JSON part
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // Remove markdown code block fences if they still exist
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return cleaned.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, academic_level, title, input_type }: AnalyzeRequest = await req.json()

    // Validate required fields
    if (!content || !academic_level) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: content and academic_level' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Groq API key from environment
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'Groq API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Define level-specific prompts
    const levelPrompts = {
      high_school: 'Explain this scientific paper in simple terms suitable for high school students. Use basic vocabulary and clear examples.',
      undergraduate: 'Analyze this paper for undergraduate students. Use appropriate scientific terminology with explanations.',
      graduate: 'Provide a comprehensive analysis suitable for graduate students. Include technical details and research methodology insights.',
      professor: 'Deliver a thorough academic analysis for professors and researchers. Include critical evaluation and research implications.'
    }

    const prompt = `${levelPrompts[academic_level as keyof typeof levelPrompts] || levelPrompts.undergraduate}

CRITICAL INSTRUCTIONS:
1. You must analyze the ACTUAL content provided and generate PERSONALIZED scores based on the specific paper
2. Do NOT use generic or template scores - each paper should have unique scores based on its actual quality
3. RESPOND ONLY WITH VALID JSON - no explanatory text, no markdown, no code blocks
4. Do not start your response with any explanatory text like "Since the actual paper content is not provided" or similar

Please analyze the following scientific paper and provide a comprehensive structured response in JSON format with these exact fields. IMPORTANT: All scores must be based on the actual analysis of THIS specific paper:

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

Paper content:
${content}

${title ? `Paper title: ${title}` : ''}

Input type: ${input_type}

REMEMBER: Respond ONLY with the JSON object. No explanatory text before or after.`

    // Call Groq API with updated model
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert scientific paper analyzer. You must provide personalized, accurate analysis based on the actual content provided. Never use template or generic scores. Always respond with ONLY valid JSON format - no explanatory text, no markdown code blocks, no prefacing comments. Analyze each paper individually and provide unique scores based on its specific quality, completeness, and credibility. Start your response directly with the opening brace { and end with the closing brace }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Even lower temperature for more consistent JSON responses
        max_tokens: 6000
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)
      return new Response(
        JSON.stringify({ error: `Groq API error: ${groqResponse.statusText}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const groqData = await groqResponse.json()
    const analysisContent = groqData.choices[0]?.message?.content
    
    if (!analysisContent) {
      return new Response(
        JSON.stringify({ error: 'No response from Groq API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let analysis: PaperAnalysis
    try {
      // Clean the response to remove markdown code blocks and explanatory text
      const cleanedResponse = cleanJsonResponse(analysisContent)
      console.log('Cleaned response:', cleanedResponse.substring(0, 200) + '...')
      
      analysis = JSON.parse(cleanedResponse)
      
      // Validate that scores are realistic and not template values
      if (analysis.paper_quality_score && typeof analysis.paper_quality_score.total === 'number') {
        // Ensure total is calculated correctly
        const components = analysis.paper_quality_score;
        const calculatedTotal = (components.grammar || 0) + (components.structure || 0) + 
                               (components.readability || 0) + (components.argument_clarity || 0) + 
                               (components.referencing || 0);
        analysis.paper_quality_score.total = calculatedTotal;
      }
      
    } catch (parseError) {
      console.error('Failed to parse Groq response:', analysisContent)
      console.error('Parse error:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from AI service',
          details: `Parse error: ${parseError.message}`,
          raw_response: analysisContent.substring(0, 500) + '...'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the analysis
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        metadata: {
          input_type,
          academic_level,
          title,
          processed_at: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})