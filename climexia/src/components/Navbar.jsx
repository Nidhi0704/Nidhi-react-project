import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const TABS = [
  { label: 'Home', page: 'home' },
  { label: 'Store', page: 'store' },
  { label: 'Services', page: 'svcs' },
  { label: 'AMC', page: 'amc' },
  { label: 'Parts', page: 'parts' },
  { label: 'Account', page: 'profile' },
];

export default function Navbar() {
  const { goPage, currentPage, cartCount, setCartOpen, cartOpen, mobOpen, setMobOpen, setAmcModal, showToast } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav id="nav" style={{ boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,.1)' : '0 2px 8px rgba(0,0,0,.08)' }}>
      <div className="nlogo" onClick={() => goPage('home')}>
        <svg className="nlogo-svg" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ACC1"/><stop offset="100%" stopColor="#00E5FF" stopOpacity=".4"/>
            </linearGradient>
            <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6D00"/><stop offset="100%" stopColor="#FF6D00" stopOpacity=".4"/>
            </linearGradient>
            <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004D5B"/><stop offset="100%" stopColor="#006978" stopOpacity=".5"/>
            </linearGradient>
          </defs>
          <path d="M40 5C68 5,77 22,75 40" stroke="url(#lg1)" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M75 40C73 60,59 75,40 75" stroke="url(#lg2)" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M40 75C20 75,5 60,5 40C5 20,20 5,40 5" stroke="url(#lg3)" strokeWidth="9" strokeLinecap="round" fill="none"/>
          <path d="M40 22L40 58M25 31L55 49M55 31L25 49" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
          <text x="40" y="47" textAnchor="middle" fontFamily="Orbitron,monospace" fontSize="21" fontWeight="900" fill="#00ACC1">C</text>
          <circle cx="73" cy="23" r="3.5" fill="#00ACC1" opacity=".9"/>
          <circle cx="52" cy="76" r="3.5" fill="#FF6D00" opacity=".9"/>
          <circle cx="14" cy="57" r="3" fill="#004D5B" opacity=".9"/>
        </svg>
        <div>
          <div className="nbrand">CLIMEXIA</div>
          <span className="nsub">Technologies Pvt Ltd</span>
        </div>
      </div>

      <div className="nsrch">
        <span className="nsrch-ic">🔍</span>
        <input type="text" placeholder="Search AC types, brands, spare parts, services..."
          onChange={e => { if (e.target.value.length > 1) showToast('🔍', 'Searching: ' + e.target.value); }} />
      </div>

      <div className="ntabs">
        {TABS.map(t => (
          <button key={t.label} className={`ntab${currentPage === t.page ? ' on' : ''}`} onClick={() => goPage(t.page)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="nright">
        <button className="ncart" onClick={() => setCartOpen(!cartOpen)}>
          🛒 Cart
          <span className={`cbadge${cartCount > 0 ? ' on' : ''}`}>{cartCount}</span>
        </button>
        <button className="btn btn-c btn-sm" onClick={() => goPage('amc')}>Get AMC Quote</button>
      </div>

      <button className={`ham${mobOpen ? ' open' : ''}`} onClick={() => setMobOpen(!mobOpen)}>
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}