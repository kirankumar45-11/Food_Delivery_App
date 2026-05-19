import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, User, Mail, Lock, Briefcase, Eye, EyeOff, ShieldAlert, Loader } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  // Input fields state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer' // default to customer
  })

  // Visual UI states
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field-specific error as they type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Basic Form Validation
  const validateForm = () => {
    const newErrors = {}
    
    // Check required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else {
      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email format'
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Registration failed')
      }

      const user = await res.json()
      
      // Store signup credentials to auto-fill the login form
      localStorage.setItem('biteswift_last_signup', JSON.stringify({ email: user.email, role: user.role }))

      setSuccessMessage('🎉 Account created successfully!')
      
      // Redirect to /login after a brief delay so they see the success message
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      console.warn("FastAPI offline or registration error:", err)
      setErrors({ email: err.message || 'Failed to connect to backend server. Is the API online?' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background abstract designs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-400/10 rounded-full blur-3xl" />

      {/* Floating Home Link */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-orange-500 transition duration-200 cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-orange-500 to-red-600 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 mb-3">
            <ShoppingBag size={28} className="stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Join BiteSwift & taste gourmet fresh convenience
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 sm:px-10 rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100/50">
          
          {successMessage ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{successMessage}</h3>
              <p className="text-sm text-gray-500 font-medium animate-pulse">
                Redirecting to sign in screen...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              
              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Chef Ramsey"
                    className={`w-full pl-11 pr-4 py-3 bg-[#fafaf8] border rounded-2xl focus:outline-none focus:ring-2 transition text-sm font-semibold text-gray-800 ${
                      errors.fullName 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                    <ShieldAlert size={12} />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
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
                    placeholder="ramsey@kitchen.com"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Password
                </label>
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

              {/* Role Selector Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Choose Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  
                  {/* Customer role button option */}
                  <label className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    formData.role === 'customer'
                      ? 'border-orange-500 bg-orange-500/5 text-orange-600 font-extrabold ring-1 ring-orange-500'
                      : 'border-gray-200 bg-[#fafaf8] text-gray-600 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xs sm:text-sm">Customer Portal</span>
                  </label>

                  {/* Restaurant role button option */}
                  <label className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    formData.role === 'restaurant'
                      ? 'border-orange-500 bg-orange-500/5 text-orange-600 font-extrabold ring-1 ring-orange-500'
                      : 'border-gray-200 bg-[#fafaf8] text-gray-600 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="restaurant"
                      checked={formData.role === 'restaurant'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xs sm:text-sm">Restaurant Console</span>
                  </label>

                </div>
              </div>

              {/* Signup Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm tracking-wide"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Footer Card Navigation */}
          {!successMessage && (
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs font-semibold text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-orange-500 hover:text-orange-600 font-bold underline focus:outline-none cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
      
    </div>
  )
}
