const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

module.exports = bigquery;