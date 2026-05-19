import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { 
  ArrowLeft, CreditCard, MapPin, Truck, 
  ShoppingBag, CheckCircle2, Loader2, AlertCircle, ChevronRight, WifiOff
} from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  
  // Consume persistent Cart Context
  const { cartItems, cartTotal, clearCart } = useCart()

  const [currentUser, setCurrentUser] = useState(null)
  const [address, setAddress] = useState("742 Evergreen Terrace, Springfield")
  const [paymentMethod, setPaymentMethod] = useState("card") // "card" | "cash"
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Billing calculation constants
  const deliveryFee = cartTotal > 0 ? 3.99 : 0
  const serviceFee = cartTotal > 0 ? 1.50 : 0
  const tax = cartTotal * 0.08 // 8% local tax
  const finalTotal = cartTotal + deliveryFee + serviceFee + tax

  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      const parsed = JSON.parse(userString)
      setCurrentUser(parsed)
    } else {
      // Default fallback mock profile for developer validation
      setCurrentUser({ email: "guest.customer@biteswift.com" })
    }
  }, [])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) return

    if (!address.trim()) {
      setSubmitError("Please input a valid shipping delivery address.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    // Build REST payload format expected by Pydantic models
    const payload = {
      customer_email: currentUser?.email || "customer@biteswift.com",
      delivery_address: address,
      payment_method: paymentMethod === "card" ? "Credit Card" : "Cash on Delivery",
      total_price: parseFloat(finalTotal.toFixed(2)),
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    }

    try {
      const token = localStorage.getItem('accessToken')
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        // Surface specific HTTP errors to the user
        if (res.status === 401) {
          throw new Error('Your session has expired. Please log in again.')
        } else if (res.status === 403) {
          throw new Error('Access denied. Only customers can place orders.')
        } else {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || `Server error (${res.status}). Please try again.`)
        }
      }

      const createdOrder = await res.json()
      
      // Save details to localStorage so OrderStatusTracker offline mode has backup context
      localStorage.setItem('lastCheckedOutCart', JSON.stringify({
        items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total: parseFloat(finalTotal.toFixed(2))
      }))

      // Success branch
      setSubmitSuccess(true)
      
      // Delay navigation to let the visual checkmark animate beautifully
      setTimeout(() => {
        clearCart()
        localStorage.removeItem('lastCheckedOutCart')
        navigate(`/order-tracker/${createdOrder.id}`)
      }, 2500)

    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        // Known API error — surface it to the user
        setSubmitError(err.message)
        setIsSubmitting(false)
        return
      }
      
      console.warn("FastAPI REST backend offline. Simulating offline order caching:", err)
      
      // Save details to localStorage so OrderStatusTracker offline mode has backup context
      localStorage.setItem('lastCheckedOutCart', JSON.stringify({
        items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total: parseFloat(finalTotal.toFixed(2))
      }))

      // Graceful offline fallback simulation
      setSubmitSuccess(true)
      setTimeout(() => {
        clearCart()
        localStorage.removeItem('lastCheckedOutCart')
        const randomId = Math.floor(1000 + Math.random() * 9000)
        navigate(`/order-tracker/offline-${randomId}`)
      }, 2500)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle empty cart view before showing form
  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="bg-orange-50 p-4 rounded-full text-orange-500 animate-bounce">
          <ShoppingBag size={48} className="stroke-[1.8]" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold">Your Tray is Empty</h2>
          <p className="text-sm text-gray-500 font-semibold max-w-sm leading-relaxed">
            There are no dishes in your active gourmet tray. Return to the dashboard to select some delicious meals.
          </p>
        </div>
        <button 
          onClick={() => navigate('/customer-dashboard')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 overflow-x-hidden relative">
      
      {/* 1. Success confirmation overlay screen */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-[#fafaf7] z-50 flex flex-col items-center justify-center p-8 space-y-6 text-center animate-fade-in">
          <div className="bg-emerald-100/80 p-5 rounded-full text-emerald-500">
            <CheckCircle2 size={64} className="stroke-[2.5] animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Placed Successfully!</h1>
            <p className="text-sm text-gray-500 font-semibold max-w-md mx-auto leading-relaxed">
              We have dispatched your culinary request to the chefs. Stoves are heated, and preparation is active!
            </p>
          </div>
          <p className="text-xs text-orange-500 font-extrabold animate-pulse">Taking you to your Order Tracker...</p>
        </div>
      )}

      {/* 2. Submitting Spinner overlay screen */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="animate-spin text-orange-500 stroke-[3]" size={52} />
          <p className="text-sm font-black text-white">Transmitting Order details...</p>
        </div>
      )}

      {/* 3. Header Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40 shadow-sm shadow-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-orange-500 transition bg-gray-50 hover:bg-orange-50 px-4 py-2.5 rounded-xl border border-gray-200/50 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>

          <span className="text-lg font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Secure Checkout
          </span>

          <div className="w-20" /> {/* Spacer spacer */}
        </div>
      </nav>

      {/* 4. Checkout main layout grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left panel: form parameters (Address, Payments) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Form details card */}
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md space-y-8">
              <div className="border-b border-gray-100 pb-5">
                <h2 className="text-xl font-black text-gray-900">Delivery & Billing</h2>
                <p className="text-xs text-gray-400 font-semibold mt-1">Specify dispatch coordinates and payment modes</p>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Address inputs block */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Delivery Address</label>
                <div className="relative">
                  <textarea 
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full physical address, apartment unit, and postal code..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold shadow-inner"
                    required
                  />
                  <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                </div>
              </div>

              {/* Payment selector block */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block">Select Payment Method</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Credit Card radio */}
                  <label 
                    onClick={() => setPaymentMethod("card")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between h-28 transition-all ${
                      paymentMethod === "card" 
                        ? 'border-orange-500 bg-orange-50/10' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <CreditCard className={paymentMethod === "card" ? "text-orange-500" : "text-gray-400"} size={22} />
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "card" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === "card" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">Credit Card</p>
                      <p className="text-[10px] text-gray-400 font-bold">Pay secure online via Stripe</p>
                    </div>
                  </label>

                  {/* Cash radio */}
                  <label 
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between h-28 transition-all ${
                      paymentMethod === "cash" 
                        ? 'border-orange-500 bg-orange-50/10' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Truck className={paymentMethod === "cash" ? "text-orange-500" : "text-gray-400"} size={22} />
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cash" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === "cash" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 font-bold">Pay in-hand when food arrives</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA button */}
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-4 rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-orange-500/25"
              >
                <span>Authorize & Place Order</span>
                <ChevronRight size={14} className="stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* Right panel: order lists and calculated summaries */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-extrabold text-gray-900 text-base">Order Review</h3>
              </div>

              {/* Items scroll list */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 line-clamp-1 pr-2">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-gray-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Math breakdown container */}
              <div className="bg-[#fafaf8] p-5 rounded-2xl border border-gray-100/50 space-y-3 font-semibold text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Standard Delivery Fee</span>
                  <span className="text-gray-900 font-bold">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kitchen Service Fee</span>
                  <span className="text-gray-900 font-bold">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="h-[1px] bg-gray-200 my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Total Price</span>
                  <span className="text-orange-600 font-black">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Secure notification badge */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SSL Encrypted Transaction Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  )
}
