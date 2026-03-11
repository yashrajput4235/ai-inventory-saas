import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, ArrowRight, PackageX, TrendingUp, Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlerts, getStores } from "@/services/dataService";

export default function Alerts() {
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "admin";
  const [selectedStore, setSelectedStore] = useState<string>("ALL");

  // Only fetch stores list if the user is an admin
  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
    enabled: isAdmin
  });
  const stores = storesData?.stores || [];

  const apiStoreId = selectedStore === "ALL" ? undefined : selectedStore;

  const { data: alertsData, isLoading, isError } = useQuery({
    queryKey: ['aiAlerts', apiStoreId],
    queryFn: () => getAlerts(apiStoreId),
  });

  const alerts = alertsData?.alert || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">
            {isAdmin && selectedStore === "ALL" ? "Global Low Stock Alerts" : "Low Stock Alerts"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Items where AI-predicted demand exceeds your current inventory stock.
          </p>
        </div>
        
        {isAdmin && stores.length > 0 && (
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-2 shadow-sm">
            <Building2 className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-sm bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-gray-700 dark:text-gray-300 font-medium"
            >
              <option value="ALL">All Stores</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isError ? (
        <Card className="border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold">Failed to load prediction alerts</h3>
            <p className="mt-2 text-sm opacity-80">Check if the BigQuery forecasting endpoint is active.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
               <AlertTriangle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inventory looks healthy!</h3>
            <p className="max-w-md">The ML models haven't detected any imminent shortages for the upcoming forecasting window.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert: any, index: number) => {
             const deficit = alert.predicted_demand - alert.current_stock;
             const isCritical = deficit > 20;
             
             return (
               <motion.div
                 key={`${alert.series_id}-${alert.storeId || index}`}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: index * 0.05 }}
               >
                 <Card className={`border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-amber-500'} hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    
                    <CardHeader className="pb-2">
                       <CardTitle className="flex justify-between items-start text-lg">
                         <div className="flex flex-col truncate pr-2 gap-1">
                           <span className="truncate">{alert.series_id || "Unknown Product"}</span>
                           {isAdmin && alert.storeName && (
                             <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                               <Building2 className="w-3 h-3" /> {alert.storeName}
                             </span>
                           )}
                         </div>
                         {isCritical ? (
                           <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md shrink-0">
                             <PackageX className="w-3 h-3" /> CRITICAL
                           </span>
                         ) : (
                           <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md shrink-0">
                             WARNING
                           </span>
                         )}
                       </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                       <div className="flex justify-between items-end bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Current Stock</p>
                            <p className="text-xl font-bold">{alert.current_stock}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 dark:text-zinc-600 mb-1" />
                          <div className="text-right">
                             <p className="text-xs text-gray-500 font-medium mb-1 flex items-center justify-end gap-1">
                               <TrendingUp className="w-3 h-3" /> Predicted Demand
                             </p>
                             <p className="text-xl font-bold text-red-600 dark:text-red-400">{alert.predicted_demand}</p>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center pt-2">
                          <p className="text-sm font-medium">Shortfall: <span className="text-red-600 dark:text-red-400">{deficit} units</span></p>
                          <Button size="sm" variant={isCritical ? "destructive" : "secondary"}>
                            Order Now
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               </motion.div>
             )
          })}
        </div>
      )}
    </motion.div>
  );
}
