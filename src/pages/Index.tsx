import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import {
  Loader2,
  PackageSearch,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Zap,
  Tag,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";

/* ── Countdown Timer ── */
function CountdownTimer() {
  const [time, setTime] = useState({ h: 6, m: 15, s: 48 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
          {v}
        </span>
      ))}
    </div>
  );
}

/* ── Hero Banner Carousel ── */
function HeroBanner({ products }: { products: any[] }) {
  const [current, setCurrent] = useState(0);
  const slides = products.slice(0, 3);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[320px]">
          <motion.div key={current} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Featured Product
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              {slide.name}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-md">{slide.short_description || slide.description}</p>
            <p className="mt-4 font-display text-3xl font-bold text-accent">
              ₹{Number(slide.price).toLocaleString()}
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg" className="rounded-full px-8 shadow-md">
                <Link to={`/product/${slide.id}`}>
                  Shop Now <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div key={`img-${current}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-75" />
              <img
                src={slide.images?.[0] || "/placeholder.svg"}
                alt={slide.name}
                className="relative z-10 h-64 md:h-80 w-auto max-w-full object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2.5 bg-primary/30"}`}
            />
          ))}
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-card/80 shadow-md backdrop-blur-sm hover:bg-card transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrent((current + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-card/80 shadow-md backdrop-blur-sm hover:bg-card transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
}

/* ── Main Page ── */
export default function Index() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trendingTab, setTrendingTab] = useState("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingFiltered = filtered?.filter((p) => {
    if (trendingTab === "all") return true;
    return p.category_id === trendingTab;
  });

  const categoryIcons = ["🖥️", "👕", "🏠", "⚽", "📱", "🎮", "🎧", "📷"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={setSearch} searchValue={search} />

      {/* Hero Banner */}
      {!search && !selectedCategory && products && <HeroBanner products={products} />}

      {/* Category Icons Row */}
      {categories && categories.length > 0 && (
        <section className="border-b border-border/30 bg-card shadow-sm">
          <div className="container py-5">
            <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all ${
                  !selectedCategory
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-110"
                    : "border-border/50 bg-muted/30 text-muted-foreground group-hover:border-primary/50 group-hover:bg-primary/5"
                }`}>
                  <Tag className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${!selectedCategory ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  All
                </span>
              </button>
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg transition-all ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-110"
                      : "border-border/50 bg-muted/30 group-hover:border-primary/50 group-hover:bg-primary/5"
                  }`}>
                    {categoryIcons[i % categoryIcons.length]}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${selectedCategory === cat.id ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 Promo Banners */}
      {!search && (
        <section className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Reveal variant="fade-up" delay={0}>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/10 flex flex-col justify-between min-h-[160px] hover:shadow-hover transition-shadow">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Get Rewarded</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">Save Up <span className="text-primary">50% Off</span></h3>
                  <p className="text-xs text-muted-foreground mt-1">Best prices on the market!</p>
                </div>
                <Button size="sm" className="mt-3 self-start rounded-full text-xs px-5">
                  Shop Now <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-secondary/50 via-secondary/20 to-transparent border border-secondary/20 flex flex-col justify-between min-h-[160px] hover:shadow-hover transition-shadow">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">New Arrivals</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">Fresh Collection</h3>
                  <p className="text-xs text-muted-foreground mt-1">Free delivery on orders ₹500+</p>
                </div>
                <Button size="sm" variant="outline" className="mt-3 self-start rounded-full text-xs px-5">
                  Explore <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={240}>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-accent/40 via-accent/15 to-transparent border border-accent/20 flex flex-col justify-between min-h-[160px] hover:shadow-hover transition-shadow">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground">Top Seller</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">Buy 1 Get 1 <span className="text-primary">Free</span></h3>
                  <p className="text-xs text-muted-foreground mt-1">Apply to buy online.</p>
                </div>
                <Button size="sm" variant="outline" className="mt-3 self-start rounded-full text-xs px-5">
                  Shop Now <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Today's Featured Deals (horizontal scroll) */}
      {!search && !selectedCategory && filtered && filtered.length > 0 && (
        <section className="py-8 bg-muted/20">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Today's Featured Deals</h2>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ends in:</span>
                  <CountdownTimer />
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {filtered.slice(0, 8).map((p, i) => (
                <Reveal key={p.id} variant="fade-up" delay={i * 60} className="min-w-[220px] max-w-[220px] snap-start">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    shortDescription={p.short_description}
                    price={Number(p.price)}
                    images={p.images || []}
                    stock={p.stock}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mid Promo Banner */}
      {!search && (
        <section className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 p-6 flex flex-col justify-center min-h-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Get Rewarded</span>
              <h3 className="font-display text-lg font-bold text-foreground mt-1">Super Cheap Prices</h3>
              <p className="text-xs text-muted-foreground">Earn 20% Back in Rewards</p>
              <Button size="sm" className="mt-3 self-start rounded-full text-xs px-5">
                Shop Now <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="rounded-2xl bg-card border border-border/40 p-6 flex items-center gap-4 shadow-soft">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Starting At</p>
                <p className="font-display text-2xl font-bold text-primary mt-1">₹999</p>
                <p className="text-sm font-semibold text-foreground mt-1">Power Banks & Accessories</p>
              </div>
              <Zap className="h-12 w-12 text-primary/20" />
            </div>
            <div className="rounded-2xl bg-card border border-border/40 p-6 flex items-center gap-4 shadow-soft">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Limited Offer</p>
                <p className="font-display text-2xl font-bold text-primary mt-1">30% Off</p>
                <p className="text-sm font-semibold text-foreground mt-1">Electronics & Gadgets</p>
              </div>
              <Sparkles className="h-12 w-12 text-primary/20" />
            </div>
          </div>
        </section>
      )}

      {/* Trending / All Products Section */}
      <section className="container pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {selectedCategory
              ? categories?.find((c) => c.id === selectedCategory)?.name || "Category"
              : search
                ? `Results for "${search}"`
                : "Trending This Week"}
          </h2>

          {/* Tabs */}
          {!search && categories && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Badge
                variant={trendingTab === "all" && !selectedCategory ? "default" : "outline"}
                className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                onClick={() => { setTrendingTab("all"); setSelectedCategory(null); }}
              >
                Best Seller
              </Badge>
              {categories.slice(0, 4).map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setTrendingTab(cat.id);
                  }}
                >
                  {cat.name}
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                onClick={() => { setSelectedCategory(null); setTrendingTab("all"); }}
              >
                View All
              </Badge>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {filtered?.length || 0} products available
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <PackageSearch className="mb-4 h-16 w-16" />
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearch(""); setSelectedCategory(null); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(trendingFiltered || filtered).map((p, i) => (
              <Reveal key={p.id} variant="fade-up" delay={(i % 10) * 50}>
                <ProductCard
                  id={p.id}
                  name={p.name}
                  shortDescription={p.short_description}
                  price={Number(p.price)}
                  images={p.images || []}
                  stock={p.stock}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Promo Banner */}
      {!search && (
        <section className="bg-gradient-to-r from-primary/15 via-primary/5 to-accent/10 border-t border-border">
          <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">New Collection</span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Up to <span className="text-primary">30% Off</span>
              </h3>
              <p className="text-lg text-foreground font-semibold">Instant Discount</p>
              <p className="text-sm text-muted-foreground mt-1">Applicable on all categories. Limited time only.</p>
            </div>
            <Button size="lg" className="rounded-full px-10 shadow-lg">
              Shop Now <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="border-t border-border/30 bg-card/50">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders over ₹999" },
              { icon: Shield, label: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, label: "24/7 Support", desc: "Dedicated support" },
            ].map(({ icon: Icon, label, desc }, i) => (
              <Reveal key={label} variant="zoom" delay={i * 100}>
                <div className="flex items-center gap-3 justify-center text-center sm:text-left sm:justify-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-display font-bold text-foreground mb-3 text-lg">ResellerHub</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your trusted destination for quality products at the best prices. Shop with confidence.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground text-sm mb-3">Quick Links</h5>
              <div className="space-y-2 text-xs text-muted-foreground">
                <Link to="/" className="block hover:text-primary transition-colors">Home</Link>
                <Link to="/cart" className="block hover:text-primary transition-colors">Cart</Link>
                <Link to="/wishlist" className="block hover:text-primary transition-colors">Wishlist</Link>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-foreground text-sm mb-3">Contact Us</h5>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>📞 +91 98765 43210</p>
                <p>✉️ support@resellerhub.com</p>
                <p>📍 Mumbai, India</p>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-foreground text-sm mb-3">Policies</h5>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="hover:text-primary cursor-pointer transition-colors">Shipping Policy</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Return Policy</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Terms of Service</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
            © 2026 ResellerHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
