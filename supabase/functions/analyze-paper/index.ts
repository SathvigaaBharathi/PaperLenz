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

    // Define level-specific prompts with enhanced detail requirements
    const levelPrompts = {
      high_school: 'Explain this scientific paper in simple, concise terms suitable for high school students. Use basic vocabulary, clear examples, and avoid complex jargon. Keep explanations brief and focused on the main points.',
      undergraduate: 'Analyze this paper for undergraduate students with detailed explanations of scientific concepts and methodology. Use appropriate scientific terminology with clear explanations. Provide comprehensive insights into research methods, data interpretation, and implications. Include technical details that help students understand the research process and significance.',
      graduate: 'Provide a thorough, detailed analysis suitable for graduate students. Include comprehensive technical details, critical evaluation of research methodology, in-depth discussion of statistical approaches, and detailed assessment of study limitations. Offer extensive insights into research implications, theoretical frameworks, and connections to broader scientific literature.',
      professor: 'Deliver an exhaustive academic analysis for professors and researchers with extensive critical evaluation and detailed technical insights. Provide comprehensive assessment of methodology rigor, statistical validity, theoretical contributions, and research implications. Include detailed critique of experimental design, data analysis approaches, and thorough evaluation of the study\'s contribution to the field.'
    }

    const prompt = `${levelPrompts[academic_level as keyof typeof levelPrompts] || levelPrompts.undergraduate}

CRITICAL INSTRUCTIONS:
1. You MUST analyze the ACTUAL paper content provided below - DO NOT say "paper is not provided"
2. The content IS provided in the "Paper content:" section below
3. Generate REAL analysis based on the ACTUAL content, not generic responses
4. If the content appears to be a DOI, abstract, or partial content, work with what is provided
5. Create personalized scores and insights based on the SPECIFIC content provided
6. DO NOT use template responses or say content is missing
7. RESPOND ONLY WITH VALID JSON - no explanatory text, no markdown, no code blocks
8. Do not start your response with any explanatory text

Please analyze the following scientific paper content and provide a comprehensive structured response in JSON format with these exact fields. IMPORTANT: All scores must be based on the actual analysis of the PROVIDED content:

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

Paper content:
${content}

${title ? `Paper title: ${title}` : ''}

Input type: ${input_type}

REMEMBER: You MUST analyze the content provided above. DO NOT say the paper is not provided. Work with whatever content is given. Respond ONLY with the JSON object. No explanatory text before or after.`

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
            content: 'You are an expert scientific paper analyzer. You MUST analyze the actual content provided by the user. Never say "paper is not provided" or give generic responses. Always work with the content given, whether it\'s a full paper, abstract, DOI, or partial content. Provide personalized analysis based on what is actually provided. Always respond with ONLY valid JSON format - no explanatory text, no markdown code blocks, no prefacing comments. Start your response directly with the opening brace { and end with the closing brace }.'
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