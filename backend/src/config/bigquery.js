const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
if (credentials.private_key) {
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
}

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: credentials
});

module.exports = bigquery;