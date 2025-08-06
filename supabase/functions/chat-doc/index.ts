import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getMatchingChunks } from './utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Get relevant chunks using vector similarity search
    const relevantChunks = await getMatchingChunks(supabase, openaiApiKey, query)

    if (relevantChunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: "I couldn't find any relevant information in the uploaded documents to answer your question." 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const prompt = `You are ManuDocs AI, a helpful documentation assistant specialized in export documentation, trade regulations, and compliance requirements. Answer the question based only on the below context from uploaded documents:

Context:
${relevantChunks.map(c => c.content).join("\n\n")}

Question: ${query}

Instructions:
- Answer only based on the provided context
- If the context doesn't contain enough information, say so clearly
- Be specific and cite relevant details from the documents
- Focus on practical, actionable information for export documentation`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    return new Response(
      JSON.stringify({ 
        answer,
        sources: relevantChunks.length,
        chunks: relevantChunks.map(c => ({ 
          file_path: c.file_path, 
          similarity: c.similarity 
        }))
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Something went wrong while processing your question.' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})