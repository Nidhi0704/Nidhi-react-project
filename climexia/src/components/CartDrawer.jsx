import React from 'react';
import { useApp } from '../context/AppContext';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeCart, changeQty, showToast } = useApp();
  const sub = cart.reduce((s, c) => s + c.p * c.qty, 0);
  const gst = Math.round(sub * 0.18);
  return (
    <>
      <div className={`cartbg${cartOpen ? ' on' : ''}`} onClick={() => setCartOpen(false)} />
      <aside className={`cdrawer${cartOpen ? ' open' : ''}`}>
        <div className="cdhd">
          <div className="cdhd-t">🛒 Cart &amp; Enquiry</div>
          <button className="cdcls" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cdbody">
          {cart.length === 0 ? (
            <div className="cdempty">
              <div style={{fontSize:'3rem',opacity:.15}}>🛒</div>
              <p style={{fontSize:'.82rem',color:'var(--txt3)',fontWeight:700}}>Cart is empty.</p>
            </div>
          ) : cart.map(c => (
            <div className="cditem" key={c.id}>
              <div className="cdi-img">{c.em || '❄️'}</div>
              <div className="cdi-inf">
                <div className="cdi-nm">{c.nm}</div>
                <div className="cdi-meta">{c.meta}</div>
                <div className="cdi-p">₹{(c.p * c.qty).toLocaleString('en-IN')}</div>
                <div className="cdqty">
                  <button className="cqb" onClick={() => changeQty(c.id, -1)}>−</button>
                  <span className="cqn">{c.qty}</span>
                  <button className="cqb" onClick={() => changeQty(c.id, 1)}>+</button>
                </div>
              </div>
              <button className="cddel" onClick={() => removeCart(c.id)}>✕</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cdft">
            <div className="cdsr"><span>Subtotal</span><span>₹{sub.toLocaleString('en-IN')}</span></div>
            <div className="cdsr"><span>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
            <div className="cdsr tot"><span>Total</span><span>₹{(sub+gst).toLocaleString('en-IN')}</span></div>
            <button className="btn btn-c btn-blk btn-lg" onClick={() => { setCartOpen(false); showToast('✅','Proceeding to checkout...'); }}>
              Proceed to Book →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}