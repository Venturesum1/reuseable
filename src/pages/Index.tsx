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
        <span
          key={i}
          style={{ backgroundColor: "#d6b4fc", color: "#1a0a2e" }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold shadow-sm"
        >
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
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #2d1060 50%, #0f0520 100%)" }}>
      <div className="container py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[320px]">
          <motion.div key={current} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ backgroundColor: "rgba(214,180,252,0.15)", color: "#d6b4fc" }}
            >
              Featured Product
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
              {slide.name}
            </h1>
            <p className="mt-3 text-purple-200 max-w-md">{slide.short_description || slide.description}</p>
            <p className="mt-4 font-display text-3xl font-bold" style={{ color: "#4adeaa" }}>
              ₹{Number(slide.price).toLocaleString()}
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                asChild size="lg"
                className="rounded-full px-8 shadow-md font-bold"
                style={{ backgroundColor: "#d6b4fc", color: "#1a0a2e" }}
              >
                <Link to={`/product/${slide.id}`}>
                  Shop Now <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div key={`img-${current}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl scale-75" style={{ backgroundColor: "rgba(214,180,252,0.15)" }} />
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
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === current ? "2rem" : "0.625rem",
                backgroundColor: i === current ? "#d6b4fc" : "rgba(214,180,252,0.3)",
              }}
            />
          ))}
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-colors"
              style={{ backgroundColor: "rgba(214,180,252,0.15)", color: "#d6b4fc" }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrent((current + 1) % slides.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-colors"
              style={{ backgroundColor: "rgba(214,180,252,0.15)", color: "#d6b4fc" }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: "rgba(214,180,252,0.08)" }} />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: "rgba(74,222,170,0.08)" }} />
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
        <section className="border-b bg-card shadow-sm" style={{ borderColor: "rgba(214,180,252,0.2)" }}>
          <div className="container py-5">
            <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all"
                  style={
                    !selectedCategory
                      ? { borderColor: "#d6b4fc", backgroundColor: "#d6b4fc", color: "#1a0a2e", transform: "scale(1.1)", boxShadow: "0 0 16px rgba(214,180,252,0.4)" }
                      : { borderColor: "rgba(214,180,252,0.3)", backgroundColor: "rgba(214,180,252,0.08)", color: "#d6b4fc" }
                  }
                >
                  <Tag className="h-5 w-5" />
                </div>
                <span
                  className="text-xs font-medium whitespace-nowrap"
                  style={{ color: !selectedCategory ? "#d6b4fc" : "rgba(214,180,252,0.6)", fontWeight: !selectedCategory ? 600 : 400 }}
                >
                  All
                </span>
              </button>
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg transition-all"
                    style={
                      selectedCategory === cat.id
                        ? { borderColor: "#d6b4fc", backgroundColor: "#d6b4fc", color: "#1a0a2e", transform: "scale(1.1)", boxShadow: "0 0 16px rgba(214,180,252,0.4)" }
                        : { borderColor: "rgba(214,180,252,0.3)", backgroundColor: "rgba(214,180,252,0.08)" }
                    }
                  >
                    {categoryIcons[i % categoryIcons.length]}
                  </div>
                  <span
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: selectedCategory === cat.id ? "#d6b4fc" : "rgba(214,180,252,0.6)", fontWeight: selectedCategory === cat.id ? 600 : 400 }}
                  >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[160px]"
              style={{ background: "linear-gradient(135deg, rgba(214,180,252,0.2), rgba(214,180,252,0.05))", border: "1px solid rgba(214,180,252,0.2)" }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#d6b4fc" }}>Get Rewarded</span>
                <h3 className="font-display text-xl font-bold text-white mt-1">Save Up <span style={{ color: "#d6b4fc" }}>50% Off</span></h3>
                <p className="text-xs mt-1" style={{ color: "rgba(214,180,252,0.6)" }}>Best prices on the market!</p>
              </div>
              <Button size="sm" className="mt-3 self-start rounded-full text-xs px-5 font-bold" style={{ backgroundColor: "#d6b4fc", color: "#1a0a2e" }}>
                Shop Now <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[160px]"
              style={{ background: "linear-gradient(135deg, rgba(214,180,252,0.12), rgba(214,180,252,0.03))", border: "1px solid rgba(214,180,252,0.15)" }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">New Arrivals</span>
                <h3 className="font-display text-xl font-bold text-white mt-1">Fresh Collection</h3>
                <p className="text-xs mt-1" style={{ color: "rgba(214,180,252,0.6)" }}>Free delivery on orders ₹500+</p>
              </div>
              <Button
                size="sm" variant="outline"
                className="mt-3 self-start rounded-full text-xs px-5"
                style={{ borderColor: "#d6b4fc", color: "#d6b4fc" }}
              >
                Explore <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[160px]"
              style={{ background: "linear-gradient(135deg, rgba(74,222,170,0.15), rgba(74,222,170,0.03))", border: "1px solid rgba(74,222,170,0.2)" }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Top Seller</span>
                <h3 className="font-display text-xl font-bold text-white mt-1">Buy 1 Get 1 <span style={{ color: "#d6b4fc" }}>Free</span></h3>
                <p className="text-xs mt-1" style={{ color: "rgba(214,180,252,0.6)" }}>Apply to buy online.</p>
              </div>
              <Button
                size="sm" variant="outline"
                className="mt-3 self-start rounded-full text-xs px-5"
                style={{ borderColor: "#4adeaa", color: "#4adeaa" }}
              >
                Shop Now <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Today's Featured Deals */}
      {!search && !selectedCategory && filtered && filtered.length > 0 && (
        <section className="py-8" style={{ backgroundColor: "rgba(214,180,252,0.05)" }}>
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-white">Today's Featured Deals</h2>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm" style={{ color: "rgba(214,180,252,0.6)" }}>Ends in:</span>
                  <CountdownTimer />
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
                  style={{ border: "1px solid rgba(214,180,252,0.3)", color: "#d6b4fc" }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
                  style={{ border: "1px solid rgba(214,180,252,0.3)", color: "#d6b4fc" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {filtered.slice(0, 8).map((p) => (
                <div key={p.id} className="min-w-[220px] max-w-[220px] snap-start">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    shortDescription={p.short_description}
                    price={Number(p.price)}
                    images={p.images || []}
                    stock={p.stock}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mid Promo Banner */}
      {!search && (
        <section className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-center min-h-[120px]"
              style={{ background: "linear-gradient(135deg, rgba(214,180,252,0.18), rgba(214,180,252,0.05))", border: "1px solid rgba(214,180,252,0.15)" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#d6b4fc" }}>Get Rewarded</span>
              <h3 className="font-display text-lg font-bold text-white mt-1">Super Cheap Prices</h3>
              <p className="text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>Earn 20% Back in Rewards</p>
              <Button size="sm" className="mt-3 self-start rounded-full text-xs px-5 font-bold" style={{ backgroundColor: "#d6b4fc", color: "#1a0a2e" }}>
                Shop Now <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="rounded-2xl p-6 flex items-center gap-4" style={{ backgroundColor: "rgba(214,180,252,0.08)", border: "1px solid rgba(214,180,252,0.15)" }}>
              <div className="flex-1">
                <p className="text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>Starting At</p>
                <p className="font-display text-2xl font-bold mt-1" style={{ color: "#d6b4fc" }}>₹999</p>
                <p className="text-sm font-semibold text-white mt-1">Power Banks & Accessories</p>
              </div>
              <Zap className="h-12 w-12" style={{ color: "rgba(214,180,252,0.2)" }} />
            </div>
            <div className="rounded-2xl p-6 flex items-center gap-4" style={{ backgroundColor: "rgba(214,180,252,0.08)", border: "1px solid rgba(214,180,252,0.15)" }}>
              <div className="flex-1">
                <p className="text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>Limited Offer</p>
                <p className="font-display text-2xl font-bold mt-1" style={{ color: "#d6b4fc" }}>30% Off</p>
                <p className="text-sm font-semibold text-white mt-1">Electronics & Gadgets</p>
              </div>
              <Sparkles className="h-12 w-12" style={{ color: "rgba(214,180,252,0.2)" }} />
            </div>
          </div>
        </section>
      )}

      {/* Trending / All Products Section */}
      <section className="container pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="font-display text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: "#d6b4fc" }} />
            {selectedCategory
              ? categories?.find((c) => c.id === selectedCategory)?.name || "Category"
              : search
                ? `Results for "${search}"`
                : "Trending This Week"}
          </h2>

          {!search && categories && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Badge
                className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap font-semibold"
                style={
                  trendingTab === "all" && !selectedCategory
                    ? { backgroundColor: "#d6b4fc", color: "#1a0a2e", border: "none" }
                    : { backgroundColor: "transparent", color: "#d6b4fc", border: "1px solid rgba(214,180,252,0.4)" }
                }
                onClick={() => { setTrendingTab("all"); setSelectedCategory(null); }}
              >
                Best Seller
              </Badge>
              {categories.slice(0, 4).map((cat) => (
                <Badge
                  key={cat.id}
                  className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: "#d6b4fc", color: "#1a0a2e", border: "none" }
                      : { backgroundColor: "transparent", color: "#d6b4fc", border: "1px solid rgba(214,180,252,0.4)" }
                  }
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setTrendingTab(cat.id);
                  }}
                >
                  {cat.name}
                </Badge>
              ))}
              <Badge
                className="cursor-pointer text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105 whitespace-nowrap"
                style={{ backgroundColor: "transparent", color: "#d6b4fc", border: "1px solid rgba(214,180,252,0.4)" }}
                onClick={() => { setSelectedCategory(null); setTrendingTab("all"); }}
              >
                View All
              </Badge>
            </div>
          )}
        </div>

        <p className="text-sm mb-6" style={{ color: "rgba(214,180,252,0.6)" }}>
          {filtered?.length || 0} products available
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#d6b4fc" }} />
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center py-20" style={{ color: "rgba(214,180,252,0.5)" }}>
            <PackageSearch className="mb-4 h-16 w-16" />
            <p className="text-lg font-semibold text-white">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              style={{ borderColor: "#d6b4fc", color: "#d6b4fc" }}
              onClick={() => { setSearch(""); setSelectedCategory(null); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(trendingFiltered || filtered).map((p) => (
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
        )}
      </section>

      {/* Bottom Promo Banner */}
      {!search && (
        <section style={{ background: "linear-gradient(90deg, rgba(214,180,252,0.12), rgba(214,180,252,0.04), rgba(74,222,170,0.08))", borderTop: "1px solid rgba(214,180,252,0.15)" }}>
          <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#d6b4fc" }}>New Collection</span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
                Up to <span style={{ color: "#d6b4fc" }}>30% Off</span>
              </h3>
              <p className="text-lg text-white font-semibold">Instant Discount</p>
              <p className="text-sm mt-1" style={{ color: "rgba(214,180,252,0.6)" }}>Applicable on all categories. Limited time only.</p>
            </div>
            <Button
              size="lg"
              className="rounded-full px-10 shadow-lg font-bold"
              style={{ backgroundColor: "#d6b4fc", color: "#1a0a2e" }}
            >
              Shop Now <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section style={{ borderTop: "1px solid rgba(214,180,252,0.15)", backgroundColor: "rgba(214,180,252,0.04)" }}>
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders over ₹999" },
              { icon: Shield, label: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, label: "24/7 Support", desc: "Dedicated support" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 justify-center text-center sm:text-left sm:justify-start">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                  style={{ backgroundColor: "rgba(214,180,252,0.12)", color: "#d6b4fc" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(214,180,252,0.15)", backgroundColor: "rgba(214,180,252,0.04)" }}>
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-display font-bold text-white mb-3 text-lg">ResellerHub</h4>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(214,180,252,0.6)" }}>
                Your trusted destination for quality products at the best prices. Shop with confidence.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm mb-3">Quick Links</h5>
              <div className="space-y-2 text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>
                <Link to="/" className="block transition-colors hover:text-[#d6b4fc]">Home</Link>
                <Link to="/cart" className="block transition-colors hover:text-[#d6b4fc]">Cart</Link>
                <Link to="/wishlist" className="block transition-colors hover:text-[#d6b4fc]">Wishlist</Link>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm mb-3">Contact Us</h5>
              <div className="space-y-2 text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>
                <p>📞 +91 98765 43210</p>
                <p>✉️ support@resellerhub.com</p>
                <p>📍 Mumbai, India</p>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm mb-3">Policies</h5>
              <div className="space-y-2 text-xs" style={{ color: "rgba(214,180,252,0.6)" }}>
                <p className="cursor-pointer transition-colors hover:text-[#d6b4fc]">Shipping Policy</p>
                <p className="cursor-pointer transition-colors hover:text-[#d6b4fc]">Return Policy</p>
                <p className="cursor-pointer transition-colors hover:text-[#d6b4fc]">Privacy Policy</p>
                <p className="cursor-pointer transition-colors hover:text-[#d6b4fc]">Terms of Service</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: "1px solid rgba(214,180,252,0.15)", color: "rgba(214,180,252,0.4)" }}>
            © 2026 ResellerHub. All rights reserved.
          </div>
        </div>
        {/* dsdsd */}
      </footer>
    </div>
  );
}