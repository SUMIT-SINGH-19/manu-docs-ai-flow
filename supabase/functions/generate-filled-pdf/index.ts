import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { template, doc_ids = [], phone } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Auth
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
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY not set')

    // Load parsed docs for this user (optionally filter by ids)
    const { data: rows, error: queryError } = await supabase
      .from('parsed_docs')
      .select('id, doc_type, parsed_text, filename')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (queryError) throw queryError

    const selected = doc_ids.length ? rows?.filter((r) => doc_ids.includes(r.id)) : rows
    if (!selected || selected.length === 0) {
      return new Response(JSON.stringify({ error: 'No parsed documents found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const combinedText = selected
      .map((r) => `${r.doc_type || 'unknown'} (${r.filename}):\n${r.parsed_text}`)
      .join('\n\n---\n\n')

    const openai = new OpenAI({ apiKey: openaiApiKey })
    const fillPrompt = `You are an EXIM documentation assistant. Fill only the fields you can infer from the provided parsed documents. Return strictly valid JSON matching the shape of the provided template. Leave unknown fields as empty string or null.\n\nDocuments:\n${combinedText.slice(0, 12000)}\n\nTemplate JSON (shape to match):\n${JSON.stringify(template).slice(0, 6000)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You transform inputs into a strictly valid JSON object conforming to the given template shape.' },
        { role: 'user', content: fillPrompt },
      ],
      temperature: 0,
      max_tokens: 1200,
    })

    const jsonText = completion.choices?.[0]?.message?.content?.trim() || '{}'
    let filled: Record<string, any>
    try {
      filled = JSON.parse(jsonText)
    } catch {
      // Attempt to extract fenced JSON
      const match = jsonText.match(/\{[\s\S]*\}/)
      filled = match ? JSON.parse(match[0]) : {}
    }

    // Generate a simple PDF from the filled JSON
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const margin = 40
    let y = 800
    const title = 'ManuDocs — Filled Document'
    page.drawText(title, { x: margin, y, size: 16, font, color: rgb(0, 0, 0) })
    y -= 24

    const subtitle = `User: ${user.id} • Files: ${selected.length}`
    page.drawText(subtitle, { x: margin, y, size: 10, font })
    y -= 20

    const drawLine = () => {
      page.drawLine({ start: { x: margin, y }, end: { x: 595.28 - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
      y -= 12
    }
    drawLine()

    const entries = Object.entries(filled)
    const lineHeight = 12
    for (const [key, value] of entries) {
      const line = `${key}: ${typeof value === 'object' ? JSON.stringify(value) : (value ?? '')}`
      if (y < 60) {
        // new page
        const p = pdfDoc.addPage([595.28, 841.89])
        y = 800
        p.drawText(title, { x: margin, y, size: 16, font })
        y -= 24
        p.drawText(subtitle, { x: margin, y, size: 10, font })
        y -= 20
      }
      page.drawText(line, { x: margin, y, size: 10, font })
      y -= lineHeight
    }

    const pdfBytes = await pdfDoc.save()

    // Upload the resulting PDF
    const outPath = `${user.id}/generated/${Date.now()}-filled.pdf`
    const { error: uploadError } = await supabase.storage
      .from('docs')
      .upload(outPath, new Blob([pdfBytes], { type: 'application/pdf' }), {
        upsert: true,
        contentType: 'application/pdf',
      })

    if (uploadError) throw uploadError

    const { data: pub } = await supabase.storage.from('docs').getPublicUrl(outPath)
    const publicUrl = pub?.publicUrl

    // Optional: send via Gupshup
    let sent = false
    if (phone) {
      const GUPSHUP_API_KEY = Deno.env.get('GUPSHUP_API_KEY')
      const GUPSHUP_BASE_URL = Deno.env.get('GUPSHUP_BASE_URL')
      const GUPSHUP_TEMPLATE_ID = Deno.env.get('GUPSHUP_TEMPLATE_ID')

      if (!GUPSHUP_API_KEY || !GUPSHUP_BASE_URL || !GUPSHUP_TEMPLATE_ID) {
        console.warn('Gupshup secrets missing; skipping WhatsApp send')
      } else if (publicUrl) {
        try {
          const payload = {
            template_id: GUPSHUP_TEMPLATE_ID,
            phone,
            media_url: publicUrl,
          }
          const resp = await fetch(GUPSHUP_BASE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': GUPSHUP_API_KEY,
              'Authorization': `Bearer ${GUPSHUP_API_KEY}`,
            },
            body: JSON.stringify(payload),
          })
          sent = resp.ok
          if (!resp.ok) {
            const txt = await resp.text()
            console.warn('Gupshup send failed:', txt)
          }
        } catch (e) {
          console.warn('Gupshup send error:', e)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, pdf_path: outPath, public_url: publicUrl, sent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('generate-filled-pdf error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate filled PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
