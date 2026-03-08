import React, { useState, useMemo } from 'react';
import { PRODS } from '../data/constants';
import { fmtP } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');
  const [maxP, setMaxP] = useState(10000000);
  const [sort, setSort] = useState('def');

  const filtered = useMemo(() => {
    let data = PRODS.filter(p =>
      (!query||(p.nm+p.br+p.sub).toLowerCase().includes(query.toLowerCase())) &&
      (!cat||p.cat===cat) && (!brand||p.br===brand) && p.p<=maxP
    );
    if(sort==='asc') data=[...data].sort((a,b)=>a.p-b.p);
    else if(sort==='desc') data=[...data].sort((a,b)=>b.p-a.p);
    else if(sort==='top') data=[...data].sort((a,b)=>b.r-a.r);
    else if(sort==='new') data=[...data.filter(x=>x.isNew),...data.filter(x=>!x.isNew)];
    return data;
  }, [query,cat,brand,maxP,sort]);

  return (
    <div className="page on" id="store">
      <div className="sec">
        <div className="sec-head">
          <div className="eyebrow">Equipment Store</div>
          <h2 className="sh">New HVAC Equipment — All Types</h2>
          <p className="ss">Split ACs, VRF, Ducted, Chillers, AHUs, Package Units, Cooling Towers & more.</p>
        </div>
        <div className="toolbar">
          <input className="tsrch" type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Search product, brand, model..."/>
          <select className="tsel" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">All Types</option>
            {['Split AC','Cassette AC','Ducted AC','VRF/VRV System','Package Unit','Chiller','AHU','FCU','Cooling Tower'].map(o=><option key={o}>{o}</option>)}
          </select>
          <select className="tsel" value={brand} onChange={e=>setBrand(e.target.value)}>
            <option value="">All Brands</option>
            {['Daikin','Carrier','LG','Samsung','Voltas','Blue Star','Hitachi','Mitsubishi','O-General','Trane'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="spills">
          {[['def','Default'],['asc','Price ↑'],['desc','Price ↓'],['top','Top Rated'],['new','New']].map(([s,l])=>(
            <div key={s} className={`sp${sort===s?' on':''}`} onClick={()=>setSort(s)}>{l}</div>
          ))}
        </div>
        <div className="stor-wrap">
          <div className="fpanel">
            <div className="fp-t">Filters</div>
            <div className="fpg">
              <div className="fpg-l">Equipment Type</div>
              {['Split AC','Cassette AC','Ducted AC','VRF/VRV System','Package Unit','Chiller','AHU','FCU','Cooling Tower'].map(t=>(
                <label className="fpck" key={t}><input type="checkbox" onChange={()=>setCat(c=>c===t?'':t)} checked={cat===t}/> {t}</label>
              ))}
            </div>
            <div className="fpg">
              <div className="fpg-l">Max Price</div>
              <input type="range" className="fpr" min="10000" max="10000000" value={maxP} onChange={e=>setMaxP(+e.target.value)}/>
              <div className="fprv"><span>₹10K</span><span>{fmtP(maxP)}</span></div>
            </div>
            <div className="fpg">
              <div className="fpg-l">Capacity</div>
              {['Up to 2 TR','2–10 TR','10–100 TR','100 TR+'].map(t=><label className="fpck" key={t}><input type="checkbox"/> {t}</label>)}
            </div>
            <div className="fpg">
              <div className="fpg-l">Refrigerant</div>
              {['R-32','R-410A','R-134a','R-22'].map(t=><label className="fpck" key={t}><input type="checkbox"/> {t}</label>)}
            </div>
          </div>
          <div className="pgrid">
            {filtered.length ? filtered.map(p=><ProductCard key={p.id} p={p} mode="grid"/>)
              : <p style={{color:'var(--txt3)',gridColumn:'1/-1',textAlign:'center',padding:44,fontWeight:700}}>No products match filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}