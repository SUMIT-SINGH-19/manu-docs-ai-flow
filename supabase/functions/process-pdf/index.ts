import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    // Extract userId from filePath if not available from auth
    if (!userId && filePath.includes('/')) {
      userId = filePath.split('/')[0]
    }

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert to array buffer
    const arrayBuffer = await fileData.arrayBuffer()
    
    // For now, we'll use a simple text extraction approach
    // In production, you'd want to use a proper PDF parsing library
    const text = await extractTextFromPDF(arrayBuffer)
    
    // Chunk the text
    const chunks = chunkText(text, 1000)
    
    // Generate embeddings and store chunks
    const chunksData = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Generate embedding using OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunk
        })
      })

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      // Store in database with user_id
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert({
          user_id: userId,
          file_path: filePath,
          document_name: filePath.split('/').pop() || 'unknown',
          chunk_index: i,
          content: chunk,
          embedding: embedding
        })

      if (insertError) {
        console.error('Error inserting chunk:', insertError)
      } else {
        chunksData.push({ index: i, content: chunk })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksCount: chunks.length,
        message: 'PDF processed successfully'
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
      JSON.stringify({ error: error.message || 'Something went wrong while processing the PDF.' }),
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

// Simple text extraction (placeholder - in production use a proper PDF library)
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a simplified approach - you'd want to use a proper PDF parsing library
  const uint8Array = new Uint8Array(arrayBuffer)
  const text = new TextDecoder().decode(uint8Array)
  
  // Very basic text extraction - extract text between stream markers
  const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs)
  if (textMatches) {
    return textMatches.map(match => {
      // Remove stream markers and clean up
      return match.replace(/stream\s*|\s*endstream/g, '')
        .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ')
        .trim()
    }).join(' ')
  }
  
  return 'Unable to extract text from PDF'
}

function chunkText(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/)
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue
    
    if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.')
      }
      currentChunk = trimmedSentence
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk + '.')
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0)
}