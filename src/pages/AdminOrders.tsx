import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ id, confirmed }: { id: string; confirmed: boolean }) => {
      const { error } = await supabase.from("orders").update({ is_confirmed: confirmed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order updated" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">User Orders & Addresses</h1>
      <div className="rounded-xl border border-border/50 bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Confirmed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.full_name}</TableCell>
                <TableCell>{o.phone}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {o.address}, {o.city}, {o.state} - {o.pincode}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{o.product_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {o.product_id?.slice(0, 8)}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">₹{Number(o.total_price).toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={o.payment_status === "completed" ? "default" : "secondary"}>
                    {o.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={o.is_confirmed}
                    onCheckedChange={(checked) => confirmMutation.mutate({ id: o.id, confirmed: !!checked })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
