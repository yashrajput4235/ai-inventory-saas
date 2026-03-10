const bigquery = require("../config/bigquery");
const prisma = require("../config/prisma");

exports.getLowStockAlerts = async (req, res) => {
  try {
    const { userId, role, organizationId } = req.user;

    let validProductIds = [];
    
    if (role === "admin") {
      const products = await prisma.product.findMany({
        where: { organizationId },
        select: { id: true }
      });
      validProductIds = products.map(p => p.id);
    } else {
      const userStores = await prisma.userStore.findMany({
        where: { userId },
        select: { storeId: true }
      });
      const storeIds = userStores.map(us => us.storeId);
      
      const inventory = await prisma.inventory.findMany({
        where: { storeId: { in: storeIds } },
        select: { productId: true }
      });
      validProductIds = [...new Set(inventory.map(inv => inv.productId))];
    }

    if (validProductIds.length === 0) {
      return res.json({ success: true, alert: [] });
    }

    const productIdList = validProductIds.map(id => `'${id}'`).join(", ");

    const query = `
      SELECT
        p.series_id,
        p.predicted_total_quantity.value AS predicted_demand,
        i.current_stock
      FROM \`ai-inventory-forecasting.inventory_warehouse.predictions_2026_03_06T05_36_00_231Z_288\` p
      JOIN \`ai-inventory-forecasting.inventory_warehouse.inventory_stock\` i
      ON p.series_id = i.product_id
      WHERE (p.predicted_total_quantity.value > i.current_stock)
        AND p.series_id IN (${productIdList})
      LIMIT 50
    `;
      const [rows]=await bigquery.query({query});
      res.json({
        success:true,
        alert:rows
      })
     
    }
    catch (error) {
  console.error("ALERT ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message
  });
}
};