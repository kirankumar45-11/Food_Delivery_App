import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingBag, LogOut, TrendingUp, Users, Clock, 
  DollarSign, Check, X, Bell, ShieldCheck, Flame,
  Plus, Trash2, Edit, Filter, Coffee, Utensils, AlertTriangle, Layers, ChevronRight, Truck
} from 'lucide-react'

// Core mock active orders for fallback / seed
const INITIAL_ORDERS = [
  {
    id: "BS-4912",
    customer: "Alice Smith",
    time: "2 mins ago",
    items: "2x Artisan Pepperoni & Honey Pizza",
    total: 37.00,
    status: "Pending"
  },
  {
    id: "BS-3810",
    customer: "Bob Johnson",
    time: "5 mins ago",
    items: "1x Truffle Bacon Double Cheeseburger, 1x Sesame Tofu Bowl",
    total: 30.24,
    status: "Pending"
  },
  {
    id: "BS-2983",
    customer: "Elena Rostova",
    time: "12 mins ago",
    items: "3x Decadent Chocolate Lava Fondant",
    total: 28.50,
    status: "Preparing"
  }
]

const CATEGORY_DEFAULT_IMAGES = {
  Signature: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80",
  Starters: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=500&q=80",
  Mains: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  Desserts: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
  Beverages: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80"
}

export default function RestaurantDashboard() {
  const navigate = useNavigate()
  
  const getAuthHeaders = (contentType = null) => {
    const token = localStorage.getItem('accessToken')
    const headers = {}
    if (contentType) {
      headers['Content-Type'] = contentType
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null)
  
  // Dashboard Tabs ('orders' or 'menu')
  const [activeTab, setActiveTab] = useState('orders')
  
  // Real database states
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  
  // Local Orders queue state
  const [orders, setOrders] = useState([])
  const [revenue, setRevenue] = useState(1429.50)
  const [completedCount, setCompletedCount] = useState(18)
  
  // Inline toast notification state (replaces alert())
  const [toast, setToast] = useState(null) // { message, type: 'error'|'success' }
  
  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }
  
  // Modals and form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [selectedItemId, setSelectedItemId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Signature',
    description: '',
    image: ''
  })
  
  const [formErrors, setFormErrors] = useState({})

  // 1. Fetch current logged in chef & load restaurant profile
  useEffect(() => {
    const userString = localStorage.getItem('currentUser')
    if (userString) {
      const parsed = JSON.parse(userString)
      setCurrentUser(parsed)
      fetchRestaurantProfile(parsed.fullName)
    } else {
      navigate('/login')
    }
  }, [navigate])

  const fetchRestaurantOrders = async (restaurantId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/restaurant/orders?restaurant_id=${restaurantId}`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("Could not fetch orders")
      const data = await res.json()
      
      const formatted = data.map(order => ({
        id: `BS-${order.id}`,
        dbId: order.id,
        customer: order.customer_email.split('@')[0],
        customerEmail: order.customer_email,
        time: "Just ordered",
        items: order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
        total: order.total_price,
        status: order.status
      })).filter(order => order.status !== 'Delivered' && order.status !== 'Rejected')
      
      // Sort orders so Pending status appears first, then Preparing
      formatted.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        if (a.status === 'Preparing' && b.status === 'Delivering') return -1;
        if (a.status === 'Delivering' && b.status === 'Preparing') return 1;
        return b.dbId - a.dbId; // Sort by newer first within status group
      });
      
      setOrders(formatted)
    } catch (err) {
      console.warn("FastAPI orders fetch offline, falling back to simulated INITIAL_ORDERS", err)
      setOrders(INITIAL_ORDERS)
    }
  }

  const fetchRestaurantProfile = async (chefName) => {
    try {
      setIsLoading(true)
      // Call endpoint that retrieves or auto-creates chef's restaurant profile
      const res = await fetch(`http://localhost:8000/api/restaurants/chef/${encodeURIComponent(chefName)}`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("Could not connect to FastAPI server")
      
      const data = await res.json()
      setRestaurant(data)
      setMenuItems(data.menu_items || [])
      setApiError(null)
      
      // Fetch orders for this restaurant!
      await fetchRestaurantOrders(data.id)
    } catch (err) {
      console.warn("FastAPI offline or unavailable, entering simulated offline mode.", err)
      setApiError("Running in Offline Demo Mode - CRUD changes will be simulated locally.")
      
      // Seed default offline restaurant details
      setRestaurant({
        id: 1,
        name: chefName.includes('Chef') ? chefName : `${chefName}'s Kitchen`,
        cuisine: "Gourmet Fusion",
        rating: 4.9,
        delivery_time: 25,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
      })
      
      // Seed default offline dishes
      setMenuItems([
        { id: 1, name: "Coq au Vin", description: "Slow-braised chicken in rich red burgundy wine.", category: "Signature", price: 28.50, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80" },
        { id: 2, name: "Herb Butter Grilled Steak", description: "Char-grilled prime ribeye steak basted in garlic herb butter.", category: "Mains", price: 34.50, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80" },
        { id: 3, name: "Decadent Chocolate Lava Fondant", description: "Warm chocolate cake with molten chocolate core.", category: "Desserts", price: 9.50, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80" }
      ])
      
      // Seed default offline orders
      setOrders(INITIAL_ORDERS)
    } finally {
      setIsLoading(false)
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  // Active Orders Workflows
  const handleAcceptOrder = async (orderId) => {
    const orderToUpdate = orders.find(o => o.id === orderId)
    if (!orderToUpdate) return

    if (apiError || !orderToUpdate.dbId) {
      // Offline fallback simulation
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 'Preparing' }
        }
        return order
      }))
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderToUpdate.dbId}/status?status=Preparing`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("API status update error")
      const updated = await res.json()
      
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status: updated.status }
        }
        return order
      }))
    } catch (err) {
      console.error(err)
      showToast('Failed to accept order. Please check server connection.')
    }
  }

  const handleDeclineOrder = async (orderId) => {
    const orderToUpdate = orders.find(o => o.id === orderId)
    if (!orderToUpdate) return

    if (apiError || !orderToUpdate.dbId) {
      // Offline fallback simulation
      setOrders(prev => prev.filter(order => order.id !== orderId))
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderToUpdate.dbId}/status?status=Rejected`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("API status update error")
      
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (err) {
      console.error(err)
      showToast('Failed to reject order. Please check server connection.')
    }
  }

  const handleDispatchOrder = async (orderId) => {
    const orderToUpdate = orders.find(o => o.id === orderId)
    if (!orderToUpdate) return

    if (apiError || !orderToUpdate.dbId) {
      // Offline fallback simulation
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 'Delivering' }
        }
        return order
      }))
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderToUpdate.dbId}/status?status=Delivering`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("API status update error")
      const updated = await res.json()
      
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return { ...order, status: updated.status }
        }
        return order
      }))
    } catch (err) {
      console.error(err)
      showToast('Failed to dispatch order. Please check server connection.')
    }
  }

  const handleCompleteOrder = async (orderId, total) => {
    const orderToUpdate = orders.find(o => o.id === orderId)
    if (!orderToUpdate) return

    if (apiError || !orderToUpdate.dbId) {
      // Offline fallback simulation
      setRevenue(prev => prev + total)
      setCompletedCount(prev => prev + 1)
      setOrders(prev => prev.filter(order => order.id !== orderId))
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderToUpdate.dbId}/status?status=Delivered`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("API status update error")
      
      setRevenue(prev => prev + total)
      setCompletedCount(prev => prev + 1)
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (err) {
      console.error(err)
      showToast('Failed to complete order. Please check server connection.')
    }
  }

  // Form Management
  const openAddModal = () => {
    setFormErrors({})
    setFormData({
      name: '',
      price: '',
      category: 'Signature',
      description: '',
      image: ''
    })
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setFormErrors({})
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category || 'Signature',
      description: item.description || '',
      image: item.image || ''
    })
    setSelectedItemId(item.id)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Dish name is required"
    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "Enter a valid positive price"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // CRUD API Handlers
  const handleSaveItem = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const priceFloat = parseFloat(formData.price)
    const categoryVal = formData.category || 'Signature'
    const finalImage = formData.image.trim() || CATEGORY_DEFAULT_IMAGES[categoryVal]

    // Create payload
    const payload = {
      restaurant_id: restaurant.id,
      name: formData.name.trim(),
      price: priceFloat,
      category: categoryVal,
      description: formData.description.trim() || "Prepared with fresh gourmet ingredients.",
      image: finalImage
    }

    if (apiError) {
      // simulated offline CRUD
      if (modalMode === 'add') {
        const mockNew = {
          id: Math.floor(100 + Math.random() * 900),
          ...payload
        }
        setMenuItems(prev => [...prev, mockNew])
      } else {
        setMenuItems(prev => prev.map(item => item.id === selectedItemId ? { ...item, ...payload } : item))
      }
      setIsModalOpen(false)
      return
    }

    // Call real API
    try {
      if (modalMode === 'add') {
        const res = await fetch(`http://localhost:8000/api/menu-items`, {
          method: 'POST',
          headers: getAuthHeaders('application/json'),
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("API post error")
        const created = await res.json()
        setMenuItems(prev => [...prev, created])
      } else {
        const res = await fetch(`http://localhost:8000/api/menu-items/${selectedItemId}`, {
          method: 'PUT',
          headers: getAuthHeaders('application/json'),
          body: JSON.stringify({
            name: payload.name,
            price: payload.price,
            category: payload.category,
            description: payload.description,
            image: payload.image
          })
        })
        if (!res.ok) throw new Error("API put error")
        const updated = await res.json()
        setMenuItems(prev => prev.map(item => item.id === selectedItemId ? updated : item))
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast('Failed to save menu item. Please check server connection.')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to permanently delete this gourmet item from your menu?")) return

    if (apiError) {
      // simulated offline CRUD
      setMenuItems(prev => prev.filter(item => item.id !== itemId))
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error("API delete error")
      setMenuItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error(err)
      showToast('Failed to delete menu item. Please check server connection.')
    }
  }

  if (!currentUser || !restaurant) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold">Gathering kitchen workspaces...</p>
      </div>
    )
  }

  const pendingCount = orders.filter(o => o.status === 'Pending').length
  const preparingCount = orders.filter(o => o.status === 'Preparing').length

  return (
    <div className="min-h-screen bg-[#070708] text-gray-100 overflow-x-hidden font-sans pb-16">
      
      {/* Inline Toast Notification */}
      <div className={`fixed top-5 right-5 z-[100] transform transition-all duration-500 ease-out ${toast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md text-sm font-bold max-w-sm ${
          toast?.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100'
            : 'bg-red-900/90 border-red-700 text-red-100'
        }`}>
          <div className={`h-2 w-2 rounded-full shrink-0 ${toast?.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-ping`} />
          <span>{toast?.message}</span>
        </div>
      </div>
      
      {/* 1. Partner Header */}
      <nav className="bg-[#0c0c0e]/95 backdrop-blur-md border-b border-gray-900 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-tr from-orange-500 to-red-600 p-2 rounded-xl text-white shadow-md shadow-orange-500/10">
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              BiteSwift Partner
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative p-2 text-gray-400 hover:text-orange-500 transition cursor-pointer">
              <Bell size={22} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 h-2.5 w-2.5 rounded-full animate-ping" />
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition bg-white/5 hover:bg-red-500/10 px-4 py-2.5 rounded-xl border border-gray-800 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Welcome Dashboard Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-[#121216] to-[#0c0c0e] border border-gray-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 px-3 py-1 rounded-full text-orange-500 font-extrabold text-[10px] uppercase tracking-wide">
                <Flame size={12} className="animate-pulse" />
                <span>Console Active</span>
              </div>
              {apiError && (
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full text-amber-500 font-extrabold text-[10px] uppercase tracking-wide">
                  <AlertTriangle size={12} />
                  <span>Demo Mode</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {restaurant.name}
            </h1>
            <p className="text-gray-400 font-semibold text-sm max-w-xl">
              Kitchen Console: Manage your gourmet offerings, handle real-time customer trays, and dispatch active courier runs.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#070708]/80 border border-gray-800 rounded-2xl p-4 shrink-0 relative z-10">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cuisine Style</p>
              <p className="text-xs font-black text-orange-500 mt-1">{restaurant.cuisine}</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-800" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Kitchen Rating</p>
              <p className="text-xs font-black text-gray-200 mt-1">★ {restaurant.rating}</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-800" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dishes Loaded</p>
              <p className="text-xs font-black text-gray-200 mt-1">{menuItems.length} Offerings</p>
            </div>
          </div>
        </div>

        {/* Tab Selector Nav Row */}
        <div className="flex border-b border-gray-900 pb-px gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 text-sm font-extrabold flex items-center gap-2 border-b-2 transition relative cursor-pointer ${
              activeTab === 'orders'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Utensils size={16} />
            <span>Orders Queue</span>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-4 px-2 text-sm font-extrabold flex items-center gap-2 border-b-2 transition relative cursor-pointer ${
              activeTab === 'menu'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers size={16} />
            <span>Gourmet Menu Manager</span>
            <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">
              {menuItems.length}
            </span>
          </button>
        </div>

        {/* Dynamic Tab Body Render */}
        {activeTab === 'orders' ? (
          <div className="space-y-8 animate-fade-in">
            
            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0c0c0e] border border-gray-900 p-6 rounded-3xl space-y-3 text-left">
                <div className="bg-orange-500/10 text-orange-500 p-2.5 rounded-2xl w-max">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-black mt-0.5">${revenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-gray-900 p-6 rounded-3xl space-y-3 text-left">
                <div className="bg-orange-500/10 text-orange-500 p-2.5 rounded-2xl w-max">
                  <Clock size={20} className="animate-spin [animation-duration:10s]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Cook Duration</p>
                  <p className="text-2xl font-black mt-0.5">14 Mins</p>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-gray-900 p-6 rounded-3xl space-y-3 text-left">
                <div className="bg-orange-500/10 text-orange-500 p-2.5 rounded-2xl w-max">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Orders Dispatched</p>
                  <p className="text-2xl font-black mt-0.5">{completedCount}</p>
                </div>
              </div>

              <div className="bg-[#0c0c0e] border border-gray-900 p-6 rounded-3xl space-y-3 text-left">
                <div className="bg-orange-500/10 text-orange-500 p-2.5 rounded-2xl w-max">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Queue</p>
                  <p className="text-2xl font-black mt-0.5">{pendingCount + preparingCount} Tasks</p>
                </div>
              </div>
            </div>

            {/* Active Orders Queue Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold tracking-tight">Active Orders Queue</h2>
                  <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {pendingCount} Pending Approval
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-[#0c0c0e] border border-gray-900 rounded-3xl p-12 text-center space-y-3">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-300">All Trays Cleared!</h3>
                    <p className="text-xs text-gray-500 font-semibold max-w-xs mx-auto">
                      No active orders in queue right now. You are fully caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-[#0c0c0e] border border-gray-900 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-800 transition duration-200"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-orange-500">{order.id}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{order.time}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'Preparing' 
                                ? 'bg-amber-500/10 border border-amber-500/25 text-amber-500' 
                                : 'bg-red-500/10 border border-red-500/25 text-red-500 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-gray-400">Customer: <span className="text-gray-100">{order.customer}</span></h4>
                          <p className="text-xs text-gray-400 font-semibold leading-relaxed max-w-md">{order.items}</p>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t border-gray-900/60 pt-4 sm:border-0 sm:pt-0 shrink-0">
                          <span className="text-base font-black text-gray-200">${order.total.toFixed(2)}</span>
                          
                          <div className="flex gap-2">
                            {order.status === 'Pending' ? (
                              <>
                                <button 
                                  onClick={() => handleDeclineOrder(order.id)}
                                  className="bg-white/5 hover:bg-red-500/10 border border-gray-800 hover:border-red-500 text-gray-400 hover:text-red-500 p-2.5 rounded-xl transition cursor-pointer"
                                  title="Decline Order"
                                >
                                  <X size={16} />
                                </button>
                                <button 
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/10"
                                >
                                  <Check size={14} className="stroke-[3]" />
                                  <span>Accept</span>
                                </button>
                              </>
                            ) : (
                              order.status === 'Preparing' ? (
                                <button 
                                  onClick={() => handleDispatchOrder(order.id)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                                >
                                  <Truck size={14} className="stroke-[2.5]" />
                                  <span>Dispatch</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleCompleteOrder(order.id, order.total)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                                >
                                  <Check size={14} className="stroke-[3]" />
                                  <span>Mark Delivered</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Brief Stock view */}
              <div className="lg:col-span-4 space-y-6 text-left">
                <h2 className="text-xl font-extrabold tracking-tight">Signature Offerings</h2>
                <div className="bg-[#0c0c0e] border border-gray-900 rounded-3xl p-6 space-y-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Quick Menu Reference</p>
                  
                  <div className="divide-y divide-gray-900">
                    {menuItems.slice(0, 5).map((dish) => (
                      <div key={dish.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={dish.image} alt={dish.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-xs font-semibold text-gray-300 leading-snug line-clamp-1">{dish.name}</span>
                        </div>
                        <span className="text-xs font-black text-orange-500 shrink-0">${dish.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {menuItems.length > 5 && (
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="w-full text-center text-xs font-bold text-gray-500 hover:text-orange-500 py-1 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View remaining {menuItems.length - 5} items</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Real-time Menu Manager Tab */
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">House Food Offerings</h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">Configure dish specifics, prices, and categories loaded in real-time.</p>
              </div>
              
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer self-start sm:self-auto hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Add Custom Menu Item</span>
              </button>
            </div>

            {/* Menu Items Table */}
            <div className="bg-[#0c0c0e] border border-gray-900 rounded-[32px] overflow-hidden shadow-2xl">
              {menuItems.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Coffee size={32} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-300">Kitchen Menu is Empty!</h3>
                    <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto">
                      You haven't listed any gourmet options yet. Click "Add Custom Menu Item" above to create your very first offering!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-[#121216] border-b border-gray-900 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Dish details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Gourmet Price</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900/60 font-semibold text-gray-300">
                      {menuItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-900/10 transition">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-900 shrink-0 shadow"
                            />
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="font-extrabold text-white text-sm line-clamp-1">{item.name}</h4>
                              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed line-clamp-2 max-w-sm">{item.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                              item.category === 'Signature'
                                ? 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                                : item.category === 'Starters'
                                ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                                : item.category === 'Mains'
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                : item.category === 'Desserts'
                                ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                                : 'bg-pink-500/10 border-pink-500/25 text-pink-400'
                            }`}>
                              {item.category || 'Signature'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-black text-sm">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="bg-white/5 hover:bg-orange-500/10 border border-gray-800 hover:border-orange-500 text-gray-400 hover:text-orange-500 p-2.5 rounded-xl transition cursor-pointer"
                                title="Edit Dish Details"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-white/5 hover:bg-red-500/10 border border-gray-800 hover:border-red-500 text-gray-400 hover:text-red-500 p-2.5 rounded-xl transition cursor-pointer"
                                title="Delete Dish"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* CRUD Add/Edit Modal (Glassmorphism Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          
          <div className="bg-[#0c0c0e] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {modalMode === 'add' ? "Add Gourmet Dish" : "Modify Offering Details"}
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  {modalMode === 'add' ? "Expand your menu catalog with a signature item." : "Refine dish properties loaded in your client trays."}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-300 p-1.5 hover:bg-white/5 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="space-y-5" noValidate>
              
              {/* Dish Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Dish / Offering Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Escargots de Bourgogne"
                  className={`w-full px-4 py-3 bg-[#070708] border rounded-2xl focus:outline-none focus:ring-2 text-sm font-semibold text-white transition ${
                    formErrors.name 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-800 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Category selector row */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Menu Category Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Signature', 'Starters', 'Mains', 'Desserts', 'Beverages'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`text-[10px] font-extrabold px-3.5 py-2 rounded-xl border transition cursor-pointer uppercase tracking-wider ${
                        formData.category === cat
                          ? 'border-orange-500 bg-orange-500/5 text-orange-400 font-black ring-1 ring-orange-500'
                          : 'border-gray-800 bg-[#070708] text-gray-400 hover:border-gray-700 hover:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price and Optional Image row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Price Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Gourmet Price ($)
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 18.50"
                    className={`w-full px-4 py-3 bg-[#070708] border rounded-2xl focus:outline-none focus:ring-2 text-sm font-semibold text-white transition ${
                      formErrors.price 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-800 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                      <AlertTriangle size={12} />
                      <span>{formErrors.price}</span>
                    </p>
                  )}
                </div>

                {/* Optional Image Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Leave empty for category default"
                    className="w-full px-4 py-3 bg-[#070708] border border-gray-800 focus:border-orange-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-semibold text-white transition"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Dish Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe the aromatic flavors, preparation style, and portion size..."
                  className="w-full px-4 py-3 bg-[#070708] border border-gray-800 focus:border-orange-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-semibold text-white transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs px-5 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition duration-300 cursor-pointer"
                >
                  {modalMode === 'add' ? "Create Menu Item" : "Save Refinements"}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}
