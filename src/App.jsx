import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import Login from './pages/Login'
import CustomerDashboard from './pages/CustomerDashboard'
import RestaurantDashboard from './pages/RestaurantDashboard'
import Menu from './pages/Menu'
import Checkout from './pages/Checkout'
import OrderStatusTracker from './pages/OrderStatusTracker'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDrawer />
        <Routes>
          {/* Core Public Access Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Guarded Customer Dashboard Route */}
          <Route 
            path="/customer-dashboard" 
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Guarded Customer Menu Route */}
          <Route 
            path="/menu/:id" 
            element={
              <ProtectedRoute allowedRole="customer">
                <Menu />
              </ProtectedRoute>
            } 
          />

          {/* Guarded Checkout Route */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRole="customer">
                <Checkout />
              </ProtectedRoute>
            } 
          />

          {/* Guarded Customer Order Status Tracker Route */}
          <Route 
            path="/order-tracker/:order_id" 
            element={
              <ProtectedRoute allowedRole="customer">
                <OrderStatusTracker />
              </ProtectedRoute>
            } 
          />
          
          {/* Guarded Restaurant Dashboard Route */}
          <Route 
            path="/restaurant-dashboard" 
            element={
              <ProtectedRoute allowedRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Dynamic Catch-All 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf7] text-center p-8">
                <div className="bg-orange-500/10 border border-orange-500/25 p-6 rounded-3xl mb-6 text-orange-600 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-6xl font-black text-gray-900 tracking-tight mb-2">404</h1>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Kitchen is Closed Here</h2>
                <p className="text-gray-500 font-medium max-w-md mb-8">
                  The page you are looking for has been eaten or never existed. Let's get you back to delicious options.
                </p>
                <a 
                  href="/"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300 inline-block"
                >
                  Back to Home
                </a>
              </div>
            } 
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App

