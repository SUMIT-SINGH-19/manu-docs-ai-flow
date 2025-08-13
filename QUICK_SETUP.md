# ⚡ Quick Setup Reference

## 🚀 5-Minute Production Setup

### 1. Supabase (Required)
```bash
# 1. Create project at supabase.com
# 2. Run SQL migration from: supabase/migrations/002_document_summary_production_schema.sql
# 3. Add to .env:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key
```

### 2. AI Service (Choose One)
```bash
# OpenAI (Recommended)
VITE_OPENAI_API_KEY=sk-your-key
VITE_AI_PROVIDER=openai

# OR Anthropic
VITE_ANTHROPIC_API_KEY=sk-ant-your-key
VITE_AI_PROVIDER=anthropic

# OR Mock (for testing)
VITE_AI_PROVIDER=mock
```

### 3. WhatsApp API (Choose One)
```bash
# Twilio (Recommended)
VITE_TWILIO_ACCOUNT_SID=AC...
VITE_TWILIO_AUTH_TOKEN=...
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VITE_WHATSAPP_PROVIDER=twilio

# OR Mock (for testing)
VITE_WHATSAPP_PROVIDER=mock
```

### 4. Test
```bash
npm run dev
# Go to /document-summary
# Upload a file and test the workflow
```

## 🔗 Quick Links

- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **OpenAI API Keys**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Twilio Console**: [console.twilio.com](https://console.twilio.com)
- **Full Setup Guide**: See `API_SETUP_GUIDE.md`

## ✅ Verification Checklist

- [ ] Database tables created in Supabase
- [ ] File upload works (check `document_uploads` table)
- [ ] AI processing generates real summaries (not mock text)
- [ ] WhatsApp delivery sends actual messages
- [ ] No console errors in browser

## 🆘 Quick Troubleshooting

**Upload fails?** → Check Supabase URL and key
**AI fails?** → Verify API key and credits
**WhatsApp fails?** → Check phone number format (+1234567890)
**Tables missing?** → Run the SQL migration again

## 💡 Pro Tips

1. **Start with mock providers** to test UI first
2. **Use development API keys** for testing
3. **Check browser console** for detailed errors
4. **Test with small files** first (< 1MB)
5. **Verify phone number format** before testing WhatsApp