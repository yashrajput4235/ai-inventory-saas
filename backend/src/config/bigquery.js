const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

// Reference the service account key in the same directory
const keyFilename = path.join(__dirname, 'gcp-service-account.json');

// Initialize the BigQuery client
const bigquery = new BigQuery({
  projectId: 'ai-inventory-forecasting',
  keyFilename: keyFilename,
});

module.exports = bigquery;
