require('dotenv').config();
const emailService = require('../services/email/email.service');

async function test() {
    console.log('--- Testing EmailService Transport Initialization & Verification ---');
    
    const transportResult = await emailService.testTransport();
    console.log('Transport Result:', JSON.stringify(transportResult, null, 2));

    if (!transportResult.configured) {
        console.log('\n⚠️ Verified: System correctly detected unconfigured Brevo API Key!');
        console.log('To deliver emails to real Gmail inboxes via Brevo, set BREVO_API_KEY in server/.env.');
    } else {
        console.log('\nAttempting test email dispatch via Brevo API...');
        try {
            const res = await emailService.sendRegistrationOTPEmail(
                { name: 'Test User', email: 'gopaldhakar980@gmail.com' },
                '123456'
            );
            console.log('Dispatch result:', res);
        } catch (err) {
            console.error('Dispatch failed:', err.message);
        }
    }
}

test();
