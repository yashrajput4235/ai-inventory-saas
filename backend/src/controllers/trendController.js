const bigquery = require("../config/bigquery");

exports.getDemandTrend = async (req, res) => {
  try {

    const { series_id } = req.query;

    const query = `
      SELECT
        date,
        series_id,
        predicted_total_quantity.value AS predicted_demand
      FROM \`ai-inventory-forecasting.inventory_warehouse.predictions_2026_03_06T05_36_00_231Z_288\`
      WHERE series_id = @series_id
      ORDER BY date
    `;

    const options = {
      query,
      params: { series_id }
    };

    const [rows] = await bigquery.query(options);

    res.json({
      success: true,
      trend: rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching demand trend"
    });

  }
};