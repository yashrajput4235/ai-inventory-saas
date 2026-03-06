const bigquery = require("../config/bigquery");

exports.getForecast = async (req, res) => {
  try {

    const query = `
      SELECT
        date,
        series_id,
        predicted_total_quantity.value AS predicted_quantity
      FROM \`ai-inventory-forecasting.inventory_warehouse.predictions_2026_03_06T05_36_00_231Z_288\`
      ORDER BY date
      LIMIT 50
    `;

    const [rows] = await bigquery.query({ query });

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching forecast"
    });
  }
};