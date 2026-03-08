import React, { useState, useMemo } from 'react';
import { SVCS } from '../data/constants';
import { useApp } from '../context/AppContext';

export default function ServicesPage() {
  const { addCart, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const filtered = useMemo(() =>
    SVCS.filter(s=>(!query||(s.nm+s.sub).toLowerCase().includes(query.toLowerCase()))&&(!cat||s.cat===cat)),
    [query,cat]
  );
  return (
    <div className="page on" id="svcs">
      <div className="sec">
        <div className="sec-head">
          <div className="eyebrow">HVAC Services</div>
          <h2 className="sh">All AC Repair & Maintenance Services</h2>
        </div>
        <div className="toolbar">
          <input className="tsrch" type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Search services..."/>
          <select className="tsel" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All Categories</option>
            <option>Domestic</option><option>Commercial</option><option>Industrial</option>
          </select>
        </div>
        <div className="pgrid">
          {filtered.map(s => (
            <div key={s.id} className="pcard fw fade" style={{width:'auto'}}>
              <div className="pc-img" style={{background:'linear-gradient(135deg,var(--cl),var(--cm))',height:115}}>
                <div className="pc-off">{s.off}</div>
                <div style={{width:68,height:58,display:'flex',alignItems:'center',justifyContent:'center'}} dangerouslySetInnerHTML={{__html:s.svg}}/>
              </div>
              <div className="pc-bd">
                <div className="pc-cat">{s.cat}</div>
                <div className="pc-nm">{s.nm}</div>
                <div className="pc-sub">{s.sub}</div>
                <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:7}}>
                  <span className="pc-stars">★★★★★</span>
                  <span style={{fontSize:'.68rem',fontWeight:800}}>{s.r}</span>
                  <span className="pc-rv">({s.rv.toLocaleString()})</span>
                </div>
                <div className="pc-ft">
                  <div>
                    <span className="pc-p">{s.p>0?'₹'+s.p.toLocaleString('en-IN'):'Custom'}</span>
                    {s.mrp>0 && <span className="pc-m">₹{s.mrp.toLocaleString('en-IN')}</span>}
                  </div>
                  <button className="pc-add" onClick={()=>{addCart({id:s.id,nm:s.nm,cat:s.cat,p:s.p||0,em:'🔧',meta:s.cat+' Service',qty:1});showToast('🛒','Service added');}}>
                    {s.p>0?'Book':'Enquire'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}