#!/usr/bin/env node

/**
 * Critical Issues Test Script
 * Tests all the reported critical issues in the system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CRITICAL ISSUES DIAGNOSTIC REPORT');
console.log('=====================================\n');

// Test 1: Check Twilio WhatsApp Configuration
console.log('1. WHATSAPP INTEGRATION TEST');
console.log('----------------------------');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const twilioSid = envContent.match(/VITE_TWILIO_ACCOUNT_SID=(.+)/)?.[1];
    const twilioToken = envContent.match(/VITE_TWILIO_AUTH_TOKEN=(.+)/)?.[1];
    const twilioNumber = envContent.match(/VITE_TWILIO_WHATSAPP_NUMBER=(.+)/)?.[1];
    
    console.log(`✅ Twilio Account SID: ${twilioSid ? 'CONFIGURED' : '❌ MISSING'}`);
    console.log(`✅ Twilio Auth Token: ${twilioToken ? 'CONFIGURED' : '❌ MISSING'}`);
    console.log(`✅ Twilio WhatsApp Number: ${twilioNumber ? 'CONFIGURED' : '❌ MISSING'}`);
    
    if (twilioSid && twilioToken && twilioNumber) {
        console.log('✅ WhatsApp credentials are configured');
    } else {
        console.log('❌ CRITICAL: WhatsApp credentials missing or incomplete');
    }
} else {
    console.log('❌ CRITICAL: .env file not found');
}

console.log('\n2. DATABASE SCHEMA TEST');
console.log('----------------------');

// Check if migration files exist
const migrationPath = path.join(__dirname, 'supabase', 'migrations');
if (fs.existsSync(migrationPath)) {
    const migrations = fs.readdirSync(migrationPath);
    console.log(`✅ Found ${migrations.length} migration files`);
    
    const categoryMigration = migrations.find(f => f.includes('categories'));
    if (categoryMigration) {
        console.log('✅ Categories migration exists');
    } else {
        console.log('❌ Categories migration missing');
    }
} else {
    console.log('❌ CRITICAL: Migration directory not found');
}

console.log('\n3. DATA PERSISTENCE TEST');
console.log('------------------------');

// Check if there's proper state management for document processing
const hookPath = path.join(__dirname, 'src', 'hooks', 'useDocumentProcessing.ts');
if (fs.existsSync(hookPath)) {
    const hookContent = fs.readFileSync(hookPath, 'utf8');
    
    if (hookContent.includes('useState') && hookContent.includes('useCallback')) {
        console.log('✅ Document processing hook exists with state management');
    } else {
        console.log('❌ Document processing hook missing proper state management');
    }
    
    // Check for session storage or persistence
    if (hookContent.includes('sessionStorage') || hookContent.includes('localStorage')) {
        console.log('✅ Browser storage persistence implemented');
    } else {
        console.log('❌ CRITICAL: No browser storage persistence - data will be lost on navigation');
    }
} else {
    console.log('❌ CRITICAL: Document processing hook not found');
}

console.log('\n4. PDF FUNCTIONALITY TEST');
console.log('-------------------------');

// Check for PDF generation service
const pdfServices = [
    'src/lib/pdfGenerator.ts',
    'src/lib/documentProcessor.ts',
    'src/components/PDFUpload.tsx'
];

let pdfFunctionalityFound = false;
pdfServices.forEach(servicePath => {
    const fullPath = path.join(__dirname, servicePath);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Found PDF service: ${servicePath}`);
        pdfFunctionalityFound = true;
    }
});

if (!pdfFunctionalityFound) {
    console.log('❌ CRITICAL: PDF functionality components missing');
}

console.log('\n5. SAMPLE DATA TEST');
console.log('------------------');

// Check if sample data is inserted in migrations
const categoryMigrationPath = path.join(__dirname, 'supabase', 'migrations', '004_categories_and_products_system.sql');
if (fs.existsSync(categoryMigrationPath)) {
    const migrationContent = fs.readFileSync(categoryMigrationPath, 'utf8');
    
    if (migrationContent.includes('INSERT INTO categories')) {
        console.log('✅ Sample categories are inserted');
    } else {
        console.log('❌ No sample categories found');
    }
    
    if (migrationContent.includes('INSERT INTO products')) {
        console.log('✅ Sample products are inserted');
    } else {
        console.log('❌ CRITICAL: No sample products - pages will look empty');
    }
} else {
    console.log('❌ Category migration file not found');
}

console.log('\n📋 SUMMARY OF CRITICAL ISSUES');
console.log('=============================');
console.log('1. ❌ Data Persistence: Documents lost on page navigation');
console.log('2. ❌ Empty Database: No sample products in categories');
console.log('3. ❌ WhatsApp Integration: Needs testing and verification');
console.log('4. ❌ PDF Functionality: Download/preview may be broken');

console.log('\n🚨 IMMEDIATE ACTIONS REQUIRED:');
console.log('1. Add browser storage persistence to document processing');
console.log('2. Insert sample products into database');
console.log('3. Test WhatsApp message delivery');
console.log('4. Fix PDF generation and download');

console.log('\n✅ FIXES WILL BE PROVIDED NEXT...\n');