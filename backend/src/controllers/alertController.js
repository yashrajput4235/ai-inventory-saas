const prisma = require("../config/prisma");

exports.getLowStockAlerts = async (req, res) => {
  try {
    const { id: userId, role, organizationId } = req.user;
    const requestedStoreId = req.query.storeId;

    let allowedStoreIds = [];
    if (role === "admin") {
      const stores = await prisma.store.findMany({ where: { organizationId }, select: { id: true } });
      allowedStoreIds = stores.map(s => s.id);
    } else {
      const userStores = await prisma.userStore.findMany({ where: { userId }, select: { storeId: true } });
      allowedStoreIds = userStores.map(us => us.storeId);
    }

    // Determine final store IDs to query
    let storeIds = [];
    if (requestedStoreId) {
      if (!allowedStoreIds.includes(requestedStoreId)) {
        return res.status(403).json({ success: false, message: "Unauthorized access to this store" });
      }
      storeIds = [requestedStoreId];
    } else {
      storeIds = allowedStoreIds;
    }

    if (storeIds.length === 0) {
      return res.json({ success: true, alert: [] });
    }

    const predictions = await prisma.prediction.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { predictionDate: 'desc' },
      include: { 
        product: true,
        store: true  // INCLUDE STORE FOR ENRICHMENT
      }
    });

    const latestMap = new Map();
    for (const p of predictions) {
      const key = `${p.storeId}_${p.productId}`;
      if (!latestMap.has(key)) latestMap.set(key, p);
    }
    const latestPredictions = Array.from(latestMap.values());

    const inventory = await prisma.inventory.findMany({
      where: { storeId: { in: storeIds } }
    });
    const inventoryMap = new Map();
    for (const inv of inventory) {
      inventoryMap.set(`${inv.storeId}_${inv.productId}`, inv.quantity);
    }

    const activeAlerts = latestPredictions.map(p => {
      const currentStock = inventoryMap.get(`${p.storeId}_${p.productId}`) || 0;
      return {
        series_id: p.product.name,
        predicted_demand: p.predictedDemand,
        current_stock: currentStock,
        storeId: p.storeId,
        storeName: p.store?.name || "Unknown Store"
      };
    }).filter(a => a.predicted_demand > a.current_stock).slice(0, 50);

    res.json({
      success: true,
      alert: activeAlerts
    });

  } catch (error) {
    console.error("ALERT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};