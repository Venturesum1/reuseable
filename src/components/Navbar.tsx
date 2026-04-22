import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Store, Search, Menu, X, Package } from "lucide-react";
import { getCart } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export default function Navbar({ onSearch, searchValue }: NavbarProps) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0));
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    onSearch?.(val);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-soft">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 border-b border-border">
        <div className="container flex h-8 items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">🚚 Free shipping on orders over ₹999</span>
          <div className="hidden sm:flex items-center gap-4">
            <span>📞 +91 98765 43210</span>
            <span>✉️ support@resellerhub.com</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
            <Store className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">Reseller<span className="text-primary">Hub</span></span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 h-10 bg-muted/50 border-border rounded-full text-sm focus:bg-card focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right actions */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link to="/orders" className="relative hidden sm:flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-muted group">
            <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] text-muted-foreground mt-0.5">Orders</span>
          </Link>
          <Link to="/wishlist" className="relative flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-muted group">
            <Heart className="h-5 w-5 text-muted-foreground group-hover:text-peach transition-colors" />
            <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">Wishlist</span>
          </Link>
          <Link to="/cart" className="relative flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-muted group">
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              {cartCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">Cart</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden rounded-lg p-2 hover:bg-muted text-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card p-4 space-y-2">
          <Link to="/orders" className="block rounded-lg px-4 py-2 hover:bg-muted text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>
            📦 My Orders
          </Link>
          <Link to="/wishlist" className="block rounded-lg px-4 py-2 hover:bg-muted text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>
            ❤️ Wishlist
          </Link>
          <Link to="/cart" className="block rounded-lg px-4 py-2 hover:bg-muted text-sm text-foreground" onClick={() => setMobileMenuOpen(false)}>
            🛒 Cart ({cartCount})
          </Link>
        </div>
      )}
    </header>
  );
}
