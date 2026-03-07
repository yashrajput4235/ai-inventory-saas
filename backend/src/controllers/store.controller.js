const prisma=require("../config/prisma");

exports.createStore=async(req,res)=>{
    try{
        const {name, location}=req.body;
        const organizationId=req.user.organizationId;
        const store=await prisma.store.create({
            data:{
                name,
                location,
                organizationId,
            },
        });
        res.status(201).json({
            message:"Store created successfully",
            store,
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Failed to create store",error:error.message});
    }
};

exports.getStores=async(req,res)=>{
    try{
        const organizationId=req.user.organizationId;
        const stores=await prisma.store.findMany({
            where:{ organizationId },
            orderBy:{ createdAt: "asc" },
        });
        res.status(200).json({ stores });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Failed to fetch stores",error:error.message});
    }
};