import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ShoppingBag, ArrowLeft, Star, Clock, 
  MapPin, Check, Plus, AlertCircle 
} from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Menu() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [restaurant, setRestaurant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Connect to persistent global Cart context
  const { cartCount, toggleCart, addToCart } = useCart()
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('accessToken')
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const res = await fetch(`http://localhost:8000/api/restaurants/${id}`, {
          headers: headers
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        setRestaurant(data)
        setError(null)
      } catch (err) {
        console.warn("FastAPI offline, serving mock menu details:", err)
        setError("Offline Mode - Serving from cache")
        // Robust fallback data for offline experience
        const MOCK_RESTAURANTS_STATIC = {
          1: {
            name: "La Maison Parisienne",
            cuisine: "Gourmet French",
            rating: 4.9,
            delivery_time: 30,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 1, name: "Coq au Vin", description: "Slow-braised chicken in rich red burgundy wine with pearl onions and mushrooms.", price: 28.50, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80" },
              { id: 2, name: "Herb Butter Grilled Steak", description: "Char-grilled prime ribeye steak basted in melted house garlic herb butter.", price: 34.50, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80" },
              { id: 3, name: "Decadent Chocolate Lava Fondant", description: "Warm chocolate cake with an irresistible molten chocolate lava core.", price: 9.50, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80" }
            ]
          },
          2: {
            name: "Pizzeria Bellina",
            cuisine: "Artisan Italian",
            rating: 4.8,
            delivery_time: 20,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 4, name: "Artisan Pepperoni & Honey Pizza", description: "Spicy pepperoni, fresh mozzarella, and a hot honey drizzle on sourdough.", price: 18.50, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80" },
              { id: 5, name: "Creamy Truffle Fettuccine", description: "Rich black truffle mushroom cream sauce tossed with hand-rolled fettuccine pasta.", price: 21.00, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80" },
              { id: 6, name: "Classic Italian Tiramisu", description: "Layers of espresso-soaked ladyfingers and whipped cocoa mascarpone cream.", price: 8.50, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80" }
            ]
          },
          3: {
            name: "Sakura Culinary",
            cuisine: "Authentic Japanese",
            rating: 4.9,
            delivery_time: 25,
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 7, name: "Imperial Dragon Sushi Platter", description: "Premium selection of spicy tuna, salmon maki roll, and chef's daily nigiri.", price: 24.00, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80" },
              { id: 8, name: "Rich Pork Tonkotsu Ramen", description: "Traditional 12-hour simmered pork broth, chashu pork belly, soft egg, and bamboo shoots.", price: 19.50, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80" },
              { id: 9, name: "Matcha Mochi Cakes", description: "Delicate green tea rice flour shells enclosing sweet whipped cream fillings.", price: 7.00, image: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?auto=format&fit=crop&w=500&q=80" }
            ]
          },
          4: {
            name: "Burger & Co.",
            cuisine: "American Bistro",
            rating: 4.7,
            delivery_time: 15,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 10, name: "Truffle Bacon Double Cheeseburger", description: "Double smash angus patties, crispy hickory bacon, cheddar, and truffle aioli.", price: 15.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80" },
              { id: 11, name: "Spicy Buffalo Cauliflower Wings", description: "Crisp buttermilk battered florets tossed in hot honey buffalo glaze.", price: 11.50, image: "https://images.unsplash.com/photo-1562967962-e429381640a3?auto=format&fit=crop&w=500&q=80" },
              { id: 12, name: "Sea Salt Caramel Milkshake", description: "Velvety hand-spun vanilla ice cream infused with rich dark caramel sauce.", price: 6.50, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80" }
            ]
          },
          5: {
            name: "El Taco Loco",
            cuisine: "Vibrant Mexican",
            rating: 4.6,
            delivery_time: 20,
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 13, name: "Crispy Barbacoa Beef Tacos", description: "Three double-corn tortillas loaded with slow-cooked beef, white onions, and cilantro.", price: 13.50, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80" },
              { id: 14, name: "Loaded Chipotle Quesadilla", description: "Griddled large flour tortilla loaded with roasted chicken, sweet peppers, and chipotle cream.", price: 14.00, image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=500&q=80" },
              { id: 15, name: "Cinnamon Sugar Churros", description: "Crispy fried pastries rolled in cinnamon sugar with warm dark chocolate dip.", price: 6.50, image: "https://images.unsplash.com/photo-1561626423-a51b45aef0a1?auto=format&fit=crop&w=500&q=80" }
            ]
          },
          6: {
            name: "Tikka Express",
            cuisine: "Rich Indian",
            rating: 4.8,
            delivery_time: 30,
            image: "https://images.unsplash.com/photo-1585938338392-50a5d22b143b?auto=format&fit=crop&w=500&q=80",
            menu_items: [
              { id: 16, name: "Creamy Butter Chicken", description: "Tender tandoori grilled chicken thighs simmered in spiced tomato butter gravy.", price: 18.00, image: "https://images.unsplash.com/photo-1585938338392-50a5d22b143b?auto=format&fit=crop&w=500&q=80" },
              { id: 17, name: "Garlic Butter Naan Basket", description: "Fresh flatbreads baked inside clay oven tandoor brushed in garlic butter.", price: 5.00, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80" },
              { id: 18, name: "Cardamom Mango Lassi", description: "Traditional blended sweet yogurt cooler flavored with ripe alphonso mango pulp.", price: 4.50, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80" }
            ]
          }
        }
        
        const fallback = MOCK_RESTAURANTS_STATIC[id] || MOCK_RESTAURANTS_STATIC[1]
        setRestaurant(fallback)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRestaurantDetail()
  }, [id])

  const handleAddToCart = (dish) => {
    // Add to global cart context
    addToCart({
      id: `menu-dish-${dish.id}`,
      name: dish.name,
      price: dish.price,
      image: dish.image
    })
    
    // Visual Toast trigger
    setToastMessage(`Added ${dish.name} to your active tray! 🛒`)
    setTimeout(() => {
      setToastMessage("")
    }, 2500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-500 animate-pulse">Loading menu offerings...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col items-center justify-center p-8 space-y-6">
        <AlertCircle size={48} className="text-red-500" />
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-extrabold">Restaurant Not Found</h2>
          <p className="text-sm text-gray-500 font-semibold">The kitchen you requested does not exist or has closed.</p>
        </div>
        <button 
          onClick={() => navigate('/customer-dashboard')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 overflow-x-hidden">
      
      {/* 1. Header Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40 shadow-sm shadow-gray-100/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/customer-dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-orange-500 transition bg-gray-50 hover:bg-orange-50 px-4 py-2.5 rounded-xl border border-gray-200/50 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/customer-dashboard')}>
            <span className="text-lg font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              BiteSwift Menu
            </span>
          </div>

          <div className="flex items-center gap-6">
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
          </div>
        </div>
      </nav>

      {/* 2. Restaurant Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gray-900 overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover opacity-60 scale-105 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf7] via-gray-950/20 to-transparent" />
        
        <div className="absolute bottom-8 left-4 right-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
              {restaurant.cuisine}
            </span>
            {error && (
              <span className="bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                {error}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 drop-shadow-sm tracking-tight">
            {restaurant.name}
          </h1>

          <div className="flex items-center gap-6 text-xs font-bold text-gray-800 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl w-max shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-1 text-gray-900">
              <Star size={14} className="fill-amber-400 text-amber-400 stroke-[1.5]" />
              <span>{restaurant.rating} Rating</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-300" />
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-orange-500" />
              <span>{restaurant.delivery_time || restaurant.deliveryTime} mins delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Menu Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 text-left">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Signature Menu Offerings</h2>
            <p className="text-sm text-gray-500 font-semibold mt-1">Handcrafted gourmet dishes freshly prepared to your order</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurant.menu_items && restaurant.menu_items.map((dish) => (
              <div 
                key={dish.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full"
              >
                {/* Dish Photo */}
                <div className="relative overflow-hidden aspect-video w-full bg-gray-50">
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-sm border border-gray-100/50">
                    <span className="text-orange-600 font-black text-sm">${dish.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dish Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-orange-500 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  </div>

                  {/* Add to Cart button */}
                  <button 
                    onClick={() => handleAddToCart(dish)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3.5 rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    <span>Add to Tray</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating success toast alert notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 backdrop-blur-md text-white font-extrabold text-xs px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-fade-in duration-300">
          <div className="bg-emerald-500 p-1 rounded-full text-white">
            <Check size={12} className="stroke-[3.5]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
