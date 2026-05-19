import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { 
  ShoppingBag, LogOut, Search, MapPin, Star, Clock, 
  ChevronRight, Calendar, DollarSign, CheckCircle2, Truck 
} from 'lucide-react'
import { useCart } from '../context/CartContext'

// Curated dishes data for dashboard
const SUGGESTED_DISHES = [
  {
    id: 1,
    name: "Truffle Bacon Double Cheeseburger",
    restaurant: "Burger & Co.",
    price: 15.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Artisan Pepperoni & Honey Pizza",
    restaurant: "Pizzeria Bellina",
    price: 18.50,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Imperial Dragon Sushi Platter",
    restaurant: "Sakura Culinary",
    price: 24.00,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80"
  }
]

const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: "La Maison Parisienne",
    cuisine: "Gourmet French",
    rating: 4.9,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Pizzeria Bellina",
    cuisine: "Artisan Italian",
    rating: 4.8,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Sakura Culinary",
    cuisine: "Authentic Japanese",
    rating: 4.9,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Burger & Co.",
    cuisine: "American Bistro",
    rating: 4.7,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "El Taco Loco",
    cuisine: "Vibrant Mexican",
    rating: 4.6,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Tikka Express",
    cuisine: "Rich Indian",
    rating: 4.8,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1585938338392-50a5d22b143b?auto=format&fit=crop&w=500&q=80"
  }
]

const PAST_ORDERS = [
  {
    id: "BS-8930",
    date: "May 18, 2026",
    restaurant: "La Maison Parisienne",
    items: "1x Herb Butter Grilled Steak",
    price: 34.50,
    status: "Delivered"
  },
  {
    id: "BS-7629",
    date: "May 12, 2026",
    restaurant: "Burger & Co.",
    items: "2x Truffle Bacon Double Cheeseburger, 1x Waffle Fries",
    price: 38.48,
    status: "Delivered"
  },
  {
    id: "BS-5510",
    date: "May 05, 2026",
    restaurant: "Sakura Culinary",
    items: "1x Imperial Dragon Sushi Platter",
    price: 24.00,
    status: "Delivered"
  }
]

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [address, setAddress] = useState("742 Evergreen Terrace, Springfield")
  
  // Connect to persistent Cart context
  const { cartCount, toggleCart, addToCart, clearCart } = useCart()
  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Dynamic database restaurant listings state
  const [restaurants, setRestaurants] = useState([])
  const [isRestaurantsLoading, setIsRestaurantsLoading] = useState(true)
  const [restaurantsError, setRestaurantsError] = useState(null)

  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      setCurrentUser(JSON.parse(userString))
    }
  }, [])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!currentUser?.email) return
      setOrdersLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const res = await fetch(`http://localhost:8000/api/orders?customer_email=${currentUser.email}`, {
          headers: headers
        })
        if (!res.ok) {
          if (res.status === 401) {
            // Token expired - keep showing fallback
            throw new Error('Session expired')
          }
          throw new Error("Failed to fetch orders")
        }
        const data = await res.json()
        
        const formatted = data.map(order => {
          const firstItem = order.items[0]?.name || "Gourmet Dish"
          const restName = firstItem.includes(" - ") ? firstItem.split(" - ")[0] : "BiteSwift Gourmet"
          const cleanItemName = firstItem.includes(" - ") ? firstItem.split(" - ")[1] : firstItem
          
          let displayItems = `${order.items[0]?.quantity || 1}x ${cleanItemName}`
          if (order.items.length > 1) {
            displayItems += ` (+${order.items.length - 1} more items)`
          }

          return {
            id: `BS-${order.id}`,
            rawId: order.id,
            date: "Today",
            restaurant: restName,
            items: displayItems,
            price: order.total_price,
            status: order.status
          }
        })
        
        setRecentOrders(formatted)
      } catch (err) {
        console.warn("FastAPI offline, showing static fallback logs:", err)
        // Only show fallback if we have no data yet
        setRecentOrders(prev => prev.length === 0 ? PAST_ORDERS : prev)
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchRecentOrders()
  }, [currentUser])

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsRestaurantsLoading(true)
        const res = await fetch('http://localhost:8000/api/restaurants')
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        
        // Map database keys to camelCase keys expected by card component
        const formatted = data.map(item => ({
          id: item.id,
          name: item.name,
          cuisine: item.cuisine,
          rating: item.rating,
          deliveryTime: item.delivery_time,
          image: item.image
        }))
        setRestaurants(formatted)
        setRestaurantsError(null)
      } catch (err) {
        console.warn("FastAPI service unreachable, falling back to local MOCK_RESTAURANTS cache:", err)
        setRestaurants(MOCK_RESTAURANTS)
        setRestaurantsError("Offline Mode")
      } finally {
        setIsRestaurantsLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  const handleLogout = () => {
    clearCart()
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('cartItems')
    localStorage.removeItem('lastCheckedOutCart')
    navigate('/')
  }

  const handleOrderAgain = (restaurant, items, price) => {
    // Add to global cart context
    addToCart({
      id: `dish-${Math.floor(Math.random() * 100000)}`,
      name: `${restaurant} - ${items.replace(/^\d+x\s+/, '')}`,
      price: price,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
    })
    
    // Log in preparing order array
    const newOrder = {
      id: `BS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Today (Just ordered)",
      restaurant,
      items,
      price,
      status: "Preparing"
    }

    setRecentOrders(prev => [newOrder, ...prev])
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 overflow-x-hidden">
      
      {/* 1. Header Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40 shadow-sm shadow-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              BiteSwift
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Cart helper */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-orange-500 transition cursor-pointer bg-transparent border-0"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition bg-gray-50 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-gray-200/50 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Welcome Block */}
        <div className="bg-gradient-to-tr from-gray-900 to-gray-800 rounded-[32px] text-white p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="space-y-2 relative z-10 text-left">
            <span className="text-orange-500 uppercase tracking-widest text-xs font-extrabold">Browse Local Flavors</span>
            <h1 className="text-3xl md:text-4xl font-extrabold">Welcome back, {currentUser.fullName}!</h1>
            <p className="text-gray-400 font-semibold text-sm">What would you like to order today?</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 relative z-10 w-full md:w-auto">
            <MapPin className="text-orange-500 shrink-0" size={20} />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivering to</p>
              <p className="text-xs font-bold mt-0.5 text-gray-200">{address}</p>
            </div>
          </div>
        </div>

        {/* Categories / Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <input 
              type="text" 
              placeholder="Search dishes, cuisines, or restaurants..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>

          <div className="flex gap-2 max-w-full overflow-x-auto pb-1 scrollbar-none">
            {['⚡ Fast Delivery', '⭐ Top Rated', '🥗 Healthy', '🍰 Desserts'].map((tag) => (
              <button 
                key={tag}
                onClick={toggleCart}
                className="bg-white hover:bg-orange-50 border border-gray-200/60 text-xs font-bold text-gray-600 hover:text-orange-600 px-4 py-2.5 rounded-full transition shrink-0 cursor-pointer shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested / Popular Dishes grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Handpicked for You</h2>
            <button className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1">
              <span>View All Suggestions</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUGGESTED_DISHES.map((dish) => (
              <div 
                key={dish.id} 
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition duration-200 flex items-center gap-4 group"
              >
                <img 
                  src={dish.image} 
                  alt={dish.name} 
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-[10px] text-orange-600 font-bold uppercase">{dish.restaurant}</span>
                  <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {dish.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold">${dish.price.toFixed(2)}</span>
                    <div className="flex items-center gap-0.5 text-xs text-gray-700 font-bold">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{dish.rating}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleOrderAgain(dish.restaurant, `1x ${dish.name}`, dish.price)}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl transition shrink-0"
                  title="Add to order"
                >
                  <ShoppingBag size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Restaurants Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Explore Restaurants</h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Gourmet kitchens served straight to your dining room</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              restaurantsError 
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            }`}>
              {restaurantsError ? "Offline Mode" : `${restaurants.length} Partners Online`}
            </span>
          </div>

          {isRestaurantsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm animate-pulse space-y-4 text-left">
                  <div className="aspect-video bg-gray-100 rounded-2xl w-full" />
                  <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                  <div className="h-8 bg-gray-50 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id}
                  restaurant={restaurant}
                  onViewMenu={() => navigate(`/menu/${restaurant.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Orders logs */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Orders Summary</h2>
          
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm shadow-gray-100/50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm font-semibold">
                <thead className="bg-[#fafaf8] text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Items Ordered</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 text-orange-600 font-extrabold">{order.id}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">{order.restaurant}</td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-500">{order.items}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${order.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {order.status === 'Delivered' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={11} className="shrink-0" />
                              Delivered
                            </span>
                          ) : order.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                              ✕ Cancelled
                            </span>
                          ) : order.status === 'Delivering' ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
                              <Truck size={11} className="shrink-0" />
                              On the Way
                            </span>
                          ) : order.status === 'Preparing' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
                              🔥 Preparing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
                              ⏳ {order.status || 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              const rawId = order.rawId || order.id.replace('BS-', '')
                              navigate(`/order-tracker/${rawId}`)
                            }}
                            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                              order.status !== "Delivered" && order.status !== "Rejected"
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/10 font-extrabold'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {order.status !== "Delivered" && order.status !== "Rejected" ? 'Track Status' : 'Details'}
                          </button>
                          <button 
                            onClick={() => handleOrderAgain(order.restaurant, order.items, order.price)}
                            className="bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-200 text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Order Again
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

    </div>
  )
}