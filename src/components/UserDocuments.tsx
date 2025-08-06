import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Trash2, Download, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserDocument {
  id: string
  file_path: string
  document_name: string
  created_at: string
  chunks_count: number
}

export default function UserDocuments() {
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadUserDocuments(user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserDocuments(session.user.id)
      } else {
        setDocuments([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserDocuments = async (userId: string) => {
    try {
      setLoading(true)
      
      // Get unique documents from chunks table
      const { data, error } = await supabase
        .from('document_chunks')
        .select('file_path, document_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by document and count chunks
      const docsMap = new Map()
      data?.forEach(chunk => {
        const key = chunk.file_path
        if (docsMap.has(key)) {
          docsMap.set(key, {
            ...docsMap.get(key),
            chunks_count: docsMap.get(key).chunks_count + 1
          })
        } else {
          docsMap.set(key, {
            id: key,
            file_path: chunk.file_path,
            document_name: chunk.document_name,
            created_at: chunk.created_at,
            chunks_count: 1
          })
        }
      })

      setDocuments(Array.from(docsMap.values()))
    } catch (error: any) {
      console.error('Error loading documents:', error)
      toast({
        title: "Error",
        description: "Failed to load your documents.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (filePath: string, documentName: string) => {
    if (!user) return
    
    setDeleting(filePath)
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (storageError) {
        console.warn('Storage deletion error:', storageError)
      }

      // Delete chunks from database
      const { error: dbError } = await supabase
        .from('document_chunks')
        .delete()
        .eq('user_id', user.id)
        .eq('file_path', filePath)

      if (dbError) throw dbError

      // Reload documents
      await loadUserDocuments(user.id)
      
      toast({
        title: "Document deleted",
        description: `"${documentName}" has been deleted successfully.`,
      })
    } catch (error: any) {
      console.error('Error deleting document:', error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const downloadDocument = async (filePath: string, documentName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = documentName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document.",
        variant: "destructive"
      })
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to view your documents.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading your documents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground">Upload a PDF to get started with AI-powered document chat.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{doc.document_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {doc.chunks_count} chunks
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(doc.file_path, doc.document_name)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleting === doc.file_path}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{doc.document_name}"? This action cannot be undone and will remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDocument(doc.file_path, doc.document_name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}