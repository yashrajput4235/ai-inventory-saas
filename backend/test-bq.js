const { BigQuery } = require('@google-cloud/bigquery');
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
console.log("Key headers present:", credentials.private_key.includes('BEGIN PRIVATE KEY'));
console.log("Length of key:", credentials.private_key.length);
try {
  const bigquery = new BigQuery({
    projectId: 'ai-inventory-forecasting',
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    }
  });
  console.log("Successfully initialized BigQuery object");
} catch(e) {
  console.error("Init failed:", e);
}
