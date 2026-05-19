import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Navigation, 
  ShoppingBag, 
  Menu, 
  X, 
  Star, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  Smartphone,
  Check
} from 'lucide-react'

// Curated dishes data with premium Unsplash images
const DISHES = [
  {
    id: 1,
    name: "Truffle Bacon Double Cheeseburger",
    category: "Burgers",
    price: 15.99,
    rating: 4.9,
    reviews: 142,
    time: "15-20 min",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    desc: "Aged black angus beef, double melted cheddar, truffle aioli, crispy bacon on brioche."
  },
  {
    id: 2,
    name: "Artisan Pepperoni & Honey Pizza",
    category: "Pizza",
    price: 18.50,
    rating: 4.8,
    reviews: 98,
    time: "20-25 min",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    desc: "Stone-fired sourdough, spicy calabrian pepperoni, fresh mozzarella, hot honey drizzle."
  },
  {
    id: 3,
    name: "Imperial Dragon Sushi Platter",
    category: "Sushi",
    price: 24.00,
    rating: 4.9,
    reviews: 215,
    time: "25-30 min",
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
    desc: "Chef's selection of premium nigiri, signature spicy tuna rolls, fresh sashimi."
  },
  {
    id: 4,
    name: "Crispy Sesame Tofu Bowl",
    category: "Salads",
    price: 14.25,
    rating: 4.7,
    reviews: 84,
    time: "15-20 min",
    tag: "Healthy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    desc: "Crispy sesame crusted organic tofu, wild rice, avocado, edamame, ginger miso dressing."
  },
  {
    id: 5,
    name: "Decadent Chocolate Lava Fondant",
    category: "Desserts",
    price: 9.50,
    rating: 4.9,
    reviews: 310,
    time: "10-15 min",
    tag: "Sweet Treat",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    desc: "Rich Belgian dark chocolate cake with a molten liquid center, served with vanilla bean dust."
  },
  {
    id: 6,
    name: "Spicy Birria Taco Supreme",
    category: "Burgers",
    price: 13.99,
    rating: 4.8,
    reviews: 127,
    time: "15-20 min",
    tag: "Local Favorite",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    desc: "Slow braised beef birria, melted Monterey jack, fresh cilantro, onions, consume dip."
  },
  {
    id: 7,
    name: "Wild Mushroom Truffle Tagliatelle",
    category: "Pizza",
    price: 21.00,
    rating: 4.8,
    reviews: 73,
    time: "20-25 min",
    tag: "Chef Special",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    desc: "House-made fresh pasta, sautéed porcini and chanterelle mushrooms, creamy black truffle sauce."
  },
  {
    id: 8,
    name: "California Avocado Smash",
    category: "Salads",
    price: 12.50,
    rating: 4.6,
    reviews: 112,
    time: "10-15 min",
    tag: "Breakfast",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    desc: "Sourdough toast, heirloom cherry tomatoes, organic poached egg, feta, pumpkin seeds."
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Food Blogger",
    rating: 5,
    comment: "BiteSwift has completely revolutionized my work-from-home routine. The food arrives incredibly hot and fresh, as if I'm eating straight in the restaurant. Absolutely phenomenal curated list!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "Software Architect",
    rating: 5,
    comment: "The 20-minute delivery guarantee is no joke. I've ordered six times this month, and they've beat the clock every single time. The live tracking is precise down to the meter.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 3,
    name: "Dr. Elena Rostova",
    role: "Nutritionist",
    rating: 5,
    comment: "Finding healthy, chef-grade delivery options can be tough, but BiteSwift's selected restaurant list has amazing macro-friendly meals. Highly recommend the Avocado Toast and Poke Bowls!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  // Navigation & Cart States
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Interactive Address Finder States
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);

  // Category & Menu Selector States
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Testimonials Slider State
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Newsletter Form State
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Toast Notification handler
  const triggerToast = (message) => {
    setNotification(message);
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  // Locate Current Address Simulation
  const handleLocateMe = () => {
    setIsLocating(true);
    setTimeout(() => {
      setAddress('742 Evergreen Terrace, Springfield');
      setIsLocating(false);
      setAddressVerified(true);
      triggerToast("📍 Location set: 742 Evergreen Terrace!");
    }, 1200);
  };

  // Submit Address Search
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (address.trim() === '') {
      triggerToast("⚠️ Please enter a delivery address first!");
      return;
    }
    setAddressVerified(true);
    triggerToast(`🚀 Delivering to: ${address}`);
    
    // Smooth scroll down to explore menu
    const menuSection = document.getElementById('explore-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add Item to Cart Animation
  const handleAddToCart = (dishName) => {
    setCartCount(prev => prev + 1);
    triggerToast(`🛍️ Added "${dishName}" to your order!`);
  };

  // Handle Newsletter Submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim() === '' || !emailInput.includes('@')) {
      triggerToast("⚠️ Please enter a valid email address!");
      return;
    }
    setNewsletterSubscribed(true);
    triggerToast("🎉 Welcome aboard! Code BITESWIFT20 sent.");
  };

  // Auto rotate testimonials
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Filtered dishes
  const filteredDishes = selectedCategory === 'All' 
    ? DISHES 
    : DISHES.filter(dish => dish.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-5 right-5 z-[100] transform transition-all duration-500 ease-out ${notification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 backdrop-blur-md bg-opacity-95">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
          <span className="text-sm font-medium tracking-wide">{notification}</span>
        </div>
      </div>

      {/* Floating cart floating action button on mobile */}
      <div className="md:hidden fixed bottom-6 left-6 z-[90]">
        <button 
          onClick={() => triggerToast(`🛒 Checkout is not integrated yet. You have ${cartCount} items.`)}
          className="relative bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition duration-300 transform active:scale-95 flex items-center justify-center border-2 border-white"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-bold text-xs h-6 w-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* 1. Responsive Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-gray-100/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-tr from-orange-500 to-red-600 p-2 rounded-xl text-white shadow-md shadow-orange-500/20 group-hover:rotate-12 transition-transform duration-300">
                  <ShoppingBag size={22} className="stroke-[2.5]" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
                  BiteSwift
                </span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-semibold text-gray-800 hover:text-orange-500 transition duration-200">Home</a>
              <a href="#explore-menu" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition duration-200">Explore Menu</a>
              <a href="#why-biteswift" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition duration-200">Why Us</a>
              <a href="#testimonials" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition duration-200">Reviews</a>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-5">
              <button 
                onClick={() => triggerToast(`🛒 Your order summary is loading... (Total: ${cartCount} items)`)}
                className="relative p-2.5 text-gray-700 hover:text-orange-500 transition-colors duration-200 rounded-xl hover:bg-gray-50 group"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-orange-500 to-red-600 text-white font-bold text-xs h-5.5 w-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    {cartCount}
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 bg-gray-200 h-2 w-2 rounded-full group-hover:bg-orange-400 transition-colors" />
                )}
              </button>
              
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-gray-700 hover:text-orange-500 px-4 py-2.5 transition duration-200"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => navigate('/register')}
                className="text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-5.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Register
              </button>
            </div>

            {/* Mobile hamburger menu toggle */}
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={() => triggerToast(`🛒 Summary: ${cartCount} items`)}
                className="relative p-2 text-gray-600 hover:text-orange-500"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-orange-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen py-6 opacity-100 visible' : 'max-h-0 py-0 opacity-0 overflow-hidden invisible'}`}>
          <div className="px-4 space-y-4">
            <a 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              Home
            </a>
            <a 
              href="#explore-menu" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              Explore Menu
            </a>
            <a 
              href="#why-biteswift" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              Why Us
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              Reviews
            </a>
            <hr className="border-gray-100 my-2" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                className="w-full text-center py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition border border-gray-200"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}
                className="w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md shadow-orange-500/10 transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-8 pb-16 md:py-24 overflow-hidden">
        {/* Subtle blur background designs */}
        <div className="absolute top-1/4 -left-36 w-72 h-72 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute -top-10 right-0 w-96 h-96 rounded-full bg-red-400/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text and Search */}
            <div className="lg:col-span-6 space-y-8 z-10 text-center lg:text-left">
              {/* Promotion Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-4 py-2 rounded-full text-orange-600 font-bold text-xs uppercase tracking-wider animate-pulse-soft">
                <Star size={14} className="fill-orange-600" />
                <span>#1 Food Delivery in the city</span>
              </div>

              {/* Value Proposition */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-none">
                  Craving Gourmet? <br />
                  <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Delivered in 20 Mins.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium">
                  Experience the fastest delivery from your favorite local culinary partners, handpicked and crafted by certified top chefs.
                </p>
              </div>

              {/* Address Search Form */}
              <div className="max-w-xl mx-auto lg:mx-0 bg-white p-2.5 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100">
                <form onSubmit={handleAddressSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5">
                    <MapPin className="text-orange-500 flex-shrink-0" size={20} />
                    <input 
                      type="text" 
                      placeholder="Enter your delivery address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-semibold text-gray-800 placeholder-gray-400"
                    />
                    {address && (
                      <button 
                        type="button" 
                        onClick={() => setAddress('')} 
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-row sm:flex-row gap-2">
                    <button 
                      type="button"
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      className="bg-gray-50 hover:bg-orange-500/10 text-orange-600 p-3.5 rounded-xl sm:rounded-2xl transition duration-200 flex items-center justify-center flex-shrink-0 border border-gray-200/50"
                      title="Use current location"
                    >
                      <Navigation size={18} className={isLocating ? "animate-spin text-orange-600" : ""} />
                    </button>
                    
                    <button 
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl sm:rounded-2xl shadow-md shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 hover:-translate-y-0.5"
                    >
                      <span>Find Food</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Tags / Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500 font-semibold pt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>No minimum order</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>GPS Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>5-Star Chefs</span>
                </div>
              </div>

              {/* CTAs Link Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <a 
                  href="#explore-menu"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Explore Menu
                </a>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-sm px-8 py-4 rounded-xl border border-gray-200 shadow-sm transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register Partner
                </button>
              </div>
            </div>

            {/* Hero Image Section with overlays */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Circle Glow Behind Mockup */}
              <div className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-gradient-to-tr from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse-soft" />

              {/* Premium Floating Dish Grid and Card Display */}
              <div className="relative w-full max-w-[450px] h-[380px] sm:h-[450px] mx-auto flex items-center justify-center">
                {/* Primary Main Dish Image */}
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-white w-[260px] h-[340px] sm:w-[300px] sm:h-[400px] transform -rotate-3 hover:rotate-0 transition-all duration-500 group">
                  <img 
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" 
                    alt="Premium Ribeye Meal" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs uppercase bg-orange-500 font-extrabold px-2 py-0.5 rounded-full w-max mb-1.5">Chef's Signature</span>
                    <h3 className="text-lg font-bold">Herb Butter Grilled Steak</h3>
                    <p className="text-xs text-gray-200/90 font-medium">From La Maison Parisienne</p>
                  </div>
                </div>

                {/* Floating Card 1: Delivery Time */}
                <div className="absolute -top-3 -left-4 sm:left-4 bg-white p-3.5 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 flex items-center gap-3 animate-float z-20">
                  <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Fastest Delivery</h4>
                    <p className="text-sm font-extrabold text-gray-800">18 Mins Average</p>
                  </div>
                </div>

                {/* Floating Card 2: Rating */}
                <div className="absolute bottom-6 -right-4 bg-white p-3.5 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 flex items-center gap-3 animate-float [animation-delay:1.5s] z-20">
                  <div className="bg-amber-400 text-white p-2 rounded-xl">
                    <Star size={18} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Top Chefs</h4>
                    <p className="text-sm font-extrabold text-gray-800">4.9 ★ Gold Rated</p>
                  </div>
                </div>

                {/* Floating Card 3: Active Orders */}
                <div className="absolute bottom-1/2 -right-8 bg-white p-3 sm:p-3.5 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 flex items-center gap-2.5 z-20 animate-float [animation-delay:2.5s]">
                  <div className="relative">
                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                    <div className="absolute top-0 h-2.5 w-2.5 bg-emerald-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-700">14 Drivers Near You</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Features Section (Fast Delivery, Trusted Restaurants) */}
      <section id="why-biteswift" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs uppercase bg-orange-100 text-orange-600 font-extrabold px-4 py-1.5 rounded-full w-max mx-auto tracking-wider">
              Our Core Experience
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Why Hungry Customers <br className="sm:hidden" /> Choose BiteSwift
            </h3>
            <p className="text-gray-500 font-medium">
              We've re-engineered food delivery from the ground up, guaranteeing restaurant-grade fresh quality at record speeds.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[#fafaf7] p-8 rounded-3xl border border-gray-100 hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group">
              <div className="bg-orange-500 text-white p-4 rounded-2xl w-max mb-6 shadow-md shadow-orange-500/25 group-hover:scale-110 transition duration-300">
                <Clock size={24} />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Lightning Delivery</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Our advanced AI dispatching routes orders to drivers instantly. If your food takes more than 20 minutes from cook to curb, we refund 100%.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#fafaf7] p-8 rounded-3xl border border-gray-100 hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group">
              <div className="bg-orange-500 text-white p-4 rounded-2xl w-max mb-6 shadow-md shadow-orange-500/25 group-hover:scale-110 transition duration-300">
                <Award size={24} />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Premium Culinary Network</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                No filler joints. We partner exclusively with certified high-rating restaurants, elite pizzerias, and Michelin-tier chefs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#fafaf7] p-8 rounded-3xl border border-gray-100 hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group">
              <div className="bg-orange-500 text-white p-4 rounded-2xl w-max mb-6 shadow-md shadow-orange-500/25 group-hover:scale-110 transition duration-300">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-3">Zero-Oxidation Seals</h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Drivers carry advanced thermal insulated micro-induction chambers, locking in heat and preventing humidity from degrading your crust or fries.
              </p>
            </div>

          </div>

          {/* Quick interactive counters block */}
          <div className="mt-16 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div>
                <h5 className="text-4xl md:text-5xl font-extrabold text-orange-500">20M+</h5>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">Dishes Delivered</p>
              </div>
              <div>
                <h5 className="text-4xl md:text-5xl font-extrabold text-orange-500">4.9★</h5>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">App Store Rating</p>
              </div>
              <div>
                <h5 className="text-4xl md:text-5xl font-extrabold text-orange-500">&lt;20m</h5>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">Avg Delivery Speed</p>
              </div>
              <div>
                <h5 className="text-4xl md:text-5xl font-extrabold text-orange-500">1,200+</h5>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">5-Star Culinary Partners</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Interactive Explore Menu Section */}
      <section id="explore-menu" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Tabs */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 mb-12">
            <div className="text-center lg:text-left space-y-3">
              <h2 className="text-xs uppercase bg-orange-100 text-orange-600 font-extrabold px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0 tracking-wider">
                Gastronomy Catalog
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Explore Culinary Masterpieces
              </h3>
              <p className="text-gray-500 font-medium max-w-xl">
                Select your favorite gourmet tier and add outstanding dishes instantly to your digital order tray.
              </p>
            </div>

            {/* Interactive Category Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Burgers', 'Pizza', 'Sushi', 'Salads', 'Desserts'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-extrabold transition-all duration-300 cursor-pointer ${selectedCategory === cat 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 translate-y-[-1px]' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 border border-gray-200/50 shadow-sm'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Menu Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <div 
                key={dish.id} 
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/70 hover:border-orange-500/25 transition-all duration-300 flex flex-col group"
              >
                {/* Dish Photo */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="bg-gray-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-sm tracking-wider uppercase">
                      {dish.tag}
                    </span>
                  </div>
                  
                  {/* Delivery time small bubble overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Clock size={12} className="text-orange-500" />
                    <span>{dish.time}</span>
                  </div>

                  {/* Desktop Quick Add overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleAddToCart(dish.name)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Card Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600 font-extrabold uppercase tracking-widest">{dish.category}</span>
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{dish.rating}</span>
                        <span className="text-gray-400 font-normal">({dish.reviews})</span>
                      </div>
                    </div>

                    {/* Dish Name */}
                    <h4 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-orange-500 transition-colors line-clamp-1">
                      {dish.name}
                    </h4>

                    {/* Dish Desc */}
                    <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-2">
                      {dish.desc}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
                      <span className="text-lg font-extrabold text-gray-900">${dish.price.toFixed(2)}</span>
                    </div>

                    {/* Add to Cart button */}
                    <button 
                      onClick={() => handleAddToCart(dish.name)}
                      className="bg-[#fafaf7] hover:bg-orange-500 hover:text-white text-gray-800 p-2.5 rounded-xl transition duration-200 border border-gray-200/50 hover:border-orange-500 flex items-center justify-center"
                      title="Add to order"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Testimonials Slider */}
      <section id="testimonials" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Review Statistics Info */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <h2 className="text-xs uppercase bg-orange-100 text-orange-600 font-extrabold px-4 py-1.5 rounded-full w-max mx-auto lg:mx-0 tracking-wider">
                User Feedback
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                What Food Lovers Say About BiteSwift
              </h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto lg:mx-0">
                Read direct reviews from gourmet food bloggers, busy professionals, and nutrition specialists ordering daily.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 pt-4">
                <div>
                  <h4 className="text-4xl font-extrabold text-gray-900">4.92 ★</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">Average Review rating</p>
                </div>
                <div className="h-px w-10 sm:h-10 sm:w-px bg-gray-200" />
                <div>
                  <h4 className="text-4xl font-extrabold text-gray-900">99.4%</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">On-Time delivery rate</p>
                </div>
              </div>
            </div>

            {/* Testimonials Slider Box */}
            <div className="lg:col-span-7 bg-[#fafaf7] p-8 md:p-12 rounded-[36px] border border-gray-100 shadow-xl shadow-gray-200/40 relative">
              <div className="absolute top-6 right-8 text-orange-500/10 font-serif text-[120px] leading-none pointer-events-none">“</div>
              
              {/* Active testimonial card */}
              <div className="space-y-6 relative z-10">
                {/* Rating stars */}
                <div className="flex gap-1">
                  {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-base md:text-lg text-gray-700 font-medium italic leading-relaxed">
                  "{TESTIMONIALS[activeTestimonial].comment}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                  <img 
                    src={TESTIMONIALS[activeTestimonial].avatar} 
                    alt={TESTIMONIALS[activeTestimonial].name} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h5 className="font-extrabold text-gray-900 text-base">{TESTIMONIALS[activeTestimonial].name}</h5>
                    <p className="text-xs text-orange-600 font-bold uppercase mt-0.5">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200/30">
                {/* Dots indicator */}
                <div className="flex gap-2">
                  {TESTIMONIALS.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-8 bg-orange-500' : 'w-2.5 bg-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Left/Right Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTestimonial(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                    className="bg-white hover:bg-orange-500 hover:text-white text-gray-600 p-2.5 rounded-xl border border-gray-200 shadow-sm transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length)}
                    className="bg-white hover:bg-orange-500 hover:text-white text-gray-600 p-2.5 rounded-xl border border-gray-200 shadow-sm transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. Beautiful Mobile App Call to Action Section */}
      <section className="py-16 md:py-24 bg-[#0a0908] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Promo text details */}
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-orange-500 uppercase tracking-widest text-xs font-bold bg-orange-500/10 px-3.5 py-1.5 rounded-full border border-orange-500/25">
                BiteSwift Mobile app
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Order Gourmet Meals From Your Pocket
              </h3>
              <p className="text-gray-400 font-medium max-w-md mx-auto lg:mx-0">
                Unlock exclusive mobile-only discounts, track your courier down to the meter in high-fidelity GPS, and order with 1-tap Apple or Google Pay.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <button 
                  onClick={() => triggerToast("📲 App Store redirect is coming soon!")}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition"
                >
                  <Smartphone size={20} />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-500 leading-none">Download on the</p>
                    <p className="text-sm font-extrabold leading-tight mt-0.5">App Store</p>
                  </div>
                </button>
                <button 
                  onClick={() => triggerToast("📲 Google Play redirect is coming soon!")}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition"
                >
                  <Phone size={20} />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Get it on</p>
                    <p className="text-sm font-extrabold leading-tight mt-0.5">Google Play</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone Mockup Design */}
            <div className="flex justify-center relative">
              <div className="relative w-64 h-[380px] bg-gray-900 rounded-[44px] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col justify-between p-3.5">
                {/* Speaker Notch */}
                <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full z-20 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                </div>
                
                {/* Mobile app UI simulation */}
                <div className="flex-1 bg-[#fafaf7] text-gray-950 rounded-[32px] overflow-hidden p-3.5 flex flex-col justify-between pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">B</div>
                      <span className="text-[10px] font-bold">BiteSwift</span>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full">18 Min Delivery</span>
                  </div>
                  
                  {/* Phone screen center content mockup */}
                  <div className="my-3 flex-1 flex flex-col justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" 
                      alt="" 
                      className="w-full h-24 object-cover rounded-xl shadow-sm mb-2"
                    />
                    <h5 className="text-[10px] font-extrabold text-gray-900">Bacon Double Cheeseburger</h5>
                    <p className="text-[8px] text-gray-400 font-semibold mt-0.5">$15.99 • Chef Signature</p>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-3 overflow-hidden">
                      <div className="h-full w-3/4 bg-orange-500 rounded-full animate-pulse" />
                    </div>
                    <span className="text-[7px] text-orange-600 font-extrabold mt-1 text-right block">Order en route (75%)</span>
                  </div>

                  <button className="w-full bg-gray-950 text-white font-extrabold text-[10px] py-2 rounded-lg text-center shadow-md">
                    Track Live Order
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Footer & Newsletter Signup */}
      <footer className="bg-[#0e0d0c] text-white pt-20 pb-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Newsletter Section */}
          <div className="pb-16 border-b border-gray-900 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <h4 className="text-2xl font-extrabold tracking-tight">Subscribe to Our Newsletter</h4>
              <p className="text-gray-400 font-medium text-sm">Join the gourmet elite to receive recipe stories, discounts, and culinary invitations.</p>
            </div>
            
            <div className="w-full max-w-md">
              {newsletterSubscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
                  <Check size={20} className="flex-shrink-0" />
                  <span className="text-sm font-semibold">Subscribed! Check your inbox for a 20% discount code.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 focus-within:border-orange-500/50 transition">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm px-3.5 py-2 placeholder-gray-500 font-semibold"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition duration-200 shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Grid */}
          <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <a href="#" className="flex items-center gap-2">
                <div className="bg-orange-500 p-2 rounded-xl text-white">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  BiteSwift
                </span>
              </a>
              <p className="text-gray-400 font-medium text-xs leading-relaxed">
                Chef-grade gourmet, cooked with passion and delivered under 20 minutes in our custom thermal induction chambers.
              </p>
            </div>

            {/* Menu options */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase text-gray-500 tracking-wider">Gastronomy</h5>
              <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
                <li><a href="#explore-menu" className="hover:text-orange-500 transition">Classic Burgers</a></li>
                <li><a href="#explore-menu" className="hover:text-orange-500 transition">Stone Sourdough Pizza</a></li>
                <li><a href="#explore-menu" className="hover:text-orange-500 transition">Master Sushi Rolls</a></li>
                <li><a href="#explore-menu" className="hover:text-orange-500 transition">Organic Greens</a></li>
              </ul>
            </div>

            {/* Corporate options */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase text-gray-500 tracking-wider">Join Us</h5>
              <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("🤝 Recruiter portal launching soon!"); }} className="hover:text-orange-500 transition">Become a Driver</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("🤝 Merchant portal launching soon!"); }} className="hover:text-orange-500 transition">Partner Restaurant</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("🤝 Corporate plans coming soon!"); }} className="hover:text-orange-500 transition">BiteSwift for Business</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("🤝 Franchise options available soon!"); }} className="hover:text-orange-500 transition">Franchise Program</a></li>
              </ul>
            </div>

            {/* Support options */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase text-gray-500 tracking-wider">Support</h5>
              <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("📞 Helpdesk loading..."); }} className="hover:text-orange-500 transition">Customer Care 24/7</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("📞 FAQ list loading..."); }} className="hover:text-orange-500 transition">FAQs & Troubleshooting</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("📞 Operations status page loading..."); }} className="hover:text-orange-500 transition">Operations Status</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); triggerToast("📞 Security center loading..."); }} className="hover:text-orange-500 transition">Safety & Guarantee</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom section with copyright */}
          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-semibold">
            <p>&copy; {new Date().getFullYear()} BiteSwift Technologies Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" onClick={(e) => { e.preventDefault(); triggerToast("⚖️ Privacy policy loading..."); }} className="hover:text-orange-500 transition">Privacy Policy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); triggerToast("⚖️ Terms of use loading..."); }} className="hover:text-orange-500 transition">Terms of Service</a>
              <a href="#" onClick={(e) => { e.preventDefault(); triggerToast("⚖️ Cookie options loading..."); }} className="hover:text-orange-500 transition">Cookie Settings</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
