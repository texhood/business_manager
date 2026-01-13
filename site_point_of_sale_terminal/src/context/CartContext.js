import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

const TAX_RATE = 0.0825; // 8.25% Texas sales tax

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product) => {
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Increase quantity
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      
      // Add new item
      return [...currentItems, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image_url: product.image_url
      }];
    });
  };

  const removeItem = (productId) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const incrementQuantity = (productId) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === productId);
      if (item && item.quantity <= 1) {
        return currentItems.filter(i => i.id !== productId);
      }
      return currentItems.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    ...totals
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
