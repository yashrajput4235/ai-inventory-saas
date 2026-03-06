const bigquery = require("../config/bigquery");

exports.getReorderRecommendations = async (req, res) => {
  try {

    const query = `
      SELECT
        p.series_id,
        p.date,
        p.predicted_total_quantity.value AS predicted_demand,
        i.current_stock,
        10 AS safety_buffer,
        (p.predicted_total_quantity.value - i.current_stock + 10) AS recommended_order
      FROM \`ai-inventory-forecasting.inventory_warehouse.predictions_2026_03_06T05_36_00_231Z_288\` p
      JOIN \`ai-inventory-forecasting.inventory_warehouse.inventory_stock\` i
      ON p.series_id = i.product_id
      WHERE (p.predicted_total_quantity.value - i.current_stock) > 0
      ORDER BY recommended_order DESC
      LIMIT 50
    `;

    const [rows] = await bigquery.query({ query });

    res.json({
      success: true,
      recommendations: rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error generating reorder recommendations"
    });
  }
};