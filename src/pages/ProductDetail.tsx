import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Zap, Minus, Plus, Loader2 } from "lucide-react";
import { addToCart, getSessionId } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: related } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", product!.category_id!)
        .neq("id", id!)
        .limit(4);
      return data || [];
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const price = Number(product.price);

  const handleAddToCart = () => {
    addToCart({ productId: product.id, name: product.name, price, quantity, image: images[0] });
    toast({ title: "Added to cart", description: `${quantity}x ${product.name}` });
  };

  const handleWishlist = async () => {
    const sessionId = getSessionId();
    await supabase.from("wishlists").upsert({ session_id: sessionId, product_id: product.id });
    toast({ title: "Added to wishlist" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-10 md:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <div className="overflow-hidden rounded-xl border border-border/50 bg-muted">
              <img src={images[selectedImage]} alt={product.name} className="aspect-square w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-border/50"}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.categories && (
              <span className="mb-2 text-sm font-medium text-primary">{(product.categories as any).name}</span>
            )}
            <h1 className="font-display text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">{product.description || product.short_description}</p>
            <div className="mt-6">
              <span className="font-display text-3xl font-bold text-primary">₹{price.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center rounded-lg border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleAddToCart} variant="outline" size="lg" disabled={product.stock <= 0}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button asChild size="lg" disabled={product.stock <= 0}>
                <Link to={`/order/${product.id}`}>
                  <Zap className="mr-2 h-4 w-4" /> Buy Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleWishlist}>
                <Heart className="mr-2 h-4 w-4" /> Wishlist
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} id={p.id} name={p.name} shortDescription={p.short_description} price={Number(p.price)} images={p.images || []} stock={p.stock} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
