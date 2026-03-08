import React from 'react';
import { useApp } from '../context/AppContext';
import { BG, TC } from '../data/constants';
import { fmtP } from '../utils/helpers';

export default function ProductCard({ p, mode = 'grid' }) {
  const { addCart, showToast, setProdModal } = useApp();
  const bg = BG[p.cat] || '#E0F7FA';
  const tc = TC[p.cat] || '#00ACC1';
  const style = mode === 'scroll' ? {width:208,flexShrink:0,scrollSnapAlign:'start'} : {width:'auto'};
  return (
    <div className="pcard fade" style={style} onClick={() => setProdModal({open:true,prodId:p.id})}>
      <div className="pc-img" style={{background:bg}}>
        {p.tag && <div className="pc-tag" style={{background:tc}}>{p.tag}</div>}
        {p.isNew && <div className="pc-tag" style={{top:'auto',bottom:7,left:7,background:'var(--warm)'}}>NEW</div>}
        <div className="pc-off">{p.off}%</div>
        <div style={{width:78,height:68,display:'flex',alignItems:'center',justifyContent:'center'}}
          dangerouslySetInnerHTML={{__html:p.svg}}/>
      </div>
      <div className="pc-bd">
        <div className="pc-cat">{p.br} · {p.cat}</div>
        <div className="pc-nm">{p.nm}</div>
        <div className="pc-sub">{p.sub}</div>
        <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:7}}>
          <span className="pc-stars">{'★'.repeat(Math.floor(p.r))}</span>
          <span style={{fontSize:'.68rem',fontWeight:800}}>{p.r}</span>
          <span className="pc-rv">({p.rv.toLocaleString()})</span>
        </div>
        <div className="pc-ft">
          <div>
            <span className="pc-p">{fmtP(p.p)}</span>
            {p.mrp>0 && <span className="pc-m">{fmtP(p.mrp)}</span>}
          </div>
          <button className="pc-add" onClick={e => {
            e.stopPropagation();
            addCart({id:p.id,nm:p.nm,cat:p.cat,p:p.p,em:'❄️',meta:p.cat,qty:1});
            showToast('🛒','Added to cart');
          }}>{p.p>0?'+':'Enq'}</button>
        </div>
      </div>
    </div>
  );
}