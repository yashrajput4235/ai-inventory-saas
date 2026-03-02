const bigquery = require("../config/bigquery");

async function testConnection() {
  try {
    const datasets = await bigquery.getDatasets();
    console.log("✅ BigQuery Connected!");
    console.log("Datasets:", datasets[0].map(ds => ds.id));
  } catch (error) {
    console.error("❌ BigQuery connection failed:", error);
  }
}

testConnection();