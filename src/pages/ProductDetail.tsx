import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Zap, Minus, Plus, Loader2, ChevronRight, Shield, Truck, RotateCcw, Star } from "lucide-react";
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

      {/* Breadcrumb */}
      <div className="container py-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.categories && (
            <>
              <span className="hover:text-primary transition-colors cursor-pointer">
                {(product.categories as any).name}
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="container pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-muted/20 aspect-square">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain p-8 transition-transform duration-500 hover:scale-110"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                      i === selectedImage
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-border/30 hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {product.categories && (
              <span className="inline-flex items-center self-start bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                {(product.categories as any).name}
              </span>
            )}

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.0) · 12 Reviews</span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-primary">₹{price.toLocaleString()}</span>
            </div>

            {/* Description */}
            <div className="mt-6 bg-muted/20 rounded-xl p-4 border border-border/20">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {product.description || product.short_description || "No description available."}
              </p>
            </div>

            {/* Stock */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {product.stock} in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Out of stock
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">Quantity:</span>
              <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-bold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Total: <strong className="text-foreground">₹{(price * quantity).toLocaleString()}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                disabled={product.stock <= 0}
                className="flex-1 min-w-[140px] rounded-xl h-12"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button
                asChild
                size="lg"
                disabled={product.stock <= 0}
                className="flex-1 min-w-[140px] rounded-xl h-12 shadow-md"
              >
                <Link to={`/order/${product.id}`}>
                  <Zap className="mr-2 h-4 w-4" /> Buy Now
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
                className="rounded-xl h-12 px-4"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border/20">
                <Truck className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[10px] font-medium text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border/20">
                <Shield className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[10px] font-medium text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border/20">
                <RotateCcw className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-[10px] font-medium text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Related Products</h2>
              <Link to="/" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  shortDescription={p.short_description}
                  price={Number(p.price)}
                  images={p.images || []}
                  stock={p.stock}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
