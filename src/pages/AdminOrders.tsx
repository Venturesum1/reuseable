import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, XCircle, Phone, Search, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "processing", label: "Processing", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "shipped", label: "Shipped", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const getStatusBadge = (status: string) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return <Badge className={`${opt.color} hover:opacity-80`}>{opt.label}</Badge>;
};

const getPaymentBadge = (method: string, status: string) => {
  if (status === "completed") {
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Verified Paid</Badge>;
  }
  if (status === "verifying") {
    return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 animate-pulse">⏳ Verifying UTR</Badge>;
  }
  if (method === "COD") {
    return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">COD</Badge>;
  }
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Pending</Badge>;
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "Online" | "COD" | "verifying" | "pending">("all");
  const [search, setSearch] = useState("");
  const [cancelOrder, setCancelOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { order_status: status };
      if (status === "confirmed") update.is_confirmed = true;
      const { error } = await supabase.from("orders").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          order_status: "confirmed",
          is_confirmed: true,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Payment Verified", description: "Order confirmed and customer notified." });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: "cancelled", cancel_reason: reason } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order cancelled" });
      setCancelOrder(null);
      setCancelReason("");
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const filtered = (orders || []).filter((o: any) => {
    if (filter === "Online" && o.payment_method !== "Online") return false;
    if (filter === "COD" && o.payment_method !== "COD") return false;
    if (filter === "verifying" && o.payment_status !== "verifying") return false;
    if (filter === "pending" && o.payment_status !== "pending") return false;
    if (search) {
      const q = search.toLowerCase();
      return o.full_name?.toLowerCase().includes(q) || o.phone?.includes(q) || o.id?.includes(q);
    }
    return true;
  });

  const counts = {
    all: orders?.length || 0,
    Online: orders?.filter((o: any) => o.payment_method === "Online").length || 0,
    COD: orders?.filter((o: any) => o.payment_method === "COD").length || 0,
    verifying: orders?.filter((o: any) => o.payment_status === "verifying").length || 0,
    pending: orders?.filter((o: any) => o.payment_status === "pending").length || 0,
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Orders Management</h1>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="verifying" className="data-[state=active]:bg-orange-500/20">
              ⏳ Verifying ({counts.verifying})
            </TabsTrigger>
            <TabsTrigger value="Online">Online ({counts.Online})</TabsTrigger>
            <TabsTrigger value="COD">COD ({counts.COD})</TabsTrigger>
            <TabsTrigger value="pending">Unpaid ({counts.pending})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders found</TableCell>
              </TableRow>
            )}
            {filtered.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell>
                  <p className="font-medium">{o.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{o.phone}</p>
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                  {o.address}, {o.city}, {o.state} - {o.pincode}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{o.product_name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {o.quantity}</p>
                </TableCell>
                <TableCell className="font-semibold text-primary">₹{Number(o.total_price).toLocaleString()}</TableCell>
                <TableCell>
                  {getPaymentBadge(o.payment_method, o.payment_status)}
                  {o.transaction_ref && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">UTR: {o.transaction_ref}</p>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(o.order_status || "pending")}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(o.status_updated_at || o.created_at), { addSuffix: true })}
                  </p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {o.payment_status === "verifying" && (
                      <Button
                        size="sm"
                        onClick={() => verifyMutation.mutate(o.id)}
                        disabled={verifyMutation.isPending}
                        className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs gap-1"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    )}
                    <Select
                      value={o.order_status || "pending"}
                      onValueChange={(v) => statusMutation.mutate({ id: o.id, status: v })}
                      disabled={o.order_status === "cancelled"}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.filter(s => s.value !== "cancelled").map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {o.order_status !== "cancelled" && o.order_status !== "delivered" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { setCancelOrder(o); setCancelReason(""); }}
                        className="h-8"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!cancelOrder} onOpenChange={(open) => !open && setCancelOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order #{cancelOrder?.id?.slice(0, 8)} for <strong>{cancelOrder?.full_name}</strong>. The customer will see the cancellation reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for cancellation (e.g., Out of stock, Customer unreachable)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelReason.trim().length < 3 || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ id: cancelOrder.id, reason: cancelReason.trim() })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
