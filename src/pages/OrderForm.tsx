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

type FieldProps = {
  icon: any;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// IMPORTANT: defined OUTSIDE the component to keep stable identity across renders
// (otherwise inputs lose focus after every keystroke).
const Field = ({ icon: Icon, label, name, type = "text", required = true, placeholder, value, error, onChange }: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={name} className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-cyan-600" />
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-white border-2 text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-all ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200 focus:border-cyan-500'}`}
    />
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex justify-center py-40"><Loader2 className="h-8 w-8 animate-spin text-cyan-600" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-2xl py-8 px-4"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping <span className="text-cyan-700">Details</span></h1>
          <p className="text-gray-700 text-sm mt-1">Complete your shipping address to continue</p>
        </div>

        {/* Product Info Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-cyan-100 p-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
              <Package className="h-6 w-6 text-cyan-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-cyan-700 font-medium">Product</p>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-600 font-mono">ID: {product.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-700">Unit Price</p>
              <p className="text-lg font-bold text-yellow-600">₹{Number(product.price).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border-2 border-white bg-white p-6 shadow-2xl"
        >
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-cyan-50 border-2 border-cyan-200">
            <div>
              <p className="text-sm text-gray-700 font-medium">Quantity</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-100" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-gray-900 text-lg">{quantity}</span>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-100" disabled={quantity >= maxQty} onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-yellow-600">₹{totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Delivery Address</h2>
            </div>

            <Field icon={User} label="Full Name" name="full_name" placeholder="Enter your full name" value={form.full_name} error={errors.full_name} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field icon={Phone} label="Mobile Number" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} error={errors.phone} onChange={handleChange} />
              <Field icon={Mail} label="Email Address" name="email" type="email" required={false} placeholder="your@email.com" value={form.email} error={errors.email} onChange={handleChange} />
            </div>

            <Field icon={Home} label="House No. & Street" name="address" placeholder="House no, Building, Street" value={form.address} error={errors.address} onChange={handleChange} />
            <Field icon={MapPinned} label="Landmark" name="landmark" required={false} placeholder="Near..." value={form.landmark} error={errors.landmark} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-4">
              <Field icon={Building} label="City" name="city" placeholder="City" value={form.city} error={errors.city} onChange={handleChange} />
              <Field icon={Building} label="State" name="state" placeholder="State" value={form.state} error={errors.state} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field icon={MapPin} label="Pincode" name="pincode" placeholder="XXXXXX" value={form.pincode} error={errors.pincode} onChange={handleChange} />
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-cyan-600" />
                  Country <span className="text-red-500">*</span>
                </Label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 h-12 text-base font-bold bg-gradient-to-r from-yellow-400 to-cyan-500 hover:from-yellow-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-400/40 hover:shadow-cyan-500/60 transition-all duration-300"
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
