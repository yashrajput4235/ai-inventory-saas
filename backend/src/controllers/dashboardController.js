const prisma = require("../config/prisma");

exports.getDashboard = async (req, res) => {
  try {
    const { id: userId, role, organizationId } = req.user;

    let storeIds = [];
    if (role === "admin") {
      const stores = await prisma.store.findMany({ where: { organizationId }, select: { id: true } });
      storeIds = stores.map(s => s.id);
    } else {
      const userStores = await prisma.userStore.findMany({ where: { userId }, select: { storeId: true } });
      storeIds = userStores.map(us => us.storeId);
    }

    if (storeIds.length === 0) {
      return res.json({ success: true, dashboard: [] });
    }

    const predictions = await prisma.prediction.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { predictionDate: 'desc' },
      include: { product: true }
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

    const dashboard = latestPredictions.map(p => {
      const currentStock = inventoryMap.get(`${p.storeId}_${p.productId}`) || 0;
      return {
        series_id: p.product.name,
        date: p.predictionDate,
        predicted_demand: p.predictedDemand,
        current_stock: currentStock,
        recommended_order: p.recommendedStock > currentStock ? (p.recommendedStock - currentStock) : 0
      };
    }).sort((a,b) => b.predicted_demand - a.predicted_demand).slice(0, 20);

    res.json({
      success: true,
      dashboard: dashboard
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: "Dashboard data error" });
  }
};

exports.getOrgDashboard = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const stores = await prisma.store.findMany({ where: { organizationId }, select: { id: true } });
    const storeIds = stores.map(s => s.id);

    if (storeIds.length === 0) {
      return res.json({ success: true, dashboard: [], storesRevenue: [] });
    }

    const predictions = await prisma.prediction.findMany({
      where: { storeId: { in: storeIds } },
      orderBy: { predictionDate: 'desc' },
      include: { 
        product: true,
        store: true 
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

    const dashboard = latestPredictions.map(p => {
      const currentStock = inventoryMap.get(`${p.storeId}_${p.productId}`) || 0;
      return {
        series_id: p.product.name,
        date: p.predictionDate,
        predicted_demand: p.predictedDemand,
        current_stock: currentStock,
        recommended_order: p.recommendedStock > currentStock ? (p.recommendedStock - currentStock) : 0,
        storeId: p.storeId,
        storeName: p.store?.name || "Unknown Store"
      };
    }).sort((a,b) => b.predicted_demand - a.predicted_demand).slice(0, 20);

    const salesByStore = await prisma.sale.groupBy({
      by: ["storeId"],
      where: { organizationId },
      _sum: { totalAmount: true }
    });

    const enrichedStores = await Promise.all(salesByStore.map(async (s) => {
      const store = await prisma.store.findUnique({ where: { id: s.storeId }, select: { name: true } });
      return {
        storeName: store?.name || "Unknown",
        revenue: s._sum.totalAmount || 0
      };
    }));
    
    // Sort array by revenue in decreasing order
    enrichedStores.sort((a,b) => b.revenue - a.revenue);

    res.json({
      success: true,
      dashboard: dashboard,
      storesRevenue: enrichedStores
    });

  } catch (error) {
    console.error("ORG DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: "Dashboard data error" });
  }
};