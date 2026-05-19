import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  // Read persistent cart listings from local storage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.warn("Failed to load cartItems from localStorage, starting empty:", e)
      return []
    }
  })
  
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sync cart listings to localStorage on change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
    // Maintain simplified legacy cartCount key for any decoupled navigation items
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    localStorage.setItem('cartCount', count.toString())
  }, [cartItems])

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const exists = prevItems.find((prev) => prev.id === item.id)
      if (exists) {
        return prevItems.map((prev) => 
          prev.id === item.id ? { ...prev, quantity: prev.quantity + 1 } : prev
        )
      }
      // Add new item with default quantity of 1
      return [...prevItems, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const exists = prevItems.find((prev) => prev.id === itemId)
      if (!exists) return prevItems
      if (exists.quantity === 1) {
        // Strip item from the list completely
        return prevItems.filter((prev) => prev.id !== itemId)
      }
      return prevItems.map((prev) => 
        prev.id === itemId ? { ...prev, quantity: prev.quantity - 1 } : prev
      )
    })
  }

  const removeItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((prev) => prev.id !== itemId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev)
  }

  // Calculated getters
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      removeItem,
      clearCart,
      toggleCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }
  return context
}
