const { BigQuery } = require('@google-cloud/bigquery');

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  if (credentials.private_key) {
    // 1. Replace literal escaped \n with true newlines
    let key = credentials.private_key.replace(/\\n/g, '\n');
    
    // 2. Remove all existing newlines, carriage returns, and spaces from the whole key
    key = key.replace(/[\r\n\s]+/g, '');
    
    // 3. Reconstruct the key with strict RSA format boundaries
    // The key body is everything between BEGIN and END tags
    const beginTag = '-----BEGINPRIVATEKEY-----';
    const endTag = '-----ENDPRIVATEKEY-----';
    
    if (key.includes(beginTag) && key.includes(endTag)) {
      const keyBody = key.substring(
        key.indexOf(beginTag) + beginTag.length,
        key.indexOf(endTag)
      );
      
      // 4. Chunk the base64 body into 64-character lines (standard OpenSSL format)
      const formattedBody = keyBody.match(/.{1,64}/g).join('\n');
      
      // 5. Piece it all back together with proper headers/footers
      credentials.private_key = `-----BEGIN PRIVATE KEY-----\n${formattedBody}\n-----END PRIVATE KEY-----\n`;
    }
  }
} catch (err) {
  console.error("Failed to parse GOOGLE_CREDENTIALS JSON:", err.message);
}

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: credentials || {}
});

module.exports = bigquery;