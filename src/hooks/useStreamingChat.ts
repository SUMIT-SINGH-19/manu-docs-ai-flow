import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const useStreamingChat = () => {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (messages: ChatMessage[]): Promise<string> => {
    setResponse('')
    setLoading(true)

    let fullText = ''

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/functions/v1/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ messages }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to start streaming response')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setResponse((prev) => prev + chunk)
      }

      return fullText
    } catch (error: any) {
      console.error('Streaming chat error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to stream AI response. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { response, sendMessage, loading }
}
