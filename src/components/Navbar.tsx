import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Store } from "lucide-react";
import { getCart } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => setCartCount(getCart().reduce((s, i) => s + i.quantity, 0));
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <Store className="h-6 w-6 text-primary" />
          ResellerHub
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/wishlist" className="relative rounded-lg p-2 transition-colors hover:bg-muted">
            <Heart className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link to="/cart" className="relative rounded-lg p-2 transition-colors hover:bg-muted">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                {cartCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
