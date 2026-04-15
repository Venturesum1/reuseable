import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, Package, MapPin, User, Phone, Mail, Home, Building, MapPinned, Globe } from "lucide-react";
import { motion } from "framer-motion";

const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "UAE"];

export default function OrderForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const initialQty = (location.state as any)?.quantity || 1;
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", address: "", landmark: "", city: "", state: "", pincode: "", country: "India",
  });

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const totalPrice = product ? Number(product.price) * quantity : 0;
  const maxQty = product?.stock || 1;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (!form.phone.trim() || form.phone.trim().length < 10) errs.phone = "Valid phone number required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim() || form.pincode.trim().length < 5) errs.pincode = "Valid pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !product) return;
    setLoading(true);

    const fullAddress = form.landmark ? `${form.address}, ${form.landmark}` : form.address;

    const { data, error } = await supabase.from("orders").insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      address: fullAddress,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
      product_id: product.id,
      product_name: product.name,
      quantity,
      total_price: totalPrice,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate(`/payment/${data.id}`, { state: { order: data, sourceUrl: product.source_url, product } });
    setLoading(false);
  };

  if (!product) return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
    </div>
  );

  const InputField = ({ icon: Icon, label, name, type = "text", required = true, placeholder }: any) => (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-purple-400" />
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={(form as any)[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`bg-[#1a1d2e] border-[#2a2d3e] text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all ${errors[name] ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
      />
      {errors[name] && <p className="text-xs text-red-400 mt-0.5">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-2xl py-8 px-4"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Shipping <span className="text-purple-400">Details</span></h1>
          <p className="text-gray-400 text-sm mt-1">Complete your shipping address to continue</p>
        </div>

        {/* Product Info Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-purple-300 font-medium">Product</p>
              <p className="font-semibold text-white">{product.name}</p>
              <p className="text-xs text-gray-400 font-mono">ID: {product.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Unit Price</p>
              <p className="text-lg font-bold text-yellow-400">₹{Number(product.price).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#2a2d3e] bg-[#151823] p-6 shadow-2xl"
        >
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-[#1a1d2e] border border-[#2a2d3e]">
            <div>
              <p className="text-sm text-gray-400">Quantity</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 border-[#2a2d3e] bg-[#0f1117] text-white hover:bg-purple-500/20 hover:border-purple-500/50" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-white text-lg">{quantity}</span>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 border-[#2a2d3e] bg-[#0f1117] text-white hover:bg-purple-500/20 hover:border-purple-500/50" disabled={quantity >= maxQty} onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-yellow-400">₹{totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Delivery Address</h2>
            </div>

            <InputField icon={User} label="Full Name" name="full_name" placeholder="Enter your full name" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField icon={Phone} label="Mobile Number" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" />
              <InputField icon={Mail} label="Email Address" name="email" type="email" required={false} placeholder="your@email.com" />
            </div>

            <InputField icon={Home} label="House No. & Street" name="address" placeholder="House no, Building, Street" />
            <InputField icon={MapPinned} label="Landmark" name="landmark" required={false} placeholder="Near..." />

            <div className="grid grid-cols-2 gap-4">
              <InputField icon={Building} label="City" name="city" placeholder="City" />
              <InputField icon={Building} label="State" name="state" placeholder="State" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField icon={MapPin} label="Pincode" name="pincode" placeholder="XXXXXX" />
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-purple-400" />
                  Country <span className="text-red-400">*</span>
                </Label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#2a2d3e] bg-[#1a1d2e] px-3 py-2 text-sm text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Continue to Payment →
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
