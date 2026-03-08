import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODS, BG } from '../data/constants';
import { fmtP } from '../utils/helpers';

export default function ProductModal() {
  const { prodModal, setProdModal, addCart, showToast, setAmcModal } = useApp();
  const [qty, setQty] = useState(1);
  if (!prodModal.open) return null;
  const p = PRODS.find(x => x.id === prodModal.prodId);
  if (!p) return null;
  const bg = BG[p.cat] || '#E0F7FA';
  const features = [`${p.tons} TR Capacity`,`${p.ref} Refrigerant`,p.star>0?`${p.star}-Star Rating`:'VFD Technology',`${p.cat} Type`,'Warranty Included','Pro Installation'];
  return (
    <div className="modal-bg on" onClick={e => { if(e.target===e.currentTarget) setProdModal({open:false,prodId:null}); }}>
      <div className="mbox">
        <div className="mhd">
          <h3>{p.nm}</h3>
          <button className="mcls" onClick={() => setProdModal({open:false,prodId:null})}>✕</button>
        </div>
        <div className="mbd">
          <div className="prod-d">
            <div className="pd-img" style={{background:bg}}>
              <div style={{width:150,height:130,display:'flex',alignItems:'center',justifyContent:'center'}}
                dangerouslySetInnerHTML={{__html:p.svg}}/>
            </div>
            <div>
              <div style={{fontSize:'.62rem',fontWeight:800,color:'var(--c)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>{p.br} · {p.cat}</div>
              <h2 style={{fontSize:'1.25rem',fontWeight:900,marginBottom:7,lineHeight:1.2}}>{p.nm}</h2>
              <div style={{fontSize:'.84rem',color:'var(--txt2)',marginBottom:12,lineHeight:1.6}}>{p.sub}</div>
              <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:10}}>
                <span style={{color:'var(--star)'}}>{'★'.repeat(Math.floor(p.r))}</span>
                <strong>{p.r}</strong>
                <span style={{fontSize:'.72rem',color:'var(--txt3)'}}>({p.rv.toLocaleString()} reviews)</span>
              </div>
              {p.p > 0 ? (
                <>
                  <div className="pd-p"><sup>₹</sup>{p.p.toLocaleString('en-IN')}</div>
                  <div style={{fontSize:'.78rem',color:'var(--txt3)',marginBottom:12}}>
                    MRP <span style={{textDecoration:'line-through'}}>₹{p.mrp.toLocaleString('en-IN')}</span>{' '}
                    <span style={{color:'var(--green)',fontWeight:800}}>Save ₹{(p.mrp-p.p).toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div style={{fontSize:'.88rem',color:'var(--warm)',fontWeight:800,marginBottom:12}}>💬 Contact for pricing — project specific</div>
              )}
              <div className="pd-fs">
                {features.map(f => <div className="pd-f" key={f}><span className="fi">✓</span>{f}</div>)}
              </div>
              <div className="qrow">
                <button className="qbtn" onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
                <span className="qval">{qty}</span>
                <button className="qbtn" onClick={() => setQty(q => q+1)}>+</button>
                <span style={{fontSize:'.72rem',color:'var(--txt3)'}}>units</span>
              </div>
              <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:12}}>
                <button className="btn btn-c btn-lg" style={{flex:1}} onClick={() => {
                  addCart({id:p.id,nm:p.nm,cat:p.cat,p:p.p,em:'❄️',meta:p.cat,qty});
                  setProdModal({open:false,prodId:null});
                  showToast('🛒','Added to cart');
                }}>{p.p>0?'Add to Cart':'Add to Enquiry'}</button>
                <button className="btn btn-out btn-lg" onClick={() => setAmcModal(true)}>📋 AMC</button>
              </div>
              <table className="spect">
                <tbody>
                  <tr><td>Brand</td><td>{p.br}</td></tr>
                  <tr><td>Category</td><td>{p.cat}</td></tr>
                  <tr><td>Capacity</td><td>{p.tons} TR</td></tr>
                  <tr><td>Refrigerant</td><td>{p.ref}</td></tr>
                  {p.star>0 && <tr><td>Energy</td><td>{'★'.repeat(p.star)} ({p.star}-Star)</td></tr>}
                  <tr><td>Model</td><td style={{fontFamily:'monospace',fontSize:'.72rem'}}>{p.id.toUpperCase()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}