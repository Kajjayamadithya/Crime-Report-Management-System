const twilio = require('twilio');

/**
 * Sends an SMS message using Twilio
 * @param {string} phoneNumber - The recipient's phone number (e.g., 9876543210)
 * @param {string} message - The content of the SMS
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // Validate credentials
    if (!accountSid || !authToken || !twilioPhone) {
      console.error('❌ Twilio Error: Credentials missing in .env file');
      return null;
    }

    const client = twilio(accountSid, authToken);

    // ROBUST FORMATTING: 
    // 1. Remove all non-numeric characters (spaces, dashes, etc.)
    let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    
    // 2. Handle Indian numbers (ensuring +91 is only added once)
    if (cleanNumber.length === 10) {
      cleanNumber = `+91${cleanNumber}`;
    } else if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
      cleanNumber = `+${cleanNumber}`;
    } else if (!cleanNumber.startsWith('+')) {
      // Fallback for already formatted but missing plus
      cleanNumber = `+${cleanNumber}`;
    }

    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: cleanNumber,
    });

    console.log(`✅ SMS successfully sent to ${cleanNumber}. SID: ${response.sid}`);
    return response;
  } catch (error) {
    // DETAILED DIAGNOSTIC LOGGING
    console.error('❌ TWILIO NOTIFICATION FAILURE ❌');
    console.error(`Status Code: ${error.status}`);
    console.error(`Twilio Error Code: ${error.code}`);
    console.error(`Description: ${error.message}`);
    if (error.code === 21608) {
      console.error('👉 TIP: This is a Trial Account. You MUST verify the recipient number in Twilio Console first.');
    }
    return null;
  }
};

module.exports = { sendSMS };
