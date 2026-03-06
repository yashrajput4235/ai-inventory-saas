const {PredictionServiceClient} = require('@google-cloud/aiplatform');

const client = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com'
});

exports.runDailyForecast = async (req, res) => {
  try {

    const endpoint = `projects/ai-inventory-forecasting/locations/us-central1/models/YOUR_MODEL_ID`;

    const request = {
      name: endpoint,
      instances: [],
    };

    await client.predict(request);

    res.json({
      success: true,
      message: "Forecast job triggered"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Forecast job failed"
    });
  }
};