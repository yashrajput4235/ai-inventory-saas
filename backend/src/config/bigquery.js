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

    // Write the corrected credentials to a secure, temporary file path so the Google SDK can read it natively
    keyFilePath = path.join(os.tmpdir(), `gcp-creds-${Date.now()}.json`);
    fs.writeFileSync(keyFilePath, JSON.stringify(credentialsObj, null, 2), { mode: 0o600 });
    console.log("Credentials written to secure temp file for Google SDK natively.");
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

  // Initialize BigQuery using keyFilename rather than credentials object mapping
  bqClient = new BigQuery({
    projectId: credentialsObj.project_id || 'ai-inventory-forecasting',
    keyFilename: keyFilePath
  });
  
  console.log("BigQuery Client successfully initialized via physical file path.");

} catch (err) {
  console.error("CRITICAL ERROR IN BIGQUERY CONFIG:", err.message);
  throw err; // Stop server startup so Render logs the exact initialization error
}

module.exports = bqClient;