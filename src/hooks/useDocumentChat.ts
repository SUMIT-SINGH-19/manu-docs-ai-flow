import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface ChatResponse {
  answer: string
  sources?: number
  chunks?: Array<{
    file_path: string
    similarity: number
  }>
}

export const useDocumentChat = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)

  const askDocument = async (query: string): Promise<string> => {
    if (!query.trim()) {
      throw new Error('Please enter a question')
    }

    setIsLoading(true)
    
    try {
      // Get auth token for user-specific queries
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/functions/v1/chat-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error('Failed to get document-based response')
      }

      const data: ChatResponse = await response.json()
      setLastResponse(data)
      
      if (data.sources && data.sources > 0) {
        toast({
          title: "Answer found",
          description: `Based on ${data.sources} relevant document section${data.sources > 1 ? 's' : ''}`,
        })
      }
      
      return data.answer
    } catch (error: any) {
      console.error('Document chat error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to get response from documents. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    askDocument, 
    isLoading, 
    lastResponse,
    sources: lastResponse?.sources || 0
  }
}