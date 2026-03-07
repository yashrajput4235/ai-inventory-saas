const { BigQuery } = require('@google-cloud/bigquery');

let credentialsInfo = {};

try {
  let credString = process.env.GOOGLE_CREDENTIALS;
  if (credString) {
    const rawJSON = JSON.parse(credString);
    
    // Explicitly grab only what Google Auth needs
    credentialsInfo.client_email = rawJSON.client_email;
    
    let key = rawJSON.private_key || '';
    
    // Convert any literal \n strings to real newlines
    key = key.replace(/\\n/g, '\n');
    
    // Ensure the key is properly formatted as a PEM file
    // Some platforms strip the actual newlines, leaving a single line.
    // If there is no real newline but we have the BEGIN header:
    if (!key.includes('\n') && key.includes('-----BEGIN PRIVATE KEY-----')) {
       key = key.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
       key = key.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n');
       // Add newlines every 64 characters for the body
       const body = key.replace('-----BEGIN PRIVATE KEY-----\n', '').replace('\n-----END PRIVATE KEY-----\n', '').replace(/\s/g, '');
       const chunkedBody = body.match(/.{1,64}/g).join('\n');
       key = `-----BEGIN PRIVATE KEY-----\n${chunkedBody}\n-----END PRIVATE KEY-----\n`;
    }
    
    credentialsInfo.private_key = key;
    console.log("BQ Configured: email=", credentialsInfo.client_email);
    console.log("BQ Configured: key length=", key.length, "valid headers=", key.includes('BEGIN PRIVATE KEY'));
  }
} catch (err) {
  console.error("Failed to parse GOOGLE_CREDENTIALS:", err.message);
}

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: {
    client_email: credentialsInfo.client_email,
    private_key: credentialsInfo.private_key
  }
});

module.exports = bigquery;