import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRole }) {
  const userString = localStorage.getItem('currentUser')
  
  if (!userString) {
    // User is not logged in, redirect to login screen
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userString)
    
    if (!user || user.role !== allowedRole) {
      // Mismatched role: redirect customer away from restaurant and vice-versa
      const fallbackPath = user.role === 'restaurant' ? '/restaurant-dashboard' : '/customer-dashboard'
      return <Navigate to={fallbackPath} replace />
    }
  } catch (e) {
    // Session is corrupted: clear all auth state and send to login
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    return <Navigate to="/login" replace />
  }

  // Session and role validated, render target route
  return children
}
