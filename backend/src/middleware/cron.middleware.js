/**
 * Middleware to authenticate cron jobs / schedulers using a secret key
 */
exports.cronAuth = (req, res, next) => {
  const cronSecret = req.headers['x-cron-secret'] || req.query.cron_secret;

  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing Cron Secret"
    });
  }

  next();
};
