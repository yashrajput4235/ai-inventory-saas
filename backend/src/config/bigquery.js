const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');
const os = require('os');

let bqClient = null;

try {
  let credentialsObj = null;
  let keyFilePath = '';

  // 1. Production / Render approach: Raw parsed JSON string to temporary file
  if (process.env.GOOGLE_CREDENTIALS) {
    let credString = process.env.GOOGLE_CREDENTIALS;
    credentialsObj = JSON.parse(credString);
    
    // Fix escaped newlines for Render platform and local dev alike
    if (credentialsObj.private_key && credentialsObj.private_key.includes('\\n')) {
      credentialsObj.private_key = credentialsObj.private_key.replace(/\\n/g, '\n');
    }
  }
  // 2. Fallback: Local JSON file
  else {
    keyFilePath = path.join(__dirname, 'gcp-service-account.json');
    if (!fs.existsSync(keyFilePath)) {
      throw new Error("No GOOGLE_CREDENTIALS string found and local file is missing.");
    }
    credentialsObj = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    console.log("Using local JSON file for credentials directly.");
  }

  // Initialize BigQuery directly with the raw parsed API object
  console.log("=== DIAGNOSTIC: RSA KEY DECODING ===");
  if (credentialsObj && credentialsObj.private_key) {
    let rawKey = credentialsObj.private_key;
    console.log("Key Length:", rawKey.length);
    console.log("Includes \\n string:", rawKey.includes('\\n'));
    console.log("Includes actual newline:", rawKey.includes('\n'));
    console.log("ASCII Code at line breaks:", rawKey.substring(25, 30).split('').map(c => c.charCodeAt(0)));
  }
  
  bqClient = new BigQuery({
    projectId: credentialsObj.project_id || 'ai-inventory-forecasting',
    credentials: credentialsObj
  });
  
  console.log("BigQuery Client successfully initialized via credentials object.");

} catch (err) {
  console.error("CRITICAL ERROR IN BIGQUERY CONFIG:", err.message);
  throw err; // Stop server startup so Render logs the exact initialization error
}

// Ensure RSA signature works immediately to catch OpenSSL errors dynamically
if (bqClient) {
  import('google-auth-library').then(({ JWT }) => {
     try {
       const client = new JWT({
         email: bqClient.options.credentials.client_email,
         key: bqClient.options.credentials.private_key,
         scopes: ['https://www.googleapis.com/auth/cloud-platform']
       });
       client.getAccessToken().catch(e => {
         console.error("JWT RSA Verification Failed:", e.message);
       });
     } catch(e) {}
  }).catch(e => {});
}

module.exports = bqClient;