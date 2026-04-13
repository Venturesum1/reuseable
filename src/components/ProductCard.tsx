import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart, getSessionId } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Props {
  id: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  images: string[];
  stock: number;
}

export default function ProductCard({ id, name, shortDescription, price, images, stock }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const { toast } = useToast();
  const image = images?.[0] || "/placeholder.svg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: id, name, price, quantity: 1, image });
    toast({ title: "Added to cart", description: name });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const sessionId = getSessionId();
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("session_id", sessionId).eq("product_id", id);
      setWishlisted(false);
      toast({ title: "Removed from wishlist" });
    } else {
      await supabase.from("wishlists").insert({ session_id: sessionId, product_id: id });
      setWishlisted(true);
      toast({ title: "Added to wishlist" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${id}`} className="group block">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-soft transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
            {shortDescription && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{shortDescription}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl font-bold text-primary">₹{price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{stock > 0 ? `${stock} in stock` : "Out of stock"}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={handleAddToCart} disabled={stock <= 0}>
                <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Cart
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/order/${id}`} onClick={(e) => e.stopPropagation()}>
                  <Zap className="mr-1 h-3.5 w-3.5" /> Buy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
