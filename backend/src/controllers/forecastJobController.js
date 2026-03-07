const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const prisma = require("../config/prisma");
const bqClient = require("../config/bigquery");

const vertexClient = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com'
});

/**
 * Controller to run a global forecasting job across all stores
 * Triggered by Google Cloud Scheduler
 */
exports.runDailyForecast = async (req, res) => {
  try {
    console.log("Starting Daily Forecast Job...");
    
    // 1. Fetch all active stores
    const stores = await prisma.store.findMany({
      include: { organization: true }
    });

    if (!stores.length) {
      return res.json({ success: true, message: "No stores found to forecast." });
    }

    let totalPredictions = 0;

    // 2. Iterate through each store
    for (const store of stores) {
      console.log(`Processing Store: ${store.name} (${store.id})`);

      // 3. Query BigQuery for daily sales total per product (last 30 days)
      const bqQuery = `
        SELECT 
          productId, 
          DATE_TRUNC(soldAt, DAY) as saleDay, 
          SUM(quantity) as totalQty
        FROM \`${process.env.BIGQUERY_PROJECT_ID}.inventory_ds.sales\`
        WHERE storeId = @storeId
          AND soldAt >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        GROUP BY 1, 2
        ORDER BY 1, 2 ASC
      `;

      try {
        const [rows] = await bqClient.query({
          query: bqQuery,
          params: { storeId: store.id }
        });

        // 4. Group rows by product to build timeseries
        const productTrends = rows.reduce((acc, row) => {
          if (!acc[row.productId]) acc[row.productId] = [];
          acc[row.productId].push(row.totalQty);
          return acc;
        }, {});

        // 5. For each product with data, call Vertex AI
        const productIds = Object.keys(productTrends);
        
        for (const productId of productIds) {
          const history = productTrends[productId];
          
          // Skip if not enough data points (need at least 7 days for a decent trend)
          if (history.length < 7) continue;

          try {
            // Vertex AI Prediction Request
            const endpoint = `projects/${process.env.BIGQUERY_PROJECT_ID}/locations/us-central1/models/${process.env.VERTEX_AI_MODEL_ID}`;
            
            const vertexRequest = {
              endpoint,
              instances: [
                { values: history, key: productId }
              ],
            };

            const [response] = await vertexClient.predict(vertexRequest);
            const predictionValue = Math.round(response.predictions[0] || 0);

            // 6. Save/Upsert result into DB
            await prisma.prediction.upsert({
              where: {
                storeId_productId_predictionDate: {
                  storeId: store.id,
                  productId: productId,
                  predictionDate: new Date()
                }
              },
              update: {
                predictedDemand: predictionValue,
                recommendedStock: Math.ceil(predictionValue * 1.2), // Buffer of 20%
                createdAt: new Date() // Treat as fresh prediction
              },
              create: {
                organizationId: store.organizationId,
                storeId: store.id,
                productId: productId,
                predictedDemand: predictionValue,
                recommendedStock: Math.ceil(predictionValue * 1.2),
                predictionDate: new Date(),
                modelVersion: "v1-vertex-ai"
              }
            });

            totalPredictions++;
          } catch (predErr) {
            console.error(`Prediction failed for Product ${productId} in Store ${store.id}:`, predErr.message);
          }
        }
      } catch (bqErr) {
        console.error(`BigQuery query failed for Store ${store.id}:`, bqErr.message);
      }
    }

    res.json({
      success: true,
      message: `Forecast job completed. Generated ${totalPredictions} predictions across ${stores.length} stores.`
    });

  } catch (error) {
    console.error("CRITICAL FORECAST JOB ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};