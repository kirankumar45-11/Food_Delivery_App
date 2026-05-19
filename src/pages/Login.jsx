import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldAlert, Loader, Info } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  // Input fields state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Visual UI states
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Auto-fill from recent registration if present
  useEffect(() => {
    const lastSignup = localStorage.getItem('biteswift_last_signup')
    if (lastSignup) {
      try {
        const parsed = JSON.parse(lastSignup)
        if (parsed && parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }))
        }
      } catch (e) {
        console.error("Error parsing last signup details", e)
      }
    }
  }, [])

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear errors as they type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (errors.auth) {
      setErrors(prev => ({ ...prev, auth: '' }))
    }
  }

  // Basic Form Validation
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email format'
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Submit & Auth logic
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Invalid email or password')
      }

      const data = await res.json()
      const token = data.access_token
      const user = {
        fullName: data.user.full_name,
        email: data.user.email,
        role: data.user.role
      }

      // Save token and user details to localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      // Clear any previous user's cart and stale checkout data
      localStorage.removeItem('cartItems')
      localStorage.removeItem('lastCheckedOutCart')
      // Remove last signup helper to keep state tidy
      localStorage.removeItem('biteswift_last_signup')

      setIsSubmitting(false)
      setSuccessMessage(`Welcome back, ${user.fullName}!`)
      
      // Role-based Routing redirect
      setTimeout(() => {
        if (user.role === 'restaurant') {
          navigate('/restaurant-dashboard')
        } else {
          navigate('/customer-dashboard')
        }
      }, 1200)

    } catch (err) {
      console.warn("FastAPI offline or login error, falling back to simulated localStorage auth:", err)
      
      const emailLower = formData.email.toLowerCase()
      const enteredPass = formData.password
      
      let loggedUser = null

      // Check against Local DB users
      const users = JSON.parse(localStorage.getItem('biteswift_users') || '[]')
      const matchedUser = users.find(u => u.email.toLowerCase() === emailLower && u.password === enteredPass)
      
      if (matchedUser) {
        loggedUser = {
          fullName: matchedUser.fullName,
          email: matchedUser.email,
          role: matchedUser.role
        }
      } else if (emailLower === 'customer@biteswift.com' && enteredPass === 'password') {
        loggedUser = {
          fullName: 'Alice Smith',
          email: 'customer@biteswift.com',
          role: 'customer'
        }
      } else if (emailLower === 'chef@biteswift.com' && enteredPass === 'password') {
        loggedUser = {
          fullName: 'Chef Gusteau',
          email: 'chef@biteswift.com',
          role: 'restaurant'
        }
      }

      if (loggedUser) {
        localStorage.setItem('accessToken', 'mock-offline-token-12345')
        localStorage.setItem('currentUser', JSON.stringify(loggedUser))
        // Clear any previous user's cart and stale checkout data
        localStorage.removeItem('cartItems')
        localStorage.removeItem('lastCheckedOutCart')
        localStorage.removeItem('biteswift_last_signup')

        setIsSubmitting(false)
        setSuccessMessage(`Welcome back, ${loggedUser.fullName}!`)
        
        setTimeout(() => {
          if (loggedUser.role === 'restaurant') {
            navigate('/restaurant-dashboard')
          } else {
            navigate('/customer-dashboard')
          }
        }, 1200)
      } else {
        setErrors({ auth: err.message || 'Invalid email or password. Please try again.' })
        setIsSubmitting(false)
      }
    }
  }

  // Fast demo sign-in helper
  const handleQuickSignIn = (role) => {
    if (role === 'customer') {
      setFormData({ email: 'customer@biteswift.com', password: 'password' })
    } else {
      setFormData({ email: 'chef@biteswift.com', password: 'password' })
    }
    // Clear errors
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-400/10 rounded-full blur-3xl" />

      {/* Floating Home navigation */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 transition duration-200 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-orange-500 to-red-600 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 mb-3 animate-pulse-soft">
            <ShoppingBag size={28} className="stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center">
            Sign In to BiteSwift
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Access your custom dashboard and track gourmet trays
          </p>
        </div>

        {/* Login form Card */}
        <div className="bg-white py-8 px-4 sm:px-10 rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100/50 space-y-6">
          
          {successMessage ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{successMessage}</h3>
              <p className="text-sm text-gray-500 font-medium animate-pulse">
                Entering dashboard workspace...
              </p>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                
                {/* General Auth Failure Message */}
                {errors.auth && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold leading-relaxed animate-pulse-soft">
                    <ShieldAlert size={20} className="shrink-0" />
                    <span>{errors.auth}</span>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. customer@biteswift.com"
                      className={`w-full pl-11 pr-4 py-3 bg-[#fafaf8] border rounded-2xl focus:outline-none focus:ring-2 transition text-sm font-semibold text-gray-800 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                      <ShieldAlert size={12} />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-[10px] font-bold text-orange-500 hover:text-orange-600"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-11 py-3 bg-[#fafaf8] border rounded-2xl focus:outline-none focus:ring-2 transition text-sm font-semibold text-gray-800 ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                      <ShieldAlert size={12} />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Sign In Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm tracking-wide"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span>Verifying account...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </div>

              </form>

              {/* Demo Credentials alert box */}
              <div className="bg-orange-500/5 border border-orange-500/15 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <Info size={16} />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Demo / Test Logins</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                  You can register a custom account above or click below to quickly fill built-in role credentials:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('customer')}
                    className="bg-white hover:bg-orange-50 border border-gray-200/60 p-2 rounded-xl text-[10px] font-bold text-gray-700 flex flex-col items-center justify-center gap-0.5 hover:border-orange-200 transition"
                  >
                    <span className="text-orange-600">Customer Test</span>
                    <span className="text-gray-400 font-medium">customer@biteswift.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('restaurant')}
                    className="bg-white hover:bg-orange-50 border border-gray-200/60 p-2 rounded-xl text-[10px] font-bold text-gray-700 flex flex-col items-center justify-center gap-0.5 hover:border-orange-200 transition"
                  >
                    <span className="text-orange-600">Restaurant Test</span>
                    <span className="text-gray-400 font-medium">chef@biteswift.com</span>
                  </button>
                </div>
              </div>

              {/* Switch options */}
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-orange-500 hover:text-orange-600 font-bold underline focus:outline-none cursor-pointer"
                  >
                    Sign Up Now
                  </button>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
      
    </div>
  )
}
