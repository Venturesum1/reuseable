import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus } from "lucide-react";

export default function OrderForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get quantity from navigation state (from Buy Now or Cart)
  const initialQty = (location.state as any)?.quantity || 1;
  const [quantity, setQuantity] = useState<number>(initialQty);

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", country: "India",
  });

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalPrice = product ? Number(product.price) * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    const { data, error } = await supabase.from("orders").insert({
      ...form,
      product_id: product.id,
      product_name: product.name,
      quantity,
      total_price: totalPrice,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate(`/payment/${data.id}`, { state: { order: data, sourceUrl: product.source_url } });
    setLoading(false);
  };

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  );

  const maxQty = product.stock || 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-8">
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Shipping Details</h1>
        <p className="mb-6 text-sm text-muted-foreground">Complete your order for <strong>{product.name}</strong></p>

        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-soft mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium text-foreground">{product.name}</p>
            </div>
            <p className="font-display text-lg font-bold text-primary">₹{Number(product.price).toLocaleString()}</p>
          </div>
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Quantity</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[2rem] text-center font-medium text-foreground">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <p className="text-sm font-medium text-foreground">Total</p>
            <p className="font-display text-xl font-bold text-primary">₹{totalPrice.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Full Address</Label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={form.state} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={form.country} onChange={handleChange} required />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Proceed to Payment
          </Button>
        </form>
      </div>
    </div>
  );
}
