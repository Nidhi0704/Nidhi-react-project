import React from 'react';
import { useApp } from '../context/AppContext';

export default function SparePartCard({ s, mode = 'grid' }) {
  const { addCart, showToast } = useApp();
  const style = mode === 'scroll' ? {width:190,flexShrink:0,scrollSnapAlign:'start'} : {width:'auto'};
  return (
    <div className="pcard fade" style={style}>
      <div className="pc-img" style={{background:'#F2F6F9',height:105}}>
        {s.badge && <div className="pc-tag" style={{background:'var(--c)'}}>{s.badge}</div>}
        {!s.stk && <div className="pc-tag" style={{top:'auto',bottom:5,right:5,left:'auto',background:'var(--red)',fontSize:'.52rem'}}>Out of Stock</div>}
        <div style={{width:50,height:50,display:'flex',alignItems:'center',justifyContent:'center'}}
          dangerouslySetInnerHTML={{__html:s.svg}}/>
      </div>
      <div className="pc-bd">
        <div className="pc-cat">{s.br} · {s.cat}</div>
        <div className="pc-nm" style={{fontSize:'.8rem'}}>{s.nm}</div>
        <div className="pc-sub" style={{fontSize:'.65rem'}}>{s.compat} · {s.wty}</div>
        <div className="pc-ft">
          <div>
            <span className="pc-p" style={{fontSize:'.84rem'}}>₹{s.p.toLocaleString('en-IN')}</span>
            <span className="pc-m">₹{s.mrp.toLocaleString('en-IN')}</span>
          </div>
          <button className="pc-add" disabled={!s.stk} onClick={() => {
            addCart({id:s.id,nm:s.nm,cat:s.cat,p:s.p,em:'🔩',meta:s.mdl,qty:1});
            showToast('🛒','Part added');
          }}>{s.stk?'+':'—'}</button>
        </div>
      </div>
    </div>
  );
}