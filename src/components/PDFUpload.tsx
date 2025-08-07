import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [docType, setDocType] = useState<string>('')

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a PDF file first",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to upload documents",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    
    try {
      // Upload to user-specific folder in Supabase storage
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('docs')
        .upload(`${user.id}/${fileName}`, file, { upsert: true })

      if (error) throw error

      setUploading(false)
      setProcessing(true)

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()

      // Process the PDF with edge function (embeddings + chunking)
      const response = await fetch('/functions/v1/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          filePath: data.path,
        }),
      })

      if (!response.ok) {
        throw new Error('PDF processing failed')
      }

      const result = await response.json()

      // Parse + classify the document
      const parseRes = await fetch('/functions/v1/parse-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ filePath: data.path, providedDocType: docType || undefined }),
      })

      let classified = ''
      if (parseRes.ok) {
        const parsed = await parseRes.json()
        classified = parsed?.doc_type || ''
      }
      
      toast({
        title: 'Success',
        description: `Uploaded, processed (${result.chunksCount} chunks).${classified ? ` Classified as: ${classified}` : ''}`,
      })

      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('pdf-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error.message || "Upload failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload PDF Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm">Document type (optional)</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                <SelectItem value="packing_list">Packing List</SelectItem>
                <SelectItem value="iec">IEC</SelectItem>
                <SelectItem value="shipping_bill">Shipping Bill</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            id="pdf-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading || processing}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || processing || !user}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Process PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}