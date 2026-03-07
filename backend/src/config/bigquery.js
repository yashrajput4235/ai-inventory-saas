const { BigQuery } = require('@google-cloud/bigquery');

let credentials = {};

try {
  // Try to fix the credentials string BEFORE parsing it as JSON
  // Sometimes environment variables escape the \n characters as \\n
  let credString = process.env.GOOGLE_CREDENTIALS;
  
  if (credString) {
    credentials = JSON.parse(credString);
    
    if (credentials.private_key) {
      // Direct exact replacement, the simplest possible approach
      credentials.private_key = credentials.private_key.split('\\n').join('\n');
      console.log("Successfully formatted private key length:", credentials.private_key.length);
    }
  }
} catch (err) {
  console.error("Failed to parse GOOGLE_CREDENTIALS JSON:", err.message);
}

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: credentials
});

module.exports = bigquery;