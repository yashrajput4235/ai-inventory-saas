const prisma=require("../config/prisma");
const bigquery=require("../config/bigquery");

async function generateDailySalesSummary(){
    try{
        // calculate yesterday date range
        const yesterday=new Date();
        yesterday.setDate(yesterday.getDate()-1);
        
        const start=new Date(yesterday.setHours(0,0,0,0));
        const end=new Date(yesterday.setHours(23,59,59,999));

        // aggregate from postgres
        const salesSummary=await prisma.sale.groupBy({
            by: ["organizationId", "storeId", "productId"],
            where:{
                soldAt:{
                    gte:start,
                    lte:end ,
                },
            },
            _sum:{
                quantity:true,
                totalAmount:true,
                profit:true,
            },
        });
        if(salesSummary.length===0){
            console.log("⚡ No sales for yesterday.");
            return;
        }
        // 3️⃣ Format rows for BigQuery
        const rows = salesSummary.map((item) => ({
            date: start.toISOString().split("T")[0],
            organization_id: item.organizationId,
            store_id: item.storeId,
            product_id: item.productId,
            total_quantity: item._sum.quantity || 0,
            total_revenue: item._sum.totalAmount || 0,
            total_profit: item._sum.profit || 0,
        }));
        // insert into BigQuery
        // 4️⃣ Delete existing rows for same date (prevent duplicates)
        const query = `
            DELETE FROM \`ai-inventory-forecasting.inventory_warehouse.daily_sales_summary\`
            WHERE date = "${start.toISOString().split("T")[0]}"
        `;

        await bigquery.query({ query });

        // 5️⃣ Insert fresh rows
        await bigquery
            .dataset("inventory_warehouse")
            .table("daily_sales_summary")
            .insert(rows);

        console.log("✅ Daily sales summary refreshed in BigQuery.");

    }
    catch(error){
        console.error("❌ Error generating sales summary:", error);
    }
}

generateDailySalesSummary();