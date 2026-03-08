import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, icon: '', msg: '' });
  const [mobOpen, setMobOpen] = useState(false);
  const [prodModal, setProdModal] = useState({ open: false, prodId: null });
  const [amcModal, setAmcModal] = useState(false);

  const goPage = useCallback((id) => {
    setCurrentPage(id);
    setMobOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showToast = useCallback((icon, msg) => {
    setToast({ visible: true, icon, msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  const addCart = useCallback((item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeCart = useCallback((id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  }, []);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <AppContext.Provider value={{
      currentPage, goPage,
      cart, cartCount, addCart, removeCart, changeQty,
      cartOpen, setCartOpen,
      toast, showToast,
      mobOpen, setMobOpen,
      prodModal, setProdModal,
      amcModal, setAmcModal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}