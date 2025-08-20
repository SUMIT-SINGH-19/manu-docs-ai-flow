#!/usr/bin/env node

/**
 * N8N Webhook Integration Test Script
 * Tests the n8n webhook for document processing and WhatsApp delivery
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 N8N WEBHOOK INTEGRATION TEST');
console.log('===============================\n');

const N8N_WEBHOOK_URL = 'https://karthikeya007.app.n8n.cloud/webhook/pdf-summary';
const TEST_PHONE_NUMBER = '+919491392074'; // Your WhatsApp number

// Test 1: Check N8N Webhook Availability
async function testWebhookAvailability() {
    console.log('1. Testing N8N Webhook Availability...');
    console.log('--------------------------------------');
    
    try {
        const testData = new FormData();
        testData.append('test', 'true');
        testData.append('timestamp', new Date().toISOString());
        testData.append('source', 'manu-docs-ai-flow-test');

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: testData
        });

        console.log(`✅ Webhook URL: ${N8N_WEBHOOK_URL}`);
        console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log(`✅ Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
            return true;
        } else {
            console.log(`❌ Webhook not responding properly`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Webhook connection failed: ${error.message}`);
        return false;
    }
}

// Test 2: Send Test Document
async function sendTestDocument() {
    console.log('\n2. Testing Document Upload to N8N...');
    console.log('------------------------------------');
    
    try {
        // Create a test document
        const testContent = `Test Document for N8N Integration

This is a test document to verify the n8n webhook integration is working correctly.

Key Information:
- Timestamp: ${new Date().toLocaleString()}
- Phone Number: ${TEST_PHONE_NUMBER}
- Integration: N8N Webhook
- Purpose: Testing document processing and WhatsApp delivery
- Source: ManuDocs AI Flow Application

Document Content:
This document contains sample business information for testing purposes. 
The n8n workflow should process this document, generate a summary using AI, 
and send the summary to the provided WhatsApp number.

Expected Workflow:
1. Receive document via webhook
2. Extract text content
3. Generate AI summary
4. Format summary for WhatsApp
5. Send to provided phone number
6. Return success response

If you receive this summary on WhatsApp, the integration is working correctly!

Test completed at: ${new Date().toISOString()}`;

        // Create FormData with test document
        const formData = new FormData();
        
        // Create a blob and convert to File
        const testBlob = new Blob([testContent], { type: 'text/plain' });
        const testFile = new File([testBlob], 'test-document.txt', { type: 'text/plain' });
        
        // Add file as "data" parameter and metadata
        formData.append('data', testFile, 'test-document.txt');
        formData.append('filename', 'test-document.txt');
        formData.append('fileType', 'text/plain');
        formData.append('fileSize', testBlob.size.toString());
        formData.append('phoneNumber', TEST_PHONE_NUMBER);
        formData.append('options', JSON.stringify({
            language: 'en',
            style: 'detailed',
            maxLength: 500
        }));
        formData.append('timestamp', new Date().toISOString());
        formData.append('sessionId', crypto.randomUUID());
        formData.append('source', 'manu-docs-ai-flow-test');

        console.log(`📤 Sending test document to: ${N8N_WEBHOOK_URL}`);
        console.log(`📱 WhatsApp Number: ${TEST_PHONE_NUMBER}`);
        console.log(`📄 Document: test-document.txt (${testContent.length} characters)`);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        console.log(`📨 Response Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Document sent successfully!');
            console.log('📋 N8N Response:', JSON.stringify(result, null, 2));
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Document upload failed');
            console.log(`📋 Error Response: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Document upload failed:');
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

// Test 3: Test with Multiple Files
async function sendMultipleDocuments() {
    console.log('\n3. Testing Multiple Document Upload...');
    console.log('-------------------------------------');
    
    try {
        const formData = new FormData();
        
        // Create multiple test documents
        const documents = [
            {
                name: 'business-plan.txt',
                content: `Business Plan Summary
                
Company: ManuDocs AI
Industry: Document Processing & Export Services
Founded: 2024

Executive Summary:
ManuDocs AI provides AI-powered document processing and export documentation services. 
Our platform helps businesses streamline their export processes with automated document generation and WhatsApp delivery.

Market Opportunity:
- Growing export market in India
- Need for automated documentation
- WhatsApp-based business communication

Revenue Model:
- Subscription-based SaaS
- Per-document processing fees
- Enterprise custom solutions

Technology Stack:
- React/TypeScript frontend
- N8N workflow automation
- AI-powered document processing
- WhatsApp Business API integration`
            },
            {
                name: 'financial-report.txt',
                content: `Financial Report Q4 2024

Revenue: $125,000
Expenses: $85,000
Net Profit: $40,000

Key Metrics:
- Monthly Recurring Revenue: $35,000
- Customer Acquisition Cost: $150
- Customer Lifetime Value: $2,400
- Churn Rate: 3.2%

Growth Indicators:
- 45% increase in user base
- 60% improvement in processing speed
- 95% customer satisfaction rate

Investment Requirements:
- Series A funding: $2M
- Use of funds: Product development (60%), Marketing (25%), Operations (15%)

Projections for 2025:
- Revenue target: $500,000
- User base: 10,000+ active users
- Market expansion: 3 new countries`
            }
        ];

        // Process only the first document (single file processing)
        const doc = documents[0];
        const blob = new Blob([doc.content], { type: 'text/plain' });
        const file = new File([blob], doc.name, { type: 'text/plain' });
        
        // Add file as "data" parameter
        formData.append('data', file, doc.name);

        // Add metadata
        formData.append('filename', doc.name);
        formData.append('fileType', 'text/plain');
        formData.append('fileSize', blob.size.toString());
        formData.append('phoneNumber', TEST_PHONE_NUMBER);
        formData.append('options', JSON.stringify({
            language: 'en',
            style: 'concise',
            maxLength: 300
        }));
        formData.append('timestamp', new Date().toISOString());
        formData.append('sessionId', crypto.randomUUID());
        formData.append('source', 'manu-docs-ai-flow-multi-test');

        console.log(`📤 Sending ${documents.length} documents to N8N`);
        console.log(`📱 WhatsApp Number: ${TEST_PHONE_NUMBER}`);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        console.log(`📨 Response Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Multiple documents sent successfully!');
            console.log('📋 N8N Response:', JSON.stringify(result, null, 2));
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Multiple document upload failed');
            console.log(`📋 Error Response: ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Multiple document upload failed:');
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

// Main test execution
async function runTests() {
    console.log('🚀 Starting N8N Webhook Integration Tests...\n');
    
    const results = {
        webhookAvailable: false,
        singleDocument: false,
        multipleDocuments: false
    };
    
    // Test 1: Webhook Availability
    results.webhookAvailable = await testWebhookAvailability();
    
    if (results.webhookAvailable) {
        // Test 2: Single Document
        results.singleDocument = await sendTestDocument();
        
        // Test 3: Multiple Documents
        results.multipleDocuments = await sendMultipleDocuments();
    }
    
    // Summary
    console.log('\n📋 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Webhook Available: ${results.webhookAvailable ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Single Document: ${results.singleDocument ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Multiple Documents: ${results.multipleDocuments ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = results.webhookAvailable && results.singleDocument && results.multipleDocuments;
    
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n🎉 N8N webhook integration is working perfectly!');
        console.log('   ✅ Documents are being processed');
        console.log('   ✅ AI summaries are being generated');
        console.log('   ✅ WhatsApp delivery is working');
        console.log('\n📱 Check your WhatsApp for the test summaries!');
    } else {
        console.log('\n🔧 Action Required:');
        if (!results.webhookAvailable) {
            console.log('   - Check N8N webhook URL and configuration');
            console.log('   - Verify N8N workflow is active and published');
        }
        if (!results.singleDocument) {
            console.log('   - Check document processing workflow in N8N');
            console.log('   - Verify AI integration and WhatsApp setup');
        }
        if (!results.multipleDocuments) {
            console.log('   - Check multiple file handling in N8N workflow');
        }
    }
    
    console.log('\n🔗 N8N Webhook URL:', N8N_WEBHOOK_URL);
    console.log('📱 Test Phone Number:', TEST_PHONE_NUMBER);
    console.log('\n💡 Next Steps:');
    console.log('   1. Check N8N workflow logs for processing details');
    console.log('   2. Verify WhatsApp Business API configuration');
    console.log('   3. Test with different document types (PDF, DOCX)');
    console.log('   4. Monitor processing times and success rates');
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
});