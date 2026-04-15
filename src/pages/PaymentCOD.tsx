import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, MapPin, Truck, Home, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentCOD() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = (location.state || {}) as any;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ payment_method: "COD", payment_status: "cod_pending" } as any)
      .eq("id", orderId!);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setConfirmed(true);
    setLoading(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0f1117]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-white">
          <p>Order not found.</p>
          <Button asChild className="mt-4"><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="container max-w-lg py-8 px-4">
        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/20 mb-4">
                  <Truck className="h-8 w-8 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Cash on <span className="text-yellow-400">Delivery</span></h1>
                <p className="text-gray-400 text-sm mt-1">Pay when your order is delivered</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm p-3 rounded-lg bg-[#1a1d2e]">
                  <span className="text-gray-400 flex items-center gap-2"><Package className="h-3.5 w-3.5" /> Product</span>
                  <span className="text-white font-medium">{order.product_name}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-[#1a1d2e]">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{order.quantity}</span>
                </div>
                <div className="flex justify-between text-sm p-3 rounded-lg bg-[#1a1d2e]">
                  <span className="text-gray-400 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Delivery</span>
                  <span className="text-gray-300 text-xs">{order.address}, {order.city}</span>
                </div>
                <div className="flex justify-between text-sm p-4 rounded-xl bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20">
                  <span className="text-yellow-300 font-semibold">Amount to Pay</span>
                  <span className="text-2xl font-bold text-yellow-400">₹{Number(order.total_price).toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Truck className="mr-2 h-5 w-5" />}
                Confirm COD Order
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="rounded-2xl border border-green-500/30 bg-[#151823] p-8 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
              >
                <CheckCircle className="h-14 w-14 text-green-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Order <span className="text-green-400">Placed!</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-sm mb-1"
              >
                Your order will be delivered soon.
              </motion.p>
              <p className="text-xs text-gray-500 font-mono mb-6">Order ID: #{orderId?.slice(0, 8)}</p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2 text-sm mb-8 p-4 rounded-xl bg-[#1a1d2e]"
              >
                <div className="flex justify-between"><span className="text-gray-400">Product</span><span className="text-white">{order.product_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Qty</span><span className="text-white">{order.quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Payment</span><span className="text-yellow-400 font-semibold">Cash on Delivery</span></div>
                <div className="flex justify-between border-t border-[#2a2d3e] pt-2"><span className="text-white font-semibold">Total</span><span className="text-yellow-400 font-bold text-lg">₹{Number(order.total_price).toLocaleString()}</span></div>
              </motion.div>

              <Button asChild className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                <Link to="/"><Home className="mr-2 h-4 w-4" /> Continue Shopping</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
