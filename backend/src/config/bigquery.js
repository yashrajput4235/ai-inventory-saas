const { BigQuery } = require('@google-cloud/bigquery');

let credentialsInfo = {};

try {
  // FIRST APPROACH: Base64 Encoded parsing (Safest for Render)
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const decodedString = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
    const rawJSON = JSON.parse(decodedString);
    credentialsInfo.client_email = rawJSON.client_email;
    credentialsInfo.private_key = rawJSON.private_key;
    console.log("Loaded BigQuery credentials securely via Base64.");
  } 
  // SECOND APPROACH: Standard JSON parsing (For local development)
  else if (process.env.GOOGLE_CREDENTIALS) {
    let credString = process.env.GOOGLE_CREDENTIALS;
    const rawJSON = JSON.parse(credString);
    
    credentialsInfo.client_email = rawJSON.client_email;
    let key = rawJSON.private_key || '';
    
    // Convert any literal \n strings to real newlines
    key = key.replace(/\\n/g, '\n');
    
    // Ensure the key is properly formatted as a PEM file
    if (!key.includes('\n') && key.includes('-----BEGIN PRIVATE KEY-----')) {
       key = key.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
       key = key.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n');
       const body = key.replace('-----BEGIN PRIVATE KEY-----\n', '').replace('\n-----END PRIVATE KEY-----\n', '').replace(/\s/g, '');
       const chunkedBody = body.match(/.{1,64}/g).join('\n');
       key = `-----BEGIN PRIVATE KEY-----\n${chunkedBody}\n-----END PRIVATE KEY-----\n`;
    }
    
    credentialsInfo.private_key = key;
    console.log("Loaded BigQuery credentials via standard JSON.");
  }
} catch (err) {
  console.error("Failed to parse GOOGLE_CREDENTIALS:", err.message);
}

// Ensure we AT LEAST have an email and key before initializing
if (!credentialsInfo.client_email) {
  console.warn("WARNING: target client_email missing from Google Credentials parsed object.");
  // Final ultimate fallback - grab it directly if we can't parse it
  credentialsInfo.client_email = process.env.GCP_CLIENT_EMAIL || 'inventory-backend-sa@ai-inventory-forecasting.iam.gserviceaccount.com';
}

let bigquery = null;
try {
  bigquery = new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID || 'ai-inventory-forecasting',
    credentials: {
      client_email: credentialsInfo.client_email,
      private_key: credentialsInfo.private_key
    }
  });
} catch (e) {
  console.error("Failed to initialize BigQuery Client Object:", e.message);
}

module.exports = bigquery;