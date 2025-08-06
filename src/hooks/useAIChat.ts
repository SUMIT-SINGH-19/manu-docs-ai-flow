import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false)

  const askAI = async (question: string, documentText: string = '') => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/functions/v1/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          documentText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      return data.answer
    } catch (error) {
      console.error('AI Chat error:', error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { askAI, isLoading }
}