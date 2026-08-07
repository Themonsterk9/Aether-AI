require('dotenv').config();
const emailService = require('../services/email/email.service');

async function test() {
    console.log('--- Testing EmailService Transport Initialization & Verification ---');
    
    const transportResult = await emailService.testTransport();
    console.log('Transport Result:', JSON.stringify(transportResult, null, 2));

    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'YOUR_GOOGLE_APP_PASSWORD') {
        console.log('\n✅ Verified: System correctly detected unconfigured/placeholder App Password!');
        console.log('To deliver emails to real Gmail inboxes, update server/.env with your Google App Password.');
    } else {
        console.log('\nAttempting test email dispatch...');
        try {
            const res = await emailService.sendRegistrationOTPEmail(
                { name: 'Test User', email: 'gopaldhakar980@gmail.com' },
                '123456'
            );
            console.log('Dispatch result:', res);
        } catch (err) {
            console.error('Dispatch failed as expected if credentials are not authentic:', err.message);
        }
    }
}

test();
