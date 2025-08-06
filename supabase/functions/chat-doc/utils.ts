import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DocumentChunk {
  id: number
  file_path: string
  chunk_index: number
  content: string
  embedding: number[]
  similarity?: number
}

export async function getMatchingChunks(
  supabase: any,
  openaiApiKey: string,
  query: string,
  userId: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<DocumentChunk[]> {
  try {
    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate query embedding')
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Use Supabase's vector similarity search (requires pgvector extension)
    // This assumes you have a function `match_documents` in your database
    const { data: chunks, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id: userId
    })

    if (error) {
      console.error('Vector search error:', error)
      // Fallback to basic text search if vector search fails
      return await fallbackTextSearch(supabase, query, userId, limit)
    }

    return chunks || []
  } catch (error) {
    console.error('Error in getMatchingChunks:', error)
    // Fallback to basic text search
    return await fallbackTextSearch(supabase, query, userId, limit)
  }
}

async function fallbackTextSearch(
  supabase: any,
  query: string,
  userId: string,
  limit: number
): Promise<DocumentChunk[]> {
  try {
    // Basic text search as fallback with user filter
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('user_id', userId)
      .textSearch('content', query, { type: 'websearch' })
      .limit(limit)

    if (error) {
      console.error('Fallback search error:', error)
      return []
    }

    return chunks || []
  } catch (error) {
    console.error('Fallback search failed:', error)
    return []
  }
}