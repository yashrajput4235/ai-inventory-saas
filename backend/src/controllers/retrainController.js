const { JobServiceClient } = require("@google-cloud/aiplatform");

const client = new JobServiceClient({
  apiEndpoint: "us-central1-aiplatform.googleapis.com"
});

exports.retrainModel = async (req, res) => {
  try {

    const parent = "projects/ai-inventory-forecasting/locations/us-central1";

    const job = {
      displayName: "inventory-model-retrain",
      trainingPipeline: {
        displayName: "inventory_forecast_retrain",
      }
    };

    await client.createCustomJob({
      parent,
      customJob: job
    });

    res.json({
      success: true,
      message: "Model retraining started"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Retraining failed"
    });
  }
};