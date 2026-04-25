/**
 * sendSMS — Sends an SMS via Twilio.
 * Credentials live in .env — never hardcoded.
 * This is a stub; fully wired in Step 10 (External APIs).
 */
const sendSMS = async ({ to, message }) => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN  ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.warn('⚠️  Twilio credentials not set — SMS skipped');
    return { success: false, reason: 'Twilio not configured' };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,   // E.164 format: +91XXXXXXXXXX
    });

    console.log(`✅ SMS sent to ${to} — SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS failed to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = sendSMS;
