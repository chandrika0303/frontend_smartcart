import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ArrowLeft, 
  CheckCircle2, Tag, ShieldCheck, Truck, CreditCard, Sparkles, ShoppingBag
} from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Aura Sound Pro Wireless',
    category: 'Audio',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    tag: 'Bestseller'
  },
  {
    id: 2,
    name: 'Minimal Chrono Watch',
    category: 'Accessories',
    price: 149.00,
    originalPrice: 180.00,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    tag: 'Popular'
  },
  {
    id: 3,
    name: 'Ultra-Glide Ergonomic Mouse',
    category: 'Tech',
    price: 79.50,
    originalPrice: 99.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    tag: 'Sale'
  },
  {
    id: 4,
    name: 'Horizon Smart Band 5',
    category: 'Wearables',
    price: 59.99,
    originalPrice: 89.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
    tag: 'New'
  },
  {
    id: 5,
    name: 'Nomad Canvas Backpack',
    category: 'Apparel',
    price: 89.00,
    originalPrice: 110.00,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    tag: 'Limited'
  },
  {
    id: 6,
    name: 'Mechanical RGB Keyboard',
    category: 'Tech',
    price: 129.00,
    originalPrice: 159.00,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    tag: 'Top Rated'
  }
];

const COUPONS = {
  'CART10': { type: 'percent', value: 10, label: '10% OFF' },
  'SAVE25': { type: 'fixed', value: 25, label: '$25 OFF' },
  'FREESHIP': { type: 'shipping', value: 0, label: 'Free Express Shipping' }
};

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 15.00;
const TAX_RATE = 0.08;

export default function App() {
  const [currentView, setCurrentView] = useState('catalog');
  const [cart, setCart] = useState([
    { ...PRODUCTS[0], quantity: 1 },
    { ...PRODUCTS[2], quantity: 1 }
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);

  const [formData, setFormData] = useState({
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    zip: '97477',
    paymentMethod: 'card'
  });

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') return (subtotal * appliedCoupon.value) / 100;
    if (appliedCoupon.type === 'fixed') return Math.min(appliedCoupon.value, subtotal);
    return 0;
  }, [subtotal, appliedCoupon]);

  const shipping = useMemo(() => {
    if (cart.length === 0) return 0;
    if (appliedCoupon?.type === 'shipping') return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  }, [subtotal, appliedCoupon, cart.length]);

  const tax = useMemo(() => {
    return Math.max(0, (subtotal - discount)) * TAX_RATE;
  }, [subtotal, discount]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount) + shipping + tax;
  }, [subtotal, discount, shipping, tax]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const applyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    if (COUPONS[code]) {
      setAppliedCoupon({ code, ...COUPONS[code] });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try CART10 or SAVE25');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const orderDetails = {
      orderId: 'CP-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      customer: { ...formData },
      pricing: { subtotal, discount, shipping, tax, total }
    };
    setLastOrder(orderDetails);
    setCart([]);
    setAppliedCoupon(null);
    setCurrentView('confirmation');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                CartPulse
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase -mt-1 font-semibold">Smart Checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'catalog' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Featured Gear & Accessories</h1>
              <p className="text-slate-500 mt-1">Smart products ready for high-speed checkout testing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-700 shadow-sm border border-slate-100">
                        {product.tag}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs font-medium text-indigo-600 mb-1">{product.category}</div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{product.name}</h3>
                      <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                        ★ {product.rating} <span className="text-slate-300">•</span> Verified
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                          <span className="text-xs text-slate-400 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                        </div>

                        {inCart ? (
                          <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-xl px-2 py-1 gap-2">
                            <button 
                              onClick={() => updateQuantity(product.id, -1)}
                              className="text-indigo-700 hover:text-indigo-900 p-0.5"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-indigo-950 min-w-4 text-center">{inCart.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(product.id, 1)}
                              className="text-indigo-700 hover:text-indigo-900 p-0.5"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-4 h-4" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'checkout' && (
          <div>
            <button 
              onClick={() => setCurrentView('catalog')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" /> Shipping & Customer Details
                </h2>

                <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                    <input 
                      required
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input 
                        required
                        type="text" 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP / Postal Code</label>
                      <input 
                        required
                        type="text" 
                        value={formData.zip} 
                        onChange={e => setFormData({...formData, zip: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Simulation
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-medium transition ${formData.paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' : 'border-slate-200'}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={formData.paymentMethod === 'card'} 
                          onChange={() => setFormData({...formData, paymentMethod: 'card'})}
                          className="text-indigo-600"
                        />
                        Credit / Debit Card
                      </label>
                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-medium transition ${formData.paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' : 'border-slate-200'}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={formData.paymentMethod === 'cod'} 
                          onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                          className="text-indigo-600"
                        />
                        Cash on Delivery
                      </label>
                    </div>

                    {formData.paymentMethod === 'card' && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <input 
                          disabled 
                          value="4242 •••• •••• 4242" 
                          className="w-full bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" 
                        />
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> SSL 256-bit Secure Test Sandbox</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" /> Apply Coupon
                  </label>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-xs font-semibold text-emerald-800">
                        {appliedCoupon.code} ({appliedCoupon.label}) Applied!
                      </div>
                      <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. CART10, SAVE25"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => applyCoupon()}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
                      <div className="flex gap-2 pt-1">
                        {['CART10', 'SAVE25', 'FREESHIP'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => applyCoupon(preset)}
                            className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 cursor-pointer"
                          >
                            +{preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span className="text-xl text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={cart.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Pay ${total.toFixed(2)} & Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'confirmation' && lastOrder && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Order Confirmed!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Thank you for shopping with CartPulse. Order identifier: <strong className="text-slate-800 font-mono">{lastOrder.orderId}</strong>
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 my-6 text-left border border-slate-100 space-y-3">
              <div className="flex justify-between text-xs text-slate-400 uppercase font-semibold pb-2 border-b border-slate-200">
                <span>Shipping To</span>
                <span>Payment</span>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-bold text-slate-800">{lastOrder.customer.fullName}</p>
                  <p className="text-slate-500 text-xs">{lastOrder.customer.address}, {lastOrder.customer.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 capitalize">{lastOrder.customer.paymentMethod}</p>
                  <p className="text-slate-500 text-xs">Total: ${lastOrder.pricing.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mb-6 text-left">
              {lastOrder.items.map(item => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                  <span>{item.name} <strong className="text-slate-400 text-xs">× {item.quantity}</strong></span>
                  <span className="font-semibold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('catalog')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </main>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsDrawerOpen(false)} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900 text-lg">Your Cart ({totalItemsCount})</h2>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100 text-xs">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <span className="font-semibold text-indigo-700 flex items-center gap-1.5">
                    🎉 You've unlocked Free Express Shipping!
                  </span>
                ) : (
                  <div>
                    <span className="text-slate-600">
                      Add <strong className="text-indigo-600">${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)}</strong> more for <strong>Free Shipping</strong>
                    </span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
                    <p className="font-semibold text-slate-600">Your cart is empty</p>
                    <p className="text-xs mt-1">Add items from the store to proceed.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">${item.price.toFixed(2)} each</p>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <span className="font-bold text-sm text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 space-y-3 bg-slate-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900 text-base">${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Taxes and coupons calculated at checkout.</p>
                  
                  <button 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setCurrentView('checkout');
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}