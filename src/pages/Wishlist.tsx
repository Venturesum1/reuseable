import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const sessionId = getSessionId();

  const { data: items } = useQuery({
    queryKey: ["wishlist", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("product_id, products(*)")
        .eq("session_id", sessionId);
      return data || [];
    },
  });

  const products = items?.map((i) => (i as any).products).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-foreground">My Wishlist</h1>
        {!products.length ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Your wishlist is empty</p>
            <Button asChild className="mt-4"><Link to="/">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} id={p.id} name={p.name} shortDescription={p.short_description} price={Number(p.price)} images={p.images || []} stock={p.stock} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
