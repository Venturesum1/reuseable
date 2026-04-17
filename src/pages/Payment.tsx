import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Truck, CreditCard, Package, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { order, sourceUrl, product } = (location.state || {}) as any;
  const [selected, setSelected] = useState<"cod" | "online" | null>(null);

  const handleContinue = () => {
    if (selected === "cod") {
      navigate(`/payment/${orderId}/cod`, { state: { order, sourceUrl, product } });
    } else if (selected === "online") {
      navigate(`/payment/${orderId}/online`, { state: { order, sourceUrl, product } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-2xl py-8 px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Choose <span className="text-cyan-700">Payment</span> Method</h1>
          <p className="text-gray-700 text-sm mt-1">Select how you'd like to pay for your order</p>
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-xl border-2 border-white bg-white p-4 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-5 w-5 text-cyan-600" />
              <h3 className="font-bold text-gray-900">Order Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Product</span><span className="text-gray-900 font-medium">{order.product_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Quantity</span><span className="text-gray-900">{order.quantity}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="text-gray-700 text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{order.city}, {order.state}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <span className="text-xl font-bold text-yellow-600">₹{Number(order.total_price).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelected("cod")}
            className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 bg-white ${
              selected === "cod"
                ? "border-yellow-400 shadow-lg shadow-yellow-400/40"
                : "border-white hover:border-yellow-300 hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${selected === "cod" ? "bg-yellow-100" : "bg-gray-50"}`}>
                <Truck className={`h-8 w-8 ${selected === "cod" ? "text-yellow-600" : "text-gray-500"}`} />
              </div>
              <h3 className={`text-lg font-bold ${selected === "cod" ? "text-yellow-700" : "text-gray-900"}`}>Cash on Delivery</h3>
              <p className="text-xs text-gray-600">Pay when your order arrives at your doorstep. No advance payment needed.</p>
              {selected === "cod" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
                  <span className="text-white text-sm font-bold">✓</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setSelected("online")}
            className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 bg-white ${
              selected === "online"
                ? "border-cyan-400 shadow-lg shadow-cyan-400/40"
                : "border-white hover:border-cyan-300 hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${selected === "online" ? "bg-cyan-100" : "bg-gray-50"}`}>
                <CreditCard className={`h-8 w-8 ${selected === "online" ? "text-cyan-600" : "text-gray-500"}`} />
              </div>
              <h3 className={`text-lg font-bold ${selected === "online" ? "text-cyan-700" : "text-gray-900"}`}>Online Payment</h3>
              <p className="text-xs text-gray-600">Pay instantly via UPI, Google Pay, PhonePe, or scan QR code.</p>
              {selected === "online" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500">
                  <span className="text-white text-sm font-bold">✓</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full h-12 text-base font-bold transition-all duration-300 ${
            selected
              ? "bg-gradient-to-r from-yellow-400 to-cyan-500 hover:from-yellow-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-400/40 hover:shadow-cyan-500/60"
              : "bg-white/60 text-gray-500 cursor-not-allowed"
          }`}
        >
          {selected ? (
            <>Confirm & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            "Select a payment method"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
