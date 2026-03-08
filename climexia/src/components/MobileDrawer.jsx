import React from 'react';
import { useApp } from '../context/AppContext';

export default function MobileDrawer() {
  const { mobOpen, setMobOpen, goPage, setCartOpen, setAmcModal } = useApp();
  const close = () => setMobOpen(false);
  return (
    <div className={`mdrawer${mobOpen ? ' open' : ''}`}>
      <div className="mlink" onClick={() => { goPage('home'); close(); }}><span>🏠</span> Home</div>
      <div className="mlink" onClick={() => { goPage('store'); close(); }}><span>🏪</span> Equipment Store</div>
      <div className="mlink" onClick={() => { goPage('svcs'); close(); }}><span>❄️</span> AC Services</div>
      <div className="mlink" onClick={() => { goPage('amc'); close(); }}><span>📋</span> AMC Plans</div>
      <div className="mlink" onClick={() => { goPage('parts'); close(); }}><span>🔩</span> Spare Parts</div>
      <div style={{height:1,background:'var(--bdr)',margin:'8px 0'}}></div>
      <div className="mlink" onClick={() => { goPage('profile'); close(); }}><span>👤</span> My Account</div>
      <div className="mlink" onClick={() => { setCartOpen(true); close(); }}><span>🛒</span> Cart</div>
      <div style={{height:1,background:'var(--bdr)',margin:'8px 0'}}></div>
      <div className="mlink" onClick={() => { setAmcModal(true); close(); }}><span>📞</span> Quick AMC Quote</div>
    </div>
  );
}