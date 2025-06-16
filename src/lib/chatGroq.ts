interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const systemPrompt = `You are a helpful AI assistant for PaperLenz, a platform that helps users understand scientific papers. You can:

1. Answer questions about PaperLenz features and how to use the platform
2. Provide general guidance about scientific research and papers
3. Help users understand research concepts and terminology
4. Explain how to interpret analysis results from PaperLenz
5. Suggest best practices for academic research

Keep your responses concise, helpful, and friendly. If users ask about specific papers, remind them that you can provide general guidance but they should use the main analysis feature for detailed paper analysis.

Platform features include:
- AI-powered paper analysis with multiple input methods (DOI, abstract, PDF)
- Academic level adaptation (high school to professor level)
- Comprehensive analysis including credibility scores, key insights, and improvement suggestions
- PDF report generation
- Paper history and note-taking
- Dashboard for managing analyzed papers`;

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
          content: systemPrompt
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from chat API');
  }

  return content;
}