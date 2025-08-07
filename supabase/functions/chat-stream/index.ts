import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { StreamingTextResponse, OpenAIStream } from 'https://esm.sh/ai'
import OpenAI from 'https://esm.sh/openai'
import { getMatchingChunks } from '../chat-doc/utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages = [] } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Require auth and resolve current user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid auth token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Find the latest user message for retrieval
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')
    const query = lastUserMessage?.content?.toString() || ''

    // Retrieve relevant chunks scoped to this user (multi-tenant)
    const relevantChunks = query
      ? await getMatchingChunks(supabase, openaiApiKey, query, user.id)
      : []

    const systemPrompt = `You are ManuDocs AI, a helpful documentation assistant specialized in export documentation, trade regulations, and compliance requirements. Answer the question based only on the below context from uploaded documents when available. If the context isn't sufficient, say so clearly and avoid fabricating details.\n\nContext:\n${relevantChunks.map((c: any) => c.content).join('\n\n')}`

    // Prepend our system/context message, keep user/assistant history
    const oaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m: any) => m.role !== 'system'),
    ]

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Use a fast streaming-capable model for great UX
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: oaiMessages as any,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('chat-stream error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to stream response' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
