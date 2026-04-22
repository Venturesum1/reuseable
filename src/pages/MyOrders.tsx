import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-cyan-100 text-cyan-800 border-cyan-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function MyOrders() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 6) {
      toast({ title: "Enter a valid phone number", description: "Use the phone number you placed the order with.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", trimmed)
      .order("created_at", { ascending: false });
    setLoading(false);
    setSearched(true);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setOrders(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <ShoppingBag className="h-7 w-7 text-primary" /> My Orders
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your phone number to view all your orders</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft mb-6">
            <Label className="text-sm font-semibold text-foreground">Phone Number</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 9876543210"
                onKeyDown={(e) => e.key === "Enter" && search()}
                className="bg-background"
              />
              <Button onClick={search} disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" /> Find</>}
              </Button>
            </div>
          </div>

          {searched && orders && orders.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-foreground font-medium">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">No orders match this phone number.</p>
            </div>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to={`/track/${o.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{o.product_name}</p>
                        <Badge className={`${STATUS_COLORS[o.order_status || "pending"]} text-[10px]`}>
                          {(o.order_status || "pending").toUpperCase()}
                        </Badge>
                        {o.payment_status === "verifying" && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-[10px]">VERIFYING</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Placed {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })} • Qty {o.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-accent">₹{Number(o.total_price).toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{o.payment_method}</p>
                      <ArrowRight className="ml-auto mt-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
