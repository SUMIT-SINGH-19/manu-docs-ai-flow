# 📱 Twilio WhatsApp Setup Guide

## ✅ Current Status

Your Twilio WhatsApp credentials are already configured in your `.env` file:

```env
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid-here         ✅
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token-here           ✅
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your-whatsapp-number   ✅
VITE_WHATSAPP_PROVIDER=twilio                                ✅
```

Your Twilio phone number: **+your-phone-number**

## 🚀 Quick Test

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to diagnostics:**

   ```
   http://localhost:5173/diagnostics
   ```

3. **Run system diagnostics:**

   - Click "Run Full Diagnostic"
   - All tests should pass ✅

4. **Send test WhatsApp message:**
   - Enter your phone number: `+18149149031`
   - Click "Send Test Message"
   - You should receive a WhatsApp message!

## 📋 How Twilio WhatsApp Works

### Message Flow:

1. **Your App** → **Twilio API** → **WhatsApp** → **User's Phone**
2. User uploads document → AI processes → Summary sent via Twilio → WhatsApp delivers

### Advantages of Twilio:

- ✅ **Easier Setup**: No Facebook Business verification needed
- ✅ **Reliable Delivery**: Enterprise-grade messaging
- ✅ **Better Support**: Twilio's excellent documentation
- ✅ **Sandbox Mode**: Test without production approval
- ✅ **Scalable**: Handle high message volumes

## 🧪 Testing Your Integration

### Test 1: Basic Connection

```bash
# Test Twilio API directly with curl:
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
-u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN" \
-d "From=whatsapp:+YOUR_WHATSAPP_NUMBER" \
-d "To=whatsapp:+RECIPIENT_NUMBER" \
-d "Body=Test message from ManuDocs AI"
```

### Test 2: Complete Document Flow

1. Upload a PDF document
2. Wait for AI processing to complete
3. Enter your phone number: `+18149149031`
4. Click "Send to WhatsApp"
5. Check your WhatsApp for the summary!

## 🔧 Troubleshooting

### Common Issues:

**"Invalid credentials" error:**

- Verify Account SID and Auth Token are correct
- Check if credentials are active in Twilio Console

**"Phone number not verified" error:**

- In Twilio Console, go to WhatsApp Sandbox
- Send "join [sandbox-name]" to +14155238886
- Your number will be verified for testing

**"Message not delivered" error:**

- Ensure recipient's phone has WhatsApp installed
- Check if number is in correct international format
- Verify Twilio account has sufficient balance

**"Rate limit exceeded" error:**

- Twilio has message rate limits
- Wait a few seconds between messages
- Consider upgrading your Twilio plan

### Twilio Console Checks:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Check **Account Info** → Verify Account SID
3. Check **WhatsApp Sandbox** → Verify sandbox is active
4. Check **Usage** → Verify you have message credits
5. Check **Logs** → See message delivery status

## 📱 WhatsApp Sandbox Setup

### For Testing (Current Setup):

Your app is using Twilio's WhatsApp Sandbox, which is perfect for testing:

1. **Sandbox Number**: `+14155238886` (Twilio's test number)
2. **Your Number**: `+18149149031` (needs to join sandbox)
3. **Join Command**: Send "join [sandbox-name]" to +14155238886

### For Production:

When ready for production, you'll need to:

1. Apply for WhatsApp Business API approval
2. Get your own WhatsApp Business number
3. Update `VITE_TWILIO_WHATSAPP_NUMBER` with your approved number

## 🎯 Expected Behavior

### When Everything Works:

1. **Document Upload**: Files upload successfully to Supabase storage
2. **AI Processing**: Gemini generates summaries within 30-60 seconds
3. **WhatsApp Delivery**: Messages arrive within 10-30 seconds
4. **Message Format**: Professional formatting with document details

### Sample WhatsApp Message:

```
📄 ManuDocs AI - Document Summary Report

I've processed 1 document(s) for you. Here are the summaries:

📄 Document 1/1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 sample-invoice.pdf

📝 Summary:
This invoice shows a shipment of textile products from ABC Exports to XYZ Imports. The total value is $25,000 with 500 units of cotton fabric. Payment terms are 30 days net.

📊 Details:
• Word count: 1,250
• Processing time: 3s
• File type: application/pdf

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Summary Complete!

📊 Processing Stats:
• Total words processed: 1,250
• Average processing time: 3s
• Documents processed: 1

Thank you for using ManuDocs AI! 🤖

Powered by Twilio WhatsApp Business API
```

## 🔐 Security Notes

### Current Credentials:

- Your credentials are configured for development/testing
- Keep your Auth Token secure (never commit to git)
- Monitor usage in Twilio Console

### For Production:

- Use environment-specific credentials
- Set up webhook endpoints for delivery status
- Implement proper error handling and retries
- Set up monitoring and alerts

## 📈 Next Steps

### Immediate (Testing):

1. ✅ Credentials configured
2. ✅ Test basic connection
3. ✅ Test document processing flow
4. ✅ Verify WhatsApp message delivery

### Short Term (Enhancement):

- Add message delivery status tracking
- Implement message templates
- Add rich media support (images, PDFs)
- Set up webhook for delivery confirmations

### Long Term (Production):

- Apply for WhatsApp Business API approval
- Get dedicated WhatsApp Business number
- Implement advanced features (buttons, lists)
- Set up production monitoring

---

**🎉 Your Twilio WhatsApp integration is ready to test!**

Start your dev server and navigate to `/diagnostics` to run the full system test.
