import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import AuthComponent from '@/components/AuthComponent'
import PDFUpload from '@/components/PDFUpload'
import UserDocuments from '@/components/UserDocuments'
import { useDocumentChat } from '@/hooks/useDocumentChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function DocumentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState<Array<{
    type: 'question' | 'answer'
    content: string
    sources?: number
  }>>([])
  
  const { askDocument, isLoading, sources } = useDocumentChat()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) return
    
    const currentQuestion = question.trim()
    setQuestion('')
    
    // Add question to conversation
    setConversation(prev => [...prev, {
      type: 'question',
      content: currentQuestion
    }])

    try {
      const answer = await askDocument(currentQuestion)
      
      // Add answer to conversation
      setConversation(prev => [...prev, {
        type: 'answer',
        content: answer,
        sources
      }])
    } catch (error) {
      // Error is already handled by the hook
      setConversation(prev => [...prev, {
        type: 'answer',
        content: "Sorry, I couldn't process your question. Please try again."
      }])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <AuthComponent />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Document Management */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">ManuDocs AI</h1>
            <p className="text-muted-foreground">Upload and chat with your export documents</p>
          </div>
          
          <AuthComponent />
          
          <PDFUpload />
          
          <UserDocuments />
        </div>

        {/* Right Column - Chat Interface */}
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Document Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversation.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a PDF document and start asking questions about it!</p>
                    <p className="text-sm mt-2">I can help you understand export documentation, compliance requirements, and trade regulations.</p>
                  </div>
                ) : (
                  conversation.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'question' 
                          ? 'bg-primary text-primary-foreground ml-4' 
                          : 'bg-muted mr-4'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.type === 'answer' && message.sources && message.sources > 0 && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {message.sources} source{message.sources > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 mr-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing your documents...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="mb-4" />

              {/* Chat Input */}
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about your uploaded documents..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !question.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}