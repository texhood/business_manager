import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

const TAX_RATE = 0.0825; // 8.25%

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [orderType, setOrderType] = useState('takeout');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');

  // Calculate item price including modifications
  const getItemPrice = (item) => {
    const basePrice = parseFloat(item.price) || 0;
    const modsPrice = (item.modifications || []).reduce((sum, mod) => {
      // Handle both object mods (with price) and string mods (legacy, no price)
      if (typeof mod === 'object' && mod.price) {
        return sum + parseFloat(mod.price);
      }
      return sum;
    }, 0);
    return basePrice + modsPrice;
  };

  const addItem = (item) => {
    // Always add as new line item (don't combine) since modifications may differ
    setItems(currentItems => [...currentItems, {
      ...item,
      quantity: 1,
      modifications: item.modifications || [],
      special_instructions: item.special_instructions || ''
    }]);
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    setItems(currentItems => {
      const newItems = [...currentItems];
      newItems[index].quantity = quantity;
      return newItems;
    });
  };

  const updateItemModifications = (index, modifications, specialInstructions) => {
    setItems(currentItems => {
      const newItems = [...currentItems];
      newItems[index] = {
        ...newItems[index],
        modifications: modifications || [],
        special_instructions: specialInstructions || ''
      };
      return newItems;
    });
  };

  const removeItem = (index) => {
    setItems(currentItems => currentItems.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
    setCustomerName('');
    setPhoneNumber('');
    setTableNumber('');
    setKitchenNotes('');
  };

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = getItemPrice(item);
      return sum + (itemPrice * item.quantity);
    }, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }, [items]);

  const value = {
    items,
    orderType,
    customerName,
    phoneNumber,
    tableNumber,
    kitchenNotes,
    subtotal,
    tax,
    total,
    getItemPrice, // Export for use in Cart display
    addItem,
    updateQuantity,
    updateItemModifications,
    removeItem,
    clearCart,
    setOrderType,
    setCustomerName,
    setPhoneNumber,
    setTableNumber,
    setKitchenNotes
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
