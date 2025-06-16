import { supabase } from './supabase';

interface AnalyzeRequest {
  content: string;
  academic_level: string;
  title?: string;
  input_type: 'doi' | 'abstract' | 'pdf';
}

interface EdgeFunctionResponse {
  success: boolean;
  analysis?: any;
  error?: string;
  details?: string;
  metadata?: {
    input_type: string;
    academic_level: string;
    title?: string;
    processed_at: string;
  };
}

export async function analyzePaperWithEdgeFunction(
  content: string,
  academicLevel: string,
  title?: string,
  inputType: 'doi' | 'abstract' | 'pdf' = 'abstract'
): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-paper', {
      body: {
        content,
        academic_level: academicLevel,
        title,
        input_type: inputType
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze paper');
    }

    const response = data as EdgeFunctionResponse;
    
    if (!response.success) {
      throw new Error(response.error || 'Analysis failed');
    }

    return response.analysis;
  } catch (error: any) {
    console.error('Error calling edge function:', error);
    throw new Error(error.message || 'Failed to analyze paper');
  }
}

// Alternative direct API call method (fallback)
export async function analyzePaperDirect(
  content: string,
  academicLevel: string,
  title?: string,
  inputType: 'doi' | 'abstract' | 'pdf' = 'abstract'
): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/analyze-paper`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      academic_level: academicLevel,
      title,
      input_type: inputType
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Direct API call error:', errorText);
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Analysis failed');
  }

  return data.analysis;
}