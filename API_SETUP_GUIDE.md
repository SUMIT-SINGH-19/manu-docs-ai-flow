# � AoPI Setup Guide - Get Your Credentials

## Overview

Your system needs these API credentials to work properly:

- ✅ **Supabase** (Database & Storage) - Partially configured
- ❌ **WhatsApp Business API** - Needs real credentials
- ✅ **Google Gemini AI** - Already configured
- ❌ **Supabase Anon Key** - Needs real key

## 1. 🗄️ Supabase Setup (Database & File Storage)

### Get Your Credentials:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `uzbgwpbxniukmsjrsnmc`
3. Go to **Settings** → **API**
4. Copy your **anon/public** key

### Update .env:

```env
VITE_SUPABASE_URL=https://uzbgwpbxniukmsjrsnmc.supabase.co  # ✅ Already correct
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ❌ Replace this
```

### Run Database Migration:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this SQL:

```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('docs', 'docs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated uploads to docs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'docs');

CREATE POLICY "Allow public access to docs" ON storage.objects
    FOR SELECT USING (bucket_id = 'docs');
```

## 2. 📱 WhatsApp Business API Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** → **Business** → **Next**
3. Enter app name: "ManuDocs AI" (or your choice)
4. Enter contact email and select business account

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Follow the setup wizard

### Step 3: Get Phone Number ID

1. In WhatsApp settings, go to **API Setup**
2. Copy your **Phone Number ID** (looks like: `123456789012345`)

### Step 4: Get Access Token

1. In WhatsApp settings, find **Temporary Access Token**
2. Copy the token (starts with `EAA...`)
3. **Important**: This is temporary! For production, generate a permanent token

### Step 5: Verify Your Business Number

1. Add your business phone number
2. Verify with SMS/call
3. Complete business verification process

### Update .env:

```env
VITE_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your actual token
VITE_WHATSAPP_PHONE_NUMBER_ID=123456789012345  # Your actual phone number ID
```

### Test WhatsApp API:

```bash
# Test with curl (replace YOUR_TOKEN and YOUR_PHONE_ID):
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "messaging_product": "whatsapp",
  "to": "919491392074",
  "type": "text",
  "text": {"body": "Test from ManuDocs AI"}
}'
```

## 3. 🤖 Google Gemini AI (Already Configured)

Your Gemini API key is already set:

```env
VITE_GEMINI_API_KEY=AIzaSyA7vRsB78F8a92J4VdnE5imVd4-TpO3Xfc  # ✅ Working
```

### Verify Gemini API:

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Test your API key
3. Check quota and billing status

## 4. 🔧 Complete .env File Template

After getting all credentials, your `.env` should look like:

```env
# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
VITE_SUPABASE_URL=https://uzbgwpbxniukmsjrsnmc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Ymd3cGJ4bml1a21zanJzbm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNzI2NzEsImV4cCI6MjA0OTY0ODY3MX0.YOUR_ACTUAL_KEY_HERE

# ==============================================
# AI SERVICES CONFIGURATION
# ==============================================
VITE_GEMINI_API_KEY=AIzaSyA7vRsB78F8a92J4VdnE5imVd4-TpO3Xfc

# ==============================================
# WHATSAPP BUSINESS API CONFIGURATION
# ==============================================
VITE_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_WHATSAPP_PHONE_NUMBER_ID=123456789012345

# ==============================================
# OPTIONAL CONFIGURATIONS
# ==============================================
VITE_APP_ENV=development
VITE_ENABLE_AI_PROCESSING=true
VITE_ENABLE_WHATSAPP_DELIVERY=true
VITE_ENABLE_PDF_GENERATION=true
VITE_ENABLE_FILE_CLEANUP=true
VITE_MAX_UPLOADS_PER_HOUR=20
VITE_MAX_FILE_SIZE_MB=10
VITE_MAX_FILES_PER_SESSION=5
VITE_SESSION_TIMEOUT_HOURS=24
VITE_FILE_RETENTION_HOURS=24
```

## 5. 🧪 Testing Your Setup

### After updating credentials:

1. **Restart your dev server:**

   ```bash
   npm run dev
   ```

2. **Run system diagnostics:**

   - Navigate to `http://localhost:5173/diagnostics`
   - Click "Run Full Diagnostic"
   - All tests should pass ✅

3. **Test each feature:**
   - Upload a document
   - Check AI summary generation
   - Test document preview/download
   - Send test WhatsApp message

## 6. 🚨 Troubleshooting

### WhatsApp Issues:

- **"Invalid access token"**: Token expired or incorrect
- **"Phone number not registered"**: Complete business verification
- **"Rate limit exceeded"**: Wait or upgrade your plan
- **"Message not delivered"**: Check recipient's WhatsApp status

### Supabase Issues:

- **"Invalid API key"**: Check anon key is correct
- **"Storage upload failed"**: Check bucket policies
- **"Database connection failed"**: Verify project URL

### Gemini AI Issues:

- **"API key invalid"**: Regenerate key in Google AI Studio
- **"Quota exceeded"**: Check billing and usage limits
- **"Model not found"**: Verify model name is correct

## 7. 🎯 Success Checklist

Your setup is complete when:

- [ ] All environment variables have real values (no placeholders)
- [ ] Supabase database connection works
- [ ] Storage buckets are created with proper policies
- [ ] WhatsApp test message sends successfully
- [ ] Document upload/preview/download works
- [ ] AI summary generation works
- [ ] All diagnostic tests pass ✅

## 8. 🔒 Security Notes

### For Production:

- Use permanent WhatsApp access tokens (not temporary)
- Set up proper Supabase RLS policies
- Enable rate limiting
- Set up monitoring and alerts
- Use environment-specific configurations

### Keep Secret:

- Never commit `.env` file to git
- Use different credentials for dev/staging/production
- Regularly rotate API keys
- Monitor API usage and costs

---

**Next Step**: After updating your credentials, run the diagnostic panel to verify everything works!
