import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getCart, updateCartQuantity, clearCart, getCartTotal, type CartItem } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const update = () => setCart(getCart());
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const total = getCartTotal(cart);

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center py-20 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add some products to get started!</p>
          <Button asChild className="mt-6"><Link to="/">Browse Products</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Shopping Cart</h1>
        <AnimatePresence>
          {cart.map(item => (
            <motion.div
              key={item.productId}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="mb-3 flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-soft"
            >
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                <p className="text-sm text-primary font-semibold">₹{item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCart(updateCartQuantity(item.productId, item.quantity - 1))} className="rounded-md p-1 hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => setCart(updateCartQuantity(item.productId, item.quantity + 1))} className="rounded-md p-1 hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={() => setCart(updateCartQuantity(item.productId, 0))} className="rounded-md p-1 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 shadow-soft">
          <span className="text-lg font-medium text-foreground">Total</span>
          <span className="font-display text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => { clearCart(); setCart([]); }}>Clear Cart</Button>
          <Button asChild className="flex-1"><Link to="/">Continue Shopping</Link></Button>
        </div>
      </div>
    </div>
  );
}
