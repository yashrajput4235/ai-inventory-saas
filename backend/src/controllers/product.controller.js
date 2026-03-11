const prisma=require("../config/prisma");

exports.createProduct = async (req, res) => {
    try {
        const { name, sku, category, price, cost, quantity, storeId } = req.body;
        const organizationId = req.user.organizationId;
        const role = req.user.role;
        const userId = req.user.id;
        
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name,
                    sku,
                    category,
                    price,
                    cost,
                    organizationId,
                },
            });

            if (quantity && Number(quantity) > 0) {
                let targetStoreId = storeId;
                
                // If Manager and no storeId, enforce picking a permitted store
                if (role === "manager") {
                    if (!targetStoreId) {
                        const firstPermittedStore = await tx.userStore.findFirst({
                            where: { userId },
                            select: { storeId: true }
                        });
                        if (!firstPermittedStore) throw new Error("MANAGER_NO_STORES");
                        targetStoreId = firstPermittedStore.storeId;
                    } else {
                        // Manager provided storeId -> verify mapping
                        const mapping = await tx.userStore.findFirst({
                            where: { userId, storeId: targetStoreId }
                        });
                        if (!mapping) throw new Error("MANAGER_UNAUTHORIZED_STORE");
                    }
                } else if (!targetStoreId) {
                    // Admin auto-assignment
                    const firstStore = await tx.store.findFirst({ where: { organizationId } });
                    if (firstStore) targetStoreId = firstStore.id;
                }

                if (targetStoreId) {
                    await tx.inventory.create({
                        data: {
                            storeId: targetStoreId,
                            productId: product.id,
                            quantity: Number(quantity),
                            lowStockThreshold: 10
                        }
                    });

                    // Add Ledger entry
                    await tx.inventoryLedger.create({
                        data: {
                            organizationId,
                            storeId: targetStoreId,
                            productId: product.id,
                            changeType: "STOCK_ADD",
                            quantityChange: Number(quantity),
                            resultingQty: Number(quantity),
                            createdBy: req.user.id || "admin"
                        }
                    });
                }
            }
            return product;
        });

        res.status(201).json({
            message: "Product created successfully",
            product: {
                id: result.id,
                name: result.name,
                sku: result.sku,
                price: result.price,
                category: result.category
            },
        });
    }
    catch(error){
        console.error(error);
        if(error.message === "MANAGER_NO_STORES") {
            return res.status(403).json({ message: "You are not assigned to any stores to add inventory to." });
        }
        if(error.message === "MANAGER_UNAUTHORIZED_STORE") {
            return res.status(403).json({ message: "You are not authorized to add inventory to the specified store." });
        }
        
        if(error.code=="P2002"){
            return res.status(400).json({
                message:"SKU already exists for this organization"
            })
        }
        return res.status(500).json({
            message:"Product creation failed",
        });
    }
};

exports.getProducts=async(req,res)=>{
    try{
        const organizationId=req.user.organizationId;
        const role = req.user.role;
        const userId = req.user.id;

        let products;

        if (role === "admin") {
            // Admin sees all products in the org
            products=await prisma.product.findMany({
                where:{
                    organizationId,
                },
                select:{
                    id:true,
                    name:true,
                    sku:true,
                    category:true,
                    price:true,
                    cost:true,
                    createdAt:true,
                },
                orderBy:{
                    createdAt:"desc",
                },
            });
        } else {
            // Manager only sees products whose inventory links to their assigned stores
            const userStores = await prisma.userStore.findMany({
                where: { userId },
                select: { storeId: true }
            });
            const storeIds = userStores.map(us => us.storeId);

            products = await prisma.product.findMany({
                where: {
                    organizationId,
                    inventory: {
                        some: {
                            storeId: { in: storeIds }
                        }
                    }
                },
                select:{
                    id:true,
                    name:true,
                    sku:true,
                    category:true,
                    price:true,
                    cost:true,
                    createdAt:true,
                },
                orderBy:{
                    createdAt:"desc",
                },
            });
        }

        res.json({products});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:"Failed to fetch products"});
    }
};