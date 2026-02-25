const prisma=require("../config/prisma");

exports.createProduct=async(req,res)=>{
    try{
        const {name, sku, category, price, cost}=req.body;
        const organizationId=req.user.organizationId;
        const product=await prisma.product.create({
            data:{
                name,
                sku,
                category,
                price,
                cost,
                organizationId,
            },
        });
        res.status(201).json({
            message:"Product created successfully",
            product:{
                id:product.id,
                name:product.name,
                sku:product.sku,
                price:product.price,
                category:product.category
                
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