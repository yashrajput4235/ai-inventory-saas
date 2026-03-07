const prisma = require("../config/prisma");

/**
 * Get Forecast results for the dashboard
 * Filters by role: Admin (Org-wide) vs Manager (Store-wide)
 */
exports.getForecast = async (req, res) => {
  try {
    const { id: userId, role, organizationId } = req.user;

    let whereClause = {
      organizationId: organizationId,
    };

    // If manager, filter by their assigned stores only
    if (role === "manager") {
      const userStores = await prisma.userStore.findMany({
        where: { userId },
        select: { storeId: true }
      });
      
      const storeIds = userStores.map(us => us.storeId);
      whereClause.storeId = { in: storeIds };
    }

    const predictions = await prisma.prediction.findMany({
      where: whereClause,
      include: {
        product: {
          select: { name: true, sku: true, category: true }
        },
        store: {
          select: { name: true, location: true }
        }
      },
      orderBy: { predictionDate: 'desc' },
      take: 100 // Limit for performance
    });

    res.json({
      success: true,
      data: predictions
    });

  } catch (error) {
    console.error("GET FORECAST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching forecast data"
    });
  }
};