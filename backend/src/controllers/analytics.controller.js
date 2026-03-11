const prisma=require("../config/prisma");

exports.getStoreSummary=async(req,res)=>{
    try{
        const {storeId}=req.params;
        const {userId,role,organizationId}=req.user;
        // check store belongs to organization
        const store=await prisma.store.findFirst({
            where:{
                id:storeId,
                organizationId
            },
        });
        if(!store){
            return res.status(400).json({
                message:"Store not found in your organization",
            });
        }
        // if manager -check store assignment
        if(role=="manager"){
            const mapping=await prisma.userStore.findFirst({
                where:{
                    userId,
                    storeId
                },
            });
            if(!mapping){
                return res.status(403).json({
                    message:"You are not assigned to this store",
                });
            }
        }
        // 🔥 Revenue + Profit + Sales Count
        const salesAggregate=await prisma.sale.aggregate({
            where:{
                storeId,
                organizationId
            },
            _sum:{
                totalAmount:true,
                profit:true,
            },
            _count:{
                id:true,
            },
        });
         // 🔥 Inventory Value (cost-based)
        const inventory=await prisma.inventory.findMany({
            where:{storeId},
            include:{
                product:{
                    select:{
                        cost:true,
                    },
                },
            },
        });
        const inventoryValue=inventory.reduce((acc , item)=>{
            const cost = item.product.cost || 0;
            return acc+(item.quantity*cost);
        },0);
        res.json({
            totalRevenue: salesAggregate._sum.totalAmount || 0,
            totalProfit: salesAggregate._sum.profit || 0,
            totalSales: salesAggregate._count.id || 0,
            inventoryValue,
        });



        
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message:"Failed to fetch Analytics",
        });
    }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { id: userId, role, organizationId } = req.user;

    // Validate store belongs to org
    const store = await prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found in your organization",
      });
    }

    // Manager scope check
    if (role === "manager") {
      const mapping = await prisma.userStore.findFirst({
        where: { userId, storeId },
      });

      if (!mapping) {
        return res.status(403).json({
          message: "You are not assigned to this store",
        });
      }
    }
    // 🔥 Date Range Logic
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate || endDate) {

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "Both startDate and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      if (start > end) {
        return res.status(400).json({
          message: "startDate cannot be greater than endDate",
        });
      }

      dateFilter = {
        soldAt: {
          gte: start,
          lte: end,
        },
      };

    } else {

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      dateFilter = {
        soldAt: {
          gte: thirtyDaysAgo,       
        },
      };
    }

    const topProducts = await prisma.sale.groupBy({
      by: ["productId"],
      where: {
        storeId,
        organizationId,
        ...dateFilter,
      },
      _sum: {
        quantity: true,
        totalAmount: true,
        profit: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
      take: 5,
    });

    // Attach product names
    const enriched = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });

        return {
          productId: item.productId,
          name: product?.name,
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.totalAmount || 0,
          totalProfit: item._sum.profit || 0,
        };
      })
    );

    res.json(enriched);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch top products",
    });
  }
};

// low stock alert
exports.getLowStockProducts=async(req, res)=>{
  try{
    const {storeId}=req.params;
    const {userId, role, organizationId}=req.user;
    // validate store
    const store=await prisma.store.findFirst({
      where:{id:storeId, organizationId},
    });
    if(!store){
      return res.status(404).json({
        message:"Store not found in you organization",
      });
    }
    // manager scope check
    if(role==="manager"){
      const mapping=await prisma.userStore.findFirst({
        where:{
          userId,
          storeId
        },
      });
      if(!mapping){
        return res.status(403).json({
          message:"You are not assigned to this store",
        });
      }
      
    }
    // find low stock items
      const inventoryItems=await prisma.inventory.findMany({
        where:{
          storeId,
        },
        include:{
          product:{
            select:{
              name:true,
              sku:true,
            },
          },
        },
      });
      
      const lowStockItems = inventoryItems.filter(item => item.quantity <= item.lowStockThreshold);
      res.json(lowStockItems);
  }
  catch(error){
    console.error(error);
    res.status(500).json({
      message:"Failed to fetch low stock items",
    });
  }
};

exports.getOrgSummary = async (req, res) => {
  try {
    const { organizationId } = req.user;
    
    // Revenue + Profit + Sales Count across Org
    const salesAggregate = await prisma.sale.aggregate({
      where: { organizationId },
      _sum: { totalAmount: true, profit: true },
      _count: { id: true },
    });

    // Inventory Value (cost-based) across Org
    const inventory = await prisma.inventory.findMany({
      where: { store: { organizationId } },
      include: { product: { select: { cost: true } } },
    });

    const inventoryValue = inventory.reduce((acc, item) => {
      const cost = item.product.cost || 0;
      return acc + (item.quantity * cost);
    }, 0);

    res.json({
      totalRevenue: salesAggregate._sum.totalAmount || 0,
      totalProfit: salesAggregate._sum.profit || 0,
      totalSales: salesAggregate._count.id || 0,
      inventoryValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch Org Summary" });
  }
};

exports.getOrgTopProducts = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Both startDate and endDate are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateFilter = { soldAt: { gte: start, lte: end } };
      }
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { soldAt: { gte: thirtyDaysAgo } };
    }

    const topProducts = await prisma.sale.groupBy({
      by: ["productId"],
      where: { organizationId, ...dateFilter },
      _sum: { quantity: true, totalAmount: true, profit: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 5,
    });

    const enriched = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          productId: item.productId,
          name: product?.name,
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.totalAmount || 0,
          totalProfit: item._sum.profit || 0,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch top products for organization" });
  }
};
