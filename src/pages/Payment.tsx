import { useLocation, useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle } from "lucide-react";

export default function Payment() {
  const { orderId } = useParams();
  const location = useLocation();
  const { order, sourceUrl } = (location.state || {}) as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-16 text-center">
        <div className="rounded-xl border border-border/50 bg-card p-8 shadow-soft">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-mint" />
          <h1 className="font-display text-2xl font-bold text-foreground">Order Placed!</h1>
          <p className="mt-2 text-muted-foreground">
            Order <span className="font-mono text-sm text-foreground">#{orderId?.slice(0, 8)}</span> has been saved.
          </p>

          {order && (
            <div className="mt-6 space-y-1 text-left text-sm">
              <p><span className="text-muted-foreground">Product:</span> <span className="text-foreground">{order.product_name}</span></p>
              <p><span className="text-muted-foreground">Total:</span> <span className="font-bold text-primary">₹{Number(order.total_price).toLocaleString()}</span></p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {sourceUrl ? (
              <Button asChild size="lg" className="w-full">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Proceed to Pay on Source Website
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Payment link not available. The admin will contact you for payment details.
              </p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
