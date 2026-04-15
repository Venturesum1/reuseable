import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Smartphone, QrCode, Home, Loader2, CreditCard, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MERCHANT_UPI = "yourmerchant@upi"; // Replace with actual UPI ID
const MERCHANT_NAME = "YourStore";

const UPI_APPS = [
  { name: "Google Pay", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png", scheme: "tez://upi/pay" },
  { name: "PhonePe", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1024px-PhonePe_Logo.svg.png", scheme: "phonepe://pay" },
  { name: "Paytm", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png", scheme: "paytmmp://pay" },
  { name: "BHIM", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png", scheme: "upi://pay" },
];

export default function PaymentOnline() {
  const { orderId } = useParams();
  const location = useLocation();
  const { order } = (location.state || {}) as any;
  const { toast } = useToast();
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txnRef, setTxnRef] = useState("");

  const amount = order ? Number(order.total_price) : 0;

  const upiPayUrl = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=Order+${orderId?.slice(0, 8)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUrl)}`;

  const handleAppPay = (scheme: string) => {
    const url = `${scheme}?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=Order+${orderId?.slice(0, 8)}`;
    window.location.href = url;
  };

  const handleUpiPay = () => {
    if (!upiId.includes("@")) {
      toast({ title: "Invalid UPI ID", description: "Please enter a valid UPI ID (e.g., name@upi)", variant: "destructive" });
      return;
    }
    const url = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=Order+${orderId?.slice(0, 8)}`;
    window.location.href = url;
  };

  const markAsPaid = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ payment_method: "Online", payment_status: "completed", } as any)
      .eq("id", orderId!);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setPaid(true);
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
          {!paid ? (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Amount Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Online <span className="text-purple-400">Payment</span></h1>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 px-6 py-3">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <span className="text-3xl font-bold text-yellow-400">₹{amount.toLocaleString()}</span>
                </div>
              </div>

              {/* UPI ID Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-5"
              >
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-purple-400" />
                  Pay via UPI ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="bg-[#1a1d2e] border-[#2a2d3e] text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                  <Button onClick={handleUpiPay} className="bg-purple-600 hover:bg-purple-500 text-white px-6 shrink-0">
                    Pay
                  </Button>
                </div>
              </motion.div>

              {/* UPI App Icons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-5"
              >
                <p className="text-sm font-medium text-gray-300 mb-4">Or pay using UPI Apps</p>
                <div className="grid grid-cols-4 gap-3">
                  {UPI_APPS.map(app => (
                    <button
                      key={app.name}
                      onClick={() => handleAppPay(app.scheme)}
                      className="flex flex-col items-center gap-2 rounded-xl p-3 bg-[#1a1d2e] border border-[#2a2d3e] hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200"
                    >
                      <div className="h-10 w-10 rounded-lg bg-white p-1.5 flex items-center justify-center">
                        <img src={app.icon} alt={app.name} className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[10px] text-gray-400 text-center leading-tight">{app.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-medium text-gray-300">Scan QR Code to Pay</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-xl bg-white p-3 mb-3">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="h-48 w-48" />
                  </div>
                  <p className="text-sm text-white font-medium">{MERCHANT_NAME}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400 font-mono">{MERCHANT_UPI}</p>
                    <button onClick={() => { navigator.clipboard.writeText(MERCHANT_UPI); toast({ title: "Copied!" }); }}>
                      <Copy className="h-3 w-3 text-gray-500 hover:text-purple-400 transition" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-yellow-400 mt-2">₹{amount.toLocaleString()}</p>
                </div>
              </motion.div>

              {/* Confirm Payment */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-5"
              >
                <p className="text-sm text-gray-400 mb-3">After completing payment, enter the transaction reference (optional) and confirm:</p>
                <Input
                  value={txnRef}
                  onChange={e => setTxnRef(e.target.value)}
                  placeholder="Transaction Reference / UTR (optional)"
                  className="bg-[#1a1d2e] border-[#2a2d3e] text-white placeholder:text-gray-500 focus:border-purple-500 mb-3"
                />
                <Button
                  onClick={markAsPaid}
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                  I've Completed Payment
                </Button>
              </motion.div>
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

              <h1 className="text-2xl font-bold text-white mb-2">Payment <span className="text-green-400">Successful!</span></h1>
              <p className="text-gray-400 text-sm mb-1">Your order has been confirmed.</p>
              <p className="text-xs text-gray-500 font-mono mb-6">Order ID: #{orderId?.slice(0, 8)}</p>

              <div className="space-y-2 text-sm mb-8 p-4 rounded-xl bg-[#1a1d2e]">
                <div className="flex justify-between"><span className="text-gray-400">Product</span><span className="text-white">{order.product_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Qty</span><span className="text-white">{order.quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Payment</span><span className="text-green-400 font-semibold">Online (UPI)</span></div>
                {txnRef && <div className="flex justify-between"><span className="text-gray-400">Ref</span><span className="text-white font-mono text-xs">{txnRef}</span></div>}
                <div className="flex justify-between border-t border-[#2a2d3e] pt-2"><span className="text-white font-semibold">Total Paid</span><span className="text-green-400 font-bold text-lg">₹{amount.toLocaleString()}</span></div>
              </div>

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
