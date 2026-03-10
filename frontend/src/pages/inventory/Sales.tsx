import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, ShoppingCart, Plus, Minus, CreditCard, Receipt, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts, recordSale, getStores } from "@/services/dataService";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });
  
  const stores = storesData?.stores || [];
  const activeStoreId = selectedStore || (stores.length > 0 ? stores[0].id : "");

  // Fetch catalog to sell from
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const products = productsData?.products || [];

  const filteredProducts = products.filter(
    (item: any) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saleMutation = useMutation({
    mutationFn: recordSale,
    onSuccess: () => {
      setCart([]);
      setIsProcessing(false);
      // In a real app we'd trigger a toast notification here
      alert("Sale Recorded Successfully!");
    },
    onError: () => {
      setIsProcessing(false);
      alert("Failed to record sale. Check connection.");
    }
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = cartTotal * 0.08; // 8% mock tax
  const subtotal = cartTotal;
  const finalTotal = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    // Process each item in the cart. In a production app you'd likely want a batch endpoint
    // to record a multi-item transaction. Here we map over them based on the API spec. `recordSale` takes one product.
    cart.forEach((item) => {
      saleMutation.mutate({
        storeId: activeStoreId,
        productId: item.product.id,
        quantity: item.quantity
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-8rem)]" // Fill available height
    >
      {/* Product Catalog Side */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
            <p className="text-muted-foreground mt-1">
              Browse products and ring up customer sales.
            </p>
          </div>
          {stores.length > 1 && (
            <select
              value={activeStoreId}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-sm rounded-md px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none"
            >
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by product name or SKU (e.g., Wireless Mouse)..."
            className="pl-10 py-6 text-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30">
               <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
               <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Failed to load catalog</h3>
               <p className="text-red-600/80 mt-2 max-w-sm">Ensure the backend API is running to fetch products.</p>
            </div>
          ) : isLoading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {[1,2,3,4,5,6].map((i) => (
                 <Skeleton key={i} className="h-40 w-full rounded-xl" />
               ))}
             </div>
          ) : filteredProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-gray-200 dark:border-zinc-800">
                <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 font-medium">No products found matching your search.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product: any) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all h-full flex flex-col"
                  onClick={() => addToCart(product)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                    <p className="text-xs text-gray-500 font-mono mt-1 pt-1">{product.sku}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 mt-auto">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ${Number(product.price).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Side */}
      <Card className="flex flex-col h-full border-gray-200 dark:border-zinc-800 w-full lg:w-auto shadow-sm z-10">
        <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Current Order
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 space-y-4">
              <Receipt className="w-16 h-16 opacity-20" />
              <p className="text-center font-medium">Cart is empty.<br/>Click products to add them.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
              {cart.map((item) => (
                <li key={item.product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm leading-tight text-gray-900 dark:text-gray-100">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{item.product.sku}</p>
                    </div>
                    <div className="font-semibold text-sm">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
                      <button 
                        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-zinc-700 active:bg-gray-300 transition-colors"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-zinc-700 active:bg-gray-300 transition-colors bg-white dark:bg-zinc-900"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>

        <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-800">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="h-px w-full my-2 bg-gray-200 dark:bg-zinc-700" />
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pb-2">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg gap-2 mt-2" 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Checkout Order</>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
