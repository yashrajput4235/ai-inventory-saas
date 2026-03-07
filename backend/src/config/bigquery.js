const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');

let bqClient = null;

try {
  let credentialsObj = null;

  // 1. Production / Render approach: Raw parsed JSON string with robust replacements
  if (process.env.GOOGLE_CREDENTIALS) {
    let credString = process.env.GOOGLE_CREDENTIALS;
    const rawJSON = JSON.parse(credString);
    
    // Create a brand new clean object from scratch to bypass Google Auth strict field validation
    credentialsObj = {
      type: rawJSON.type || "service_account",
      project_id: rawJSON.project_id || process.env.BIGQUERY_PROJECT_ID,
      private_key_id: rawJSON.private_key_id,
      private_key: rawJSON.private_key,
      client_email: rawJSON.client_email,
      client_id: rawJSON.client_id,
      auth_uri: rawJSON.auth_uri || "https://accounts.google.com/o/oauth2/auth",
      token_uri: rawJSON.token_uri || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: rawJSON.auth_provider_x509_cert_url || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: rawJSON.client_x509_cert_url
    };
    
    // Fix escaped newlines for Render platform and local dev alike
    if (credentialsObj.private_key && credentialsObj.private_key.includes('\\n')) {
      credentialsObj.private_key = credentialsObj.private_key.replace(/\\n/g, '\n');
    }
  }
  // 2. Fallback: Local JSON file
  else {
    const keyPath = path.join(__dirname, 'gcp-service-account.json');
    if (fs.existsSync(keyPath)) {
      credentialsObj = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    }
  }

  if (!credentialsObj) {
    throw new Error("No GOOGLE_CREDENTIALS string found in environment variables.");
  }

  // Initialize BigQuery directly with the raw parsed API object
  bqClient = new BigQuery({
    projectId: credentialsObj.project_id || 'ai-inventory-forecasting',
    credentials: credentialsObj
  });
  
  console.log("BigQuery Client successfully initialized.");

} catch (err) {
  console.error("CRITICAL ERROR IN BIGQUERY CONFIG:", err.message);
  throw err; // Stop server startup so Render logs the exact initialization error
}

module.exports = bqClient;