const prisma=require("../config/prisma");

exports.createProduct = async (req, res) => {
    try {
        const { name, sku, category, price, cost, quantity, storeId } = req.body;
        const organizationId = req.user.organizationId;
        
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
                // If no storeId provided, optionally try to get the first store of org
                let targetStoreId = storeId;
                if (!targetStoreId) {
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
        // Handle uniue SKU error
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
        const products=await prisma.product.findMany({
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
        res.json({products});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:"Failed to fetch products"});
    }
};