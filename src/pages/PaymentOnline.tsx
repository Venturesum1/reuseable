import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Smartphone, QrCode, Home, Loader2, CreditCard, Copy, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import upiQrImage from "@/assets/upi-qr.jpeg";

const MERCHANT_UPI = "bhritesh14u@oksbi";
const MERCHANT_NAME = "Hritesh Bhardwaj";

const UPI_APPS = [
  { name: "Google Pay", color: "from-blue-500 to-green-500", letter: "G", pkg: "com.google.android.apps.nbu.paisa.user" },
  { name: "PhonePe", color: "from-purple-600 to-purple-800", letter: "P", pkg: "com.phonepe.app" },
  { name: "Paytm", color: "from-blue-400 to-blue-600", letter: "P", pkg: "net.one97.paytm" },
  { name: "BHIM", color: "from-orange-500 to-red-500", letter: "B", pkg: "in.org.npci.upiapp" },
  { name: "Amazon Pay", color: "from-orange-400 to-yellow-500", letter: "A", pkg: "in.amazon.mShop.android.shopping" },
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
  const txnNote = `Order ${orderId?.slice(0, 8)}`;

  // Standard UPI deep link — works across all UPI apps when triggered on a mobile device
  const buildUpiUrl = (scheme = "upi") =>
    `${scheme}://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

  const handleAppPay = (appName: string) => {
    const url = buildUpiUrl("upi");
    // Detect mobile — UPI deep links only work on mobile devices with the app installed
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      toast({
        title: "Mobile Only",
        description: `${appName} payment works only on mobile devices. Please scan the QR code from your phone.`,
        variant: "destructive",
      });
      return;
    }
    window.location.href = url;
  };

  const handleUpiPay = () => {
    if (!upiId.includes("@") || upiId.length < 5) {
      toast({ title: "Invalid UPI ID", description: "Please enter a valid UPI ID (e.g., name@upi)", variant: "destructive" });
      return;
    }
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      toast({
        title: "Mobile Only",
        description: "UPI payment works only on mobile devices. Please scan the QR code from your phone.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = buildUpiUrl("upi");
  };

  const markAsPaid = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update({ payment_method: "Online", payment_status: "completed" } as any)
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-gray-900">
          <p>Order not found.</p>
          <Button asChild className="mt-4"><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-8 px-4">
        <AnimatePresence mode="wait">
          {!paid ? (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Amount Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Online <span className="text-cyan-700">Payment</span></h1>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white border-2 border-yellow-300 px-6 py-3 shadow-md">
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                  <span className="text-3xl font-bold text-yellow-600">₹{amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Real QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border-2 border-white bg-white p-5 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="h-4 w-4 text-cyan-600" />
                  <p className="text-sm font-bold text-gray-900">Scan QR Code to Pay</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-xl bg-white border-2 border-cyan-100 p-2 mb-3 shadow-sm">
                    <img src={upiQrImage} alt="UPI QR Code" className="h-64 w-64 object-contain" />
                  </div>
                  <p className="text-sm text-gray-900 font-semibold">{MERCHANT_NAME}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-600 font-mono">{MERCHANT_UPI}</p>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(MERCHANT_UPI); toast({ title: "Copied!", description: "UPI ID copied to clipboard" }); }}
                      className="hover:scale-110 transition"
                    >
                      <Copy className="h-3 w-3 text-cyan-600" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-yellow-600 mt-2">₹{amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2 text-center">Scan with any UPI app — Google Pay, PhonePe, Paytm, BHIM, etc.</p>
                </div>
              </motion.div>

              {/* UPI ID Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border-2 border-white bg-white p-5 shadow-md"
              >
                <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-cyan-600" />
                  Pay via Your UPI ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="bg-cyan-50 border-2 border-cyan-200 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500"
                  />
                  <Button onClick={handleUpiPay} className="bg-gradient-to-r from-yellow-400 to-cyan-500 hover:from-yellow-500 hover:to-cyan-600 text-white font-bold px-6 shrink-0">
                    Pay
                  </Button>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">Opens your default UPI app on mobile devices.</p>
              </motion.div>

              {/* UPI App Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border-2 border-white bg-white p-5 shadow-md"
              >
                <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-cyan-600" />
                  Or pay using UPI Apps
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {UPI_APPS.map(app => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => handleAppPay(app.name)}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-2 bg-cyan-50 border border-cyan-100 hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-md transition-all duration-200"
                    >
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                        {app.letter}
                      </div>
                      <span className="text-[9px] text-gray-700 text-center leading-tight font-medium">{app.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-3 text-center">Tap to open the app with payment details pre-filled (mobile only).</p>
              </motion.div>

              {/* Confirm Payment */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-md"
              >
                <p className="text-sm text-gray-700 mb-3 font-medium">After completing payment, enter the transaction reference (optional) and confirm:</p>
                <Input
                  value={txnRef}
                  onChange={e => setTxnRef(e.target.value)}
                  placeholder="Transaction Reference / UTR (optional)"
                  className="bg-white border-2 border-yellow-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400 mb-3"
                />
                <Button
                  onClick={markAsPaid}
                  disabled={loading}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-yellow-400 to-cyan-500 hover:from-yellow-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-400/40 hover:shadow-cyan-500/60 transition-all duration-300"
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
              className="rounded-2xl border-2 border-cyan-300 bg-white p-8 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100"
              >
                <CheckCircle className="h-14 w-14 text-cyan-600" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment <span className="text-cyan-600">Successful!</span></h1>
              <p className="text-gray-600 text-sm mb-1">Your order has been confirmed.</p>
              <p className="text-xs text-gray-500 font-mono mb-6">Order ID: #{orderId?.slice(0, 8)}</p>

              <div className="space-y-2 text-sm mb-8 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                <div className="flex justify-between"><span className="text-gray-600">Product</span><span className="text-gray-900">{order.product_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Qty</span><span className="text-gray-900">{order.quantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Payment</span><span className="text-cyan-700 font-semibold">Online (UPI)</span></div>
                {txnRef && <div className="flex justify-between"><span className="text-gray-600">Ref</span><span className="text-gray-900 font-mono text-xs">{txnRef}</span></div>}
                <div className="flex justify-between border-t border-cyan-200 pt-2"><span className="text-gray-900 font-bold">Total Paid</span><span className="text-yellow-600 font-bold text-lg">₹{Number(order.total_price).toLocaleString()}</span></div>
              </div>

              <Button asChild className="w-full h-12 bg-gradient-to-r from-yellow-400 to-cyan-500 hover:from-yellow-500 hover:to-cyan-600 text-white font-bold">
                <Link to="/"><Home className="mr-2 h-4 w-4" /> Continue Shopping</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
