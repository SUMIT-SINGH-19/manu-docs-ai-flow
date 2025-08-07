import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, providedDocType } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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
      throw new Error('OPENAI_API_KEY not set')
    }

    // Download the PDF from the 'docs' bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('docs')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const parsedText = await extractTextFromPDF(arrayBuffer)

    // Classify document type if not provided
    let docType = providedDocType || ''
    if (!docType) {
      const openai = new OpenAI({ apiKey: openaiApiKey })
      const prompt = `Classify the export/import document type based on the extracted text below. Respond with a single lowercase label from this set: invoice, bill_of_lading, packing_list, iec, shipping_bill, other.\n\nText:\n${parsedText.slice(0, 7000)}`
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You classify export-import document types.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 20,
      })
      docType = completion.choices?.[0]?.message?.content?.trim().toLowerCase() || 'other'
      docType = docType.replace(/\s+/g, '_')
    }

    const filename = filePath.split('/').pop() || 'unknown.pdf'

    // Persist parsed text and classification
    const { error: insertError } = await supabase
      .from('parsed_docs')
      .insert({
        user_id: user.id,
        filename,
        doc_type: docType,
        parsed_text: parsedText,
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, doc_type: docType, filename }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('parse-doc error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to parse document' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Simple text extraction (placeholder). Consider a robust parser for production
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer)
  const text = new TextDecoder().decode(uint8Array)
  const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs)
  if (textMatches) {
    return textMatches
      .map((match) =>
        match
          .replace(/stream\s*|\s*endstream/g, '')
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .join(' ')
  }
  return 'Unable to extract text from PDF'
}
