import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { 
  X, ShoppingBag, Plus, Minus, Trash2, 
  CreditCard, Loader2, CheckCircle2, ChevronRight 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    addToCart, 
    removeFromCart, 
    removeItem, 
    clearCart, 
    cartTotal 
  } = useCart()

  const navigate = useNavigate()
  const [checkoutStep, setCheckoutStep] = useState("idle") // "idle" | "processing" | "success"

  // Simple fee constants
  const deliveryFee = cartTotal > 0 ? 3.99 : 0
  const serviceFee = cartTotal > 0 ? 1.50 : 0
  const finalTotal = cartTotal + deliveryFee + serviceFee

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setIsCartOpen(false)
    navigate('/checkout')
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      
      {/* 1. Dark Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => checkoutStep !== "processing" && setIsCartOpen(false)}
      />

      {/* 2. Slide Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 ease-out transform translate-x-0 border-l border-gray-100">
        
        {/* Header Block */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-left">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="text-orange-500" size={20} />
            <h2 className="text-lg font-black tracking-tight text-gray-900">Your Gourmet Tray</h2>
          </div>
          <button 
            disabled={checkoutStep === "processing"}
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Inner Body */}
        {checkoutStep === "processing" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="animate-spin text-orange-500 stroke-[3]" size={48} />
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-gray-900 text-lg">Authorizing Order...</h3>
              <p className="text-xs text-gray-500 font-semibold">Basting, prepping, and registering with local chefs.</p>
            </div>
          </div>
        ) : checkoutStep === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 animate-fade-in text-center">
            <div className="bg-emerald-100/80 p-4 rounded-full text-emerald-500">
              <CheckCircle2 size={56} className="stroke-[2.5] animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-gray-900 text-xl">Culinary Order Placed!</h3>
              <p className="text-sm text-gray-500 font-semibold max-w-xs mx-auto leading-relaxed">
                Your payment cleared successfully. Chefs are heating up the stoves right now!
              </p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="bg-orange-50 p-4 rounded-full text-orange-500">
              <ShoppingBag size={40} className="stroke-[1.8]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base">Tray is Empty</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-xs">
                Explore local culinary listings to load up your dinner order.
              </p>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-md cursor-pointer"
            >
              Browse Gourmet Kitchens
            </button>
          </div>
        ) : (
          /* Cart List scroll container */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/60 shadow-sm relative group"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Column */}
                <div className="flex-1 space-y-2">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-gray-900 text-sm leading-tight pr-6 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-orange-600 font-black">${item.price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity selector row */}
                  <div className="flex items-center gap-3 bg-white border border-gray-200/50 rounded-xl px-2.5 py-1 w-max">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-orange-500 transition p-0.5 cursor-pointer"
                    >
                      <Minus size={12} className="stroke-[3]" />
                    </button>
                    <span className="font-black text-xs text-gray-900 min-w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="text-gray-500 hover:text-orange-500 transition p-0.5 cursor-pointer"
                    >
                      <Plus size={12} className="stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Hard Delete Trash Button */}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Footer Payment Panel */}
        {cartItems.length > 0 && checkoutStep === "idle" && (
          <div className="p-6 border-t border-gray-100 bg-white space-y-6 text-left">
            {/* Calculation summary block */}
            <div className="bg-[#fafaf8]/80 p-5 rounded-2xl border border-gray-100/50 space-y-3 font-semibold text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gourmet Delivery Fee</span>
                <span className="text-gray-900 font-bold">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Service Fee</span>
                <span className="text-gray-900 font-bold">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="h-[1px] bg-gray-200 my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900">Total Price</span>
                <span className="text-orange-600 font-black">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit checkout CTA button */}
            <button 
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-4 rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <CreditCard size={15} />
              <span>Place Culinary Order</span>
              <ChevronRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        )}

      </div>

    </div>
  )
}
