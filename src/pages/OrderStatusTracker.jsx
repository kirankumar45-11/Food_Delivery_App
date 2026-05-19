import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ClipboardCheck, ChefHat, Truck, CheckCircle2, 
  MapPin, CreditCard, Clock, Sparkles, Receipt, RefreshCw,
  Flame, ChevronRight, MessageSquare, ShieldCheck, AlertCircle
} from 'lucide-react'

// Stepper Configuration
const STAGES = [
  { 
    key: 'Pending', 
    label: 'Order Placed', 
    description: 'Trays received and verified by kitchen', 
    icon: ClipboardCheck,
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10 border-orange-500/25',
    estimateMin: 35
  },
  { 
    key: 'Preparing', 
    label: 'Preparing', 
    description: 'Chefs are crafting your gourmet meal', 
    icon: Flame, 
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10 border-amber-500/25',
    estimateMin: 20
  },
  { 
    key: 'Delivering', 
    label: 'Out for Delivery', 
    description: 'Courier speedrunning to your door', 
    icon: Truck, 
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10 border-blue-500/25',
    estimateMin: 10
  },
  { 
    key: 'Delivered', 
    label: 'Delivered', 
    description: 'Culinary perfection has arrived!', 
    icon: CheckCircle2, 
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10 border-emerald-500/25',
    estimateMin: 0
  }
]

export default function OrderStatusTracker() {
  const { order_id } = useParams()
  const navigate = useNavigate()
  
  const [currentUser, setCurrentUser] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Load user
  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      setCurrentUser(JSON.parse(userString))
    }
  }, [])

  // Poll database or simulate state
  useEffect(() => {
    let intervalId;
    const isMockId = order_id && order_id.startsWith('offline-')

    const fetchOrder = async () => {
      if (isMockId) {
        setupOfflineMock()
        return
      }

      try {
        const token = localStorage.getItem('accessToken')
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const res = await fetch(`http://localhost:8000/api/orders/${order_id}`, {
          headers: headers
        })
        if (!res.ok) {
          throw new Error('Order not found in database')
        }
        const data = await res.json()
        setOrder(data)
        setIsOfflineMode(false)

        // Find match in our stages
        const stageIndex = STAGES.findIndex(s => s.key === data.status)
        if (stageIndex !== -1) {
          setCurrentStageIndex(stageIndex)
        } else if (data.status === 'Rejected') {
          // Keep at current index but we can show a rejection message
          setCurrentStageIndex(0)
        }
        setLoading(false)
      } catch (err) {
        console.warn("FastAPI fetching error, falling back to simulated tracker mode:", err)
        setIsOfflineMode(true)
        setupOfflineMock()
      }
    }

    const setupOfflineMock = () => {
      // Create a nice mock order locally
      const storedCart = localStorage.getItem('lastCheckedOutCart')
      let items = []
      let total = 42.99

      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        items = parsed.items || []
        total = parsed.total || 42.99
      } else {
        // Fallback default mock items
        items = [
          { name: "Herb Butter Grilled Steak", price: 34.50, quantity: 1 },
          { name: "Decadent Chocolate Lava Fondant", price: 9.50, quantity: 1 }
        ]
        total = 49.68
      }

      setOrder({
        id: order_id || "1024",
        customer_email: currentUser?.email || "customer@biteswift.com",
        delivery_address: "742 Evergreen Terrace, Springfield",
        payment_method: "Credit Card",
        total_price: total,
        status: STAGES[currentStageIndex]?.key || "Pending",
        items: items
      })
      setLoading(false)
    }

    // Initial fetch
    fetchOrder()

    // Poll every 3 seconds if online, or simulate if offline
    if (!isMockId) {
      intervalId = setInterval(fetchOrder, 3000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [order_id, currentStageIndex, currentUser])

  // Local state update when index changes in offline simulation
  useEffect(() => {
    if (isOfflineMode && order) {
      setOrder(prev => ({
        ...prev,
        status: STAGES[currentStageIndex].key
      }))
    }
  }, [currentStageIndex, isOfflineMode])

  // Timer simulation for offline demo mode
  useEffect(() => {
    let timerId;
    if (isOfflineMode) {
      timerId = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1
          // Advance stage every 20 seconds automatically
          if (next >= 20) {
            setCurrentStageIndex(curr => {
              if (curr < STAGES.length - 1) {
                return curr + 1
              }
              return curr
            })
            return 0
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [isOfflineMode])

  // Fast forward trigger for demo convenience
  const handleFastForward = () => {
    setCurrentStageIndex(curr => {
      if (curr < STAGES.length - 1) {
        return curr + 1
      }
      return curr
    })
    setElapsedSeconds(0)
  }

  // Restart demo sequence
  const handleResetDemo = () => {
    setCurrentStageIndex(0)
    setElapsedSeconds(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-semibold">Tuning tracking radar...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-xl font-extrabold">Order Not Found</h2>
        <button onClick={() => navigate('/customer-dashboard')} className="bg-orange-500 text-white px-6 py-3.5 rounded-2xl font-bold">
          Return to Dashboard
        </button>
      </div>
    )
  }

  const currentStage = STAGES[currentStageIndex]
  const activePercent = (currentStageIndex / (STAGES.length - 1)) * 100
  const orderNumber = order_id && !order_id.startsWith('offline') ? `#${order_id}` : `#BS-${order.id}`

  // Parse restaurant name out of item prefix or use fallback
  const firstItem = order.items[0]?.name || ""
  const restaurantName = firstItem.includes(" - ") ? firstItem.split(" - ")[0] : "BiteSwift Gourmet Kitchen"

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 pb-16 overflow-x-hidden">
      
      {/* Navbar header */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40 shadow-sm shadow-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-orange-500 transition bg-gray-50 hover:bg-orange-50 px-4 py-2.5 rounded-xl border border-gray-200/50 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Customer Dashboard</span>
          </button>

          <span className="text-lg font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Order Status radar
          </span>

          <div className="w-32 text-right">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-600 font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {order.status === 'Rejected' ? 'Cancelled' : order.status}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Grid Wrapper */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Offline Simulation Notification Banner */}
        {isOfflineMode && (
          <div className="bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-950 border border-gray-800 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                <Sparkles size={10} className="animate-spin [animation-duration:8s]" />
                <span>Simulated Tracking Mode</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-100">Testing & Demonstration Console</h3>
              <p className="text-xs text-gray-400 font-medium">
                The database API is currently offline. Order lifecycle status advances automatically (every 20s). Use fast-forward for convenience.
              </p>
            </div>
            <div className="flex gap-2 relative z-10 shrink-0">
              <button 
                onClick={handleFastForward}
                disabled={currentStageIndex === STAGES.length - 1}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                Fast-Forward Stage
              </button>
              <button 
                onClick={handleResetDemo}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Restart Demo
              </button>
            </div>
          </div>
        )}

        {/* Live Stepper & Estimated Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* LEFT: Tracker Visuals & Steps */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Stepper Core Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Tracking Reference</p>
                  <h1 className="text-2xl font-black text-gray-900 mt-0.5">Order {orderNumber}</h1>
                  <p className="text-xs text-orange-500 font-bold mt-0.5">from {restaurantName}</p>
                </div>
                
                {/* Dynamically calculate time remaining */}
                {order.status !== 'Rejected' && (
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3 shrink-0">
                    <Clock className="text-orange-500 stroke-[2.5]" size={24} />
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
                      <p className="text-lg font-black text-gray-900 leading-none mt-0.5">
                        {currentStage.estimateMin > 0 ? `~${currentStage.estimateMin} mins` : 'Arrived!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphical Visual Timeline */}
              {order.status === 'Rejected' ? (
                <div className="bg-red-50/50 border border-red-100 text-red-600 rounded-3xl p-6 flex items-center gap-4 text-sm font-semibold">
                  <div className="bg-red-100 p-3 rounded-2xl text-red-500">
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-red-900 text-base">Gourmet Ticket Declined</h3>
                    <p className="text-xs text-red-500 font-semibold leading-relaxed mt-0.5">
                      The restaurant declined or cancelled this culinary request. Please contact support or place a new checkout order.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  
                  {/* Stepper Progress bar visual */}
                  <div className="relative pt-2">
                    
                    {/* Background line connector */}
                    <div className="absolute top-[28px] left-[20px] right-[20px] h-1.5 bg-gray-100 rounded-full" />
                    
                    {/* Active foreground gradient line connector */}
                    <div 
                      className="absolute top-[28px] left-[20px] h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${activePercent}%` }}
                    />
                    
                    {/* Interactive dots rows */}
                    <div className="relative flex justify-between">
                      {STAGES.map((stage, idx) => {
                        const Icon = stage.icon
                        const isCompleted = idx < currentStageIndex
                        const isActive = idx === currentStageIndex
                        const isFuture = idx > currentStageIndex

                        return (
                          <div key={idx} className="flex flex-col items-center relative z-10 group">
                            
                            {/* Outer Bubble dot */}
                            <div 
                              className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isCompleted 
                                  ? 'border-orange-500 bg-orange-500 text-white shadow-md' 
                                  : isActive 
                                  ? 'border-orange-500 bg-white text-orange-500 shadow-lg scale-110 ring-4 ring-orange-500/10'
                                  : 'border-gray-200 bg-white text-gray-400'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={20} className="stroke-[2.5]" />
                              ) : (
                                <Icon size={20} className={`stroke-[2] ${isActive ? 'animate-pulse' : ''}`} />
                              )}
                            </div>
                            
                            {/* Floating labels */}
                            <span 
                              className={`text-[10px] sm:text-xs font-extrabold mt-3.5 transition-colors duration-200 ${
                                isActive ? 'text-orange-600' : isCompleted ? 'text-gray-900 font-bold' : 'text-gray-400'
                              }`}
                            >
                              {stage.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Highlight current state description card */}
                  <div className="bg-[#fafaf8] p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${currentStage.bgClass} shrink-0`}>
                      <currentStage.icon className={`h-6 w-6 ${currentStage.colorClass} ${currentStageIndex !== 3 ? 'animate-pulse' : ''}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider">Status Update</span>
                      <h3 className="font-extrabold text-sm text-gray-900">{currentStage.label}</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{currentStage.description}</p>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Courier Delivery Details card */}
            {order.status !== 'Rejected' && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-black text-gray-900 text-base">Delivery Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="flex gap-3">
                    <div className="bg-orange-50 border border-orange-100/50 p-2.5 h-10 w-10 rounded-xl text-orange-500 flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dropoff Coordinates</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 leading-relaxed">{order.delivery_address}</p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex gap-3">
                    <div className="bg-orange-50 border border-orange-100/50 p-2.5 h-10 w-10 rounded-xl text-orange-500 flex items-center justify-center shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</p>
                      <p className="text-xs font-bold text-gray-800 mt-1">{order.payment_method}</p>
                      <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">Secure Transaction</p>
                    </div>
                  </div>
                </div>

                {/* Simulated courier mapping tracker (Wow factor) */}
                {currentStageIndex >= 1 && currentStageIndex <= 2 && (
                  <div className="bg-[#fafaf8] border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs animate-bounce">
                          🏍️
                        </div>
                        <span className="absolute -top-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white animate-ping" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-900">Courier Dispatched</p>
                        <p className="text-[10px] text-gray-500 font-semibold">BiteSwift Driver is en route to restaurant</p>
                      </div>
                    </div>
                    
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm">
                      <MessageSquare size={12} />
                      <span>Chat with Driver</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT: Receipt / Checkout Items summary */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="text-gray-400 shrink-0" size={18} />
                  <h3 className="font-extrabold text-gray-900 text-base">Receipt Summary</h3>
                </div>
                <span className="text-[10px] bg-gray-50 border border-gray-200 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                  Paid
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      {/* Clean name without restaurant prefix */}
                      <p className="font-bold text-xs text-gray-900 line-clamp-1 leading-snug">
                        {item.name.includes(" - ") ? item.name.split(" - ")[1] : item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-xs text-gray-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Billing Breakdowns */}
              <div className="bg-[#fafaf8] p-4 rounded-2xl border border-gray-100 space-y-2.5 font-semibold text-[11px] text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Tray Subtotal</span>
                  <span className="text-gray-900 font-bold">${(order.total_price * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Coordinate Fee</span>
                  <span className="text-gray-900 font-bold">$3.99</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kitchen Service Fee</span>
                  <span className="text-gray-900 font-bold">$1.50</span>
                </div>
                <div className="h-[1px] bg-gray-200 my-2" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900">Total Price Paid</span>
                  <span className="text-orange-600 font-black text-sm">${order.total_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-extrabold uppercase tracking-wide bg-emerald-500/5 border border-emerald-500/10 py-2.5 rounded-xl">
                <ShieldCheck className="text-emerald-500 shrink-0" size={14} />
                <span>Verified BiteSwift Invoice</span>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
