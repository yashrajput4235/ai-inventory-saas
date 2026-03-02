const bigquery = require("../config/bigquery");

async function setupWarehouse() {
  const datasetId = "inventory_warehouse";
  const tableId = "daily_sales_summary";

  try {
    // 1️⃣ Create dataset if not exists
    const dataset = bigquery.dataset(datasetId);
    await dataset.get({ autoCreate: true });
    console.log(`✅ Dataset ready: ${datasetId}`);

    // 2️⃣ Define table schema
    const schema = [
      { name: "date", type: "DATE" },
      { name: "organization_id", type: "STRING" },
      { name: "store_id", type: "STRING" },
      { name: "product_id", type: "STRING" },
      { name: "total_quantity", type: "INTEGER" },
      { name: "total_revenue", type: "FLOAT" },
      { name: "total_profit", type: "FLOAT" },
    ];

    const table = dataset.table(tableId);

    // 3️⃣ Create table if not exists
    await table.get({ autoCreate: true, schema });
    console.log(`✅ Table ready: ${tableId}`);

  } catch (error) {
    console.error("❌ Error setting up warehouse:", error);
  }
}

setupWarehouse();