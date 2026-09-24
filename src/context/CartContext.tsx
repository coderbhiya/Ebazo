'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, validateCoupon } from '@/lib/api';
import { loadSiteSettings } from '@/lib/site-settings';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  // Admin-configured shipping rule, for "add ₹X more for free delivery" hints
  shippingRule: { fee: number; freeAbove: number };
  // Coupon from Admin > Coupons, validated by the server (the order endpoint re-checks it)
  couponCode: string;
  couponDiscount: number;
  couponMessage: string;
  couponValid: boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Admin-configurable shipping (Admin > Settings > Shipping). Defaults to free shipping
  // until settings load, so the storefront never briefly shows a fee that isn't intended.
  const [shippingRule, setShippingRule] = useState({ fee: 0, freeAbove: 0 });
  // Don't write to localStorage until the saved cart has been read, otherwise the initial
  // empty state overwrites it (React Strict Mode's double effect run wiped the cart on reload).
  const [hydrated, setHydrated] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponValid, setCouponValid] = useState(false);

  // Load admin-configured shipping settings
  useEffect(() => {
    let cancelled = false;
    loadSiteSettings()
      .then((s) => {
        if (cancelled) return;
        const fee = Number(s.shipping_fee ?? 0) || 0;
        const freeAbove = Number(s.free_shipping_threshold ?? 0) || 0;
        setShippingRule({ fee, freeAbove });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('ebanzo_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('ebanzo_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedCoupon = localStorage.getItem('ebanzo_coupon');
      if (savedCoupon) setCouponCode(savedCoupon);
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    setHydrated(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('ebanzo_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('ebanzo_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (couponCode) localStorage.setItem('ebanzo_coupon', couponCode);
      else localStorage.removeItem('ebanzo_coupon');
    } catch {}
  }, [couponCode, hydrated]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Re-check the coupon whenever the cart total changes (min spend / % discount depend on it)
  useEffect(() => {
    if (!hydrated || !couponCode) return;
    if (subtotal === 0) {
      setCouponDiscount(0);
      setCouponValid(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await validateCoupon(couponCode, subtotal);
      if (cancelled) return;
      setCouponValid(r.ok);
      setCouponDiscount(r.ok ? r.discount || 0 : 0);
      setCouponMessage(r.message);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [couponCode, subtotal, hydrated]);

  const applyCoupon = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;
    const r = await validateCoupon(clean, subtotal);
    setCouponMessage(r.message);
    if (r.ok) {
      setCouponCode(r.code || clean);
      setCouponDiscount(r.discount || 0);
      setCouponValid(true);
    }
    return r.ok;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponValid(false);
    setCouponMessage('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}-${newItem.shape}-${newItem.customPhotoUrl || 'default'}-${Date.now()}`;
    setCart((prev) => {
      // Only plain (non-personalised) items merge into an existing line. Personalised items
      // (multi-photo sets, dual-side, artwork, text) always get their own line — merging them
      // used to drop the second customer's photos. Variation must match too.
      const isPlain = (i: Omit<CartItem, 'id'>) =>
        !i.customPhotoUrl && !i.printReadyArtworkUrl && !i.frontPhotoUrl && !i.backPhotoUrl &&
        !i.multiImages?.length && !i.customText;
      const existingIdx = isPlain(newItem)
        ? prev.findIndex(
            (i) =>
              isPlain(i) &&
              i.productId === newItem.productId &&
              i.shape === newItem.shape &&
              i.variationId === newItem.variationId &&
              i.setOption === newItem.setOption &&
              i.printType === newItem.printType
          )
        : -1;
      if (existingIdx > -1) {
        return prev.map((i, idx) => (idx === existingIdx ? { ...i, quantity: i.quantity + newItem.quantity } : i));
      }
      return [...prev, { ...newItem, id }];
    });
    showToast(`Added "${newItem.title}" to your cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  // After an order: the coupon was used on it, so it doesn't carry over to the next cart
  const clearCart = () => {
    setCart([]);
    removeCoupon();
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from your wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist! ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  const shippingFee =
    subtotal === 0 || shippingRule.fee === 0 || (shippingRule.freeAbove > 0 && subtotal >= shippingRule.freeAbove)
      ? 0
      : shippingRule.fee;
  const discount = couponValid ? Math.min(couponDiscount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingFee,
        total,
        shippingRule,
        couponCode,
        couponDiscount: discount,
        couponMessage,
        couponValid,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl ring-1 ring-white/10 animate-bounce">
          <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-ping" />
          {toastMessage}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
