import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye } from "lucide-react";
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
  const [hovered, setHovered] = useState(false);
  const { toast } = useToast();
  const image = images?.[0] || "/placeholder.svg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: id, name, price, quantity: 1, image });
    toast({ title: "Added to cart", description: name });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      <Link
        to={`/product/${id}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-soft transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Stock badge */}
            {stock <= 0 && (
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
            {stock > 0 && stock <= 5 && (
              <div className="absolute top-3 left-3">
                <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  Only {stock} left
                </span>
              </div>
            )}

            {/* Hover action buttons */}
            <div
              className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 ${
                hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              }`}
            >
              <button
                onClick={handleWishlist}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm shadow-md transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
              </button>
              <button
                onClick={handleAddToCart}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm shadow-md transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
              <Link
                to={`/product/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm shadow-md transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">ResellerHub</p>
            <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
              {name}
            </h3>
            {shortDescription && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{shortDescription}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-primary">₹{price.toLocaleString()}</span>
              {stock > 0 && (
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  In Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
