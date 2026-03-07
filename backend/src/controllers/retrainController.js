const { JobServiceClient } = require("@google-cloud/aiplatform");

/**
 * Controller to trigger Model Retraining
 * Triggered by Google Cloud Scheduler
 */
exports.retrainModel = async (req, res) => {
  try {
    console.log(`[RETRAIN JOB] Request received: ${req.method} ${req.url}`);

    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error("Missing GOOGLE_CREDENTIALS environment variable");
    }

    const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    if (creds.private_key && creds.private_key.includes('\\n')) {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    }

    // Initialize Vertex AI Job Client with credentials
    const client = new JobServiceClient({
      apiEndpoint: "us-central1-aiplatform.googleapis.com",
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key
      },
      projectId: creds.project_id
    });

    const parent = `projects/${creds.project_id}/locations/us-central1`;

    // Note: In a real scenario, you might want to dynamically set training data paths in BQ
    const job = {
      displayName: "inventory-model-retrain-automated",
      trainingPipeline: {
        displayName: "inventory_forecast_retrain_pipeline",
        // Training pipeline ID would go here if using managed pipelines
      }
    };

    console.log("Triggering Vertex AI training job...");
    
    // This is a placeholder for the actual training trigger. 
    // Depending on the exact Vertex AI setup (Custom Job vs Pipeline), 
    // you would use createCustomJob or createTrainingPipeline.
    
    /* 
    await client.createCustomJob({
      parent,
      customJob: job
    });
    */

    res.json({
      success: true,
      message: "Model retraining signal received. Job trigger logic initialized.",
      details: "Vertex AI Job client configured with production credentials."
    });

  } catch (error) {
    console.error("[RETRAIN JOB ERROR]:", error);
    res.status(500).json({
      success: false,
      message: "Retraining trigger failed",
      error: error.message
    });
  }
};