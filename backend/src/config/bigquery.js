const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');

let bqClient = null;

try {
  let credentialsObj = null;

  // 1. Production / Render approach: Base64 String
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const decodedVal = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
    credentialsObj = JSON.parse(decodedVal);
    console.log("Using Base64 decoded credentials");
  }
  // 2. Local approach: Raw parsed JSON string
  else if (process.env.GOOGLE_CREDENTIALS) {
    credentialsObj = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    // Fix escaped newlines for local dev if they copy-pasted wrong
    if (credentialsObj.private_key && credentialsObj.private_key.includes('\\n')) {
      credentialsObj.private_key = credentialsObj.private_key.replace(/\\n/g, '\n');
    }
    console.log("Using literal GOOGLE_CREDENTIALS env var");
  }
  // 3. Fallback: Local JSON file
  else {
    const keyPath = path.join(__dirname, 'gcp-service-account.json');
    if (fs.existsSync(keyPath)) {
      credentialsObj = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      console.log("Using local JSON file for credentials");
    }
  }

  if (!credentialsObj) {
    throw new Error("No valid Google Credentials found in environment or local file.");
  }

  // Initialize BigQuery directly with the raw parsed API object
  bqClient = new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID || credentialsObj.project_id || 'ai-inventory-forecasting',
    credentials: credentialsObj // Pass the entire object directly
  });
  
  console.log("BigQuery Client successfully initialized.");

} catch (err) {
  console.error("CRITICAL ERROR IN BIGQUERY CONFIG:", err.message);
  throw err; // Stop server startup so Render logs the exact initialization error
}

module.exports = bqClient;