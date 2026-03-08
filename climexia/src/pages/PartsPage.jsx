import React, { useState, useMemo } from 'react';
import { PARTS } from '../data/constants';
import { fmtP } from '../utils/helpers';
import SparePartCard from '../components/SparePartCard';

export default function PartsPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');
  const [maxP, setMaxP] = useState(200000);
  const [stkOnly, setStkOnly] = useState(false);
  const filtered = useMemo(() =>
    PARTS.filter(s=>(!query||(s.nm+s.br+s.mdl).toLowerCase().includes(query.toLowerCase()))&&(!cat||s.cat===cat)&&(!brand||s.br===brand)&&s.p<=maxP&&(!stkOnly||s.stk)),
    [query,cat,brand,maxP,stkOnly]
  );
  return (
    <div className="page on" id="parts">
      <div className="sec">
        <div className="sec-head">
          <div className="eyebrow">Spare Parts</div>
          <h2 className="sh">Genuine OEM HVAC Parts — 1000+ SKUs</h2>
        </div>
        <div className="toolbar">
          <input className="tsrch" type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Part name, model, brand..."/>
          <select className="tsel" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All Categories</option>
            {['Compressor','PCB Board','Fan Motor','Air Filter','Capacitor','Sensor','Expansion Valve','Heat Exchanger'].map(o=><option key={o}>{o}</option>)}
          </select>
          <select className="tsel" value={brand} onChange={e=>setBrand(e.target.value)}>
            <option value="">All Brands</option>
            {['LG','Daikin','Carrier','Samsung','Voltas','Danfoss','Honeywell'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="stor-wrap">
          <div className="fpanel">
            <div className="fp-t">Filters</div>
            <div className="fpg">
              <div className="fpg-l">Category</div>
              {['Compressor','PCB Board','Fan Motor','Air Filter','Capacitor','Sensor','Expansion Valve'].map(t=>(
                <label className="fpck" key={t}><input type="checkbox" onChange={()=>setCat(c=>c===t?'':t)} checked={cat===t}/> {t}</label>
              ))}
            </div>
            <div className="fpg">
              <div className="fpg-l">Max Price</div>
              <input type="range" className="fpr" min="100" max="200000" value={maxP} onChange={e=>setMaxP(+e.target.value)}/>
              <div className="fprv"><span>₹100</span><span>{fmtP(maxP)}</span></div>
            </div>
            <div className="fpg">
              <div className="fpg-l">Availability</div>
              <label className="fpck"><input type="checkbox" checked={stkOnly} onChange={e=>setStkOnly(e.target.checked)}/> In Stock Only</label>
            </div>
          </div>
          <div className="pgrid">
            {filtered.length ? filtered.map(s=><SparePartCard key={s.id} s={s} mode="grid"/>)
              : <p style={{color:'var(--txt3)',gridColumn:'1/-1',textAlign:'center',padding:44,fontWeight:700}}>No parts found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}