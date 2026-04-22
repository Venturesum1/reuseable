import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, Package, Truck, Home, XCircle, MapPin, Phone, User, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const STEPS: { key: OrderStatus; label: string; icon: any; description: string }[] = [
  { key: "pending", label: "Order Placed", icon: Clock, description: "We received your order" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Payment & details verified" },
  { key: "processing", label: "Processing", icon: Package, description: "We're packing your item" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "On the way to you" },
  { key: "delivered", label: "Delivered", icon: Home, description: "Order successfully delivered" },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!orderId) return;
    const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <p className="text-foreground">Order not found.</p>
          <Button asChild className="mt-4"><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  const status = (order.order_status || "pending") as OrderStatus;
  const isCancelled = status === "cancelled";
  const currentStepIndex = STEPS.findIndex(s => s.key === status);
  const placedDate = new Date(order.created_at);
  const updatedDate = new Date(order.status_updated_at || order.created_at);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">Track Your Order</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">Order #{orderId?.slice(0, 8).toUpperCase()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Placed {formatDistanceToNow(placedDate, { addSuffix: true })} • {format(placedDate, "PPp")}</p>
          </div>

          {/* Payment verification banner */}
          {!isCancelled && order.payment_status === "verifying" && (
            <div className="mb-4 rounded-xl border-2 border-orange-300 bg-orange-50 p-4 text-center">
              <p className="text-sm font-semibold text-orange-900">⏳ Payment Under Verification</p>
              <p className="text-xs text-orange-800 mt-1">Your UTR <span className="font-mono font-bold">{order.transaction_ref}</span> has been submitted. Order will be confirmed once our admin verifies the transaction.</p>
            </div>
          )}

          {/* Status Card */}
          {isCancelled ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="mb-6 rounded-2xl border-2 border-destructive/40 bg-card p-6 shadow-soft text-center"
            >
              <XCircle className="mx-auto h-14 w-14 text-destructive mb-3" />
              <h2 className="text-xl font-bold text-foreground">Order Cancelled</h2>
              {order.cancel_reason && <p className="mt-2 text-sm text-muted-foreground">Reason: {order.cancel_reason}</p>}
              <p className="mt-1 text-xs text-muted-foreground">Cancelled {formatDistanceToNow(updatedDate, { addSuffix: true })}</p>
            </motion.div>
          ) : (
            <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const completed = i <= currentStepIndex;
                  const active = i === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={false}
                          animate={{ scale: active ? 1.1 : 1 }}
                          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                            completed
                              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-12 w-0.5 ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8 pt-1">
                        <p className={`font-semibold ${completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                          {active && <span className="ml-2 text-xs text-primary animate-pulse">● Current</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        {active && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated {formatDistanceToNow(updatedDate, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <Package className="h-4 w-4 text-primary" /> Product
              </h3>
              <p className="text-sm text-foreground">{order.product_name}</p>
              <p className="text-xs text-muted-foreground mt-1">Quantity: {order.quantity}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-accent">₹{Number(order.total_price).toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{order.payment_method} • {order.payment_status}</span>
              </div>
              {order.transaction_ref && (
                <p className="mt-1 text-[11px] text-muted-foreground font-mono">UTR: {order.transaction_ref}</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Address
              </h3>
              <p className="flex items-center gap-2 text-sm text-foreground"><User className="h-3 w-3" /> {order.full_name}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3" /> {order.phone}</p>
              <p className="text-xs text-muted-foreground mt-2">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline"><Link to="/">Continue Shopping</Link></Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
