import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATS, CMAP, PRODS, PARTS, QT, HOW, REV } from '../data/constants';
import ProductCard from '../components/ProductCard';
import SparePartCard from '../components/SparePartCard';

function StatCounter({ to }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated.current) {
        animated.current = true;
        const dur = 1800, start = Date.now();
        const step = () => { const p = Math.min((Date.now()-start)/dur,1); setVal(Math.floor(p*to)); if(p<1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
    }, {threshold:0.5});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span className="snum" ref={ref}>{val>=1000?val.toLocaleString('en-IN')+'+':val+(val>=to?'+':'')}</span>;
}

function FadeEl({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => { if(entries[0].isIntersecting){setVisible(true);obs.disconnect();} },{threshold:0.1});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`fade${visible?' in':''}`} style={{transitionDelay:`${delay}s`}}>{children}</div>;
}

export default function HomePage() {
  const { goPage, showToast } = useApp();
  const [hcat, setHcat] = useState('split');
  const [locVal, setLocVal] = useState('');
  const catProds = PRODS.filter(p => p.cat === (CMAP[hcat] || 'Split AC'));

  return (
    <div className="page on" id="home">
      {/* HERO */}
      <div className="hero">
        <div className="hero-in">
          <div className="hpill"><span className="hdot"></span> India's Premier HVAC Platform</div>
          <h1>Total HVAC Solutions,<br/><em>One Platform.</em></h1>
          <p className="hero-sub">Split ACs to Chillers — equipment sales, installation, genuine parts & Carrier-class AMC contracts. Certified. Fast. Transparent.</p>
          <div className="lbar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00ACC1" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <input type="text" value={locVal} onChange={e => setLocVal(e.target.value)} placeholder="Enter city, area or project site..."/>
            <div className="lbar-sep"></div>
            <div className="lbar-det" onClick={() => { setLocVal('Detecting...'); setTimeout(()=>{setLocVal('Kothrud, Pune, MH');showToast('📍','Location detected');},700); }}>📡 Detect</div>
            <button className="lbar-btn" onClick={() => { if(!locVal.trim()){showToast('⚠️','Enter location first');return;} showToast('✅','Services loaded for '+locVal); }}>Find Services</button>
          </div>
          <div className="htrust">
            <div className="ht">✅ 10,000+ Customers</div>
            <div className="ht">⚡ Pan-India Coverage</div>
            <div className="ht">🏭 Domestic to Industrial</div>
            <div className="ht">📋 Carrier-Class AMC</div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="sbar">
        {[{to:10000,lbl:'Customers'},{to:500,lbl:'Technicians'},{to:50,lbl:'AC Brands'},{to:2500,lbl:'AMC Contracts'},{to:24,lbl:'Cities'}].map((s,i) => (
          <React.Fragment key={s.lbl}>
            {i>0 && <div className="sdiv"></div>}
            <div className="si"><StatCounter to={s.to}/><span className="slbl">{s.lbl}</span></div>
          </React.Fragment>
        ))}
      </div>

      {/* CATEGORIES */}
      <div className="sec sec-alt">
        <div className="srow">
          <div><div className="eyebrow">Equipment Categories</div><h2 className="sh">What are you looking for?</h2></div>
          <span className="sall" onClick={() => goPage('store')}>Browse all →</span>
        </div>
        <div className="catrow">
          {CATS.map(c => (
            <div key={c.id} className={`cat-i${hcat===c.id?' on':''}`} onClick={() => setHcat(c.id)}>
              <div className="ciw"><div className="cisvg" dangerouslySetInnerHTML={{__html:c.svg}}/></div>
              <div className="cilbl">{c.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:20}}>
          <div className="hscroll">
            {catProds.map(p => <ProductCard key={p.id} p={p} mode="scroll"/>)}
          </div>
        </div>
      </div>

      {/* QUICK BOOK */}
      <div className="sec">
        <div className="sec-head c">
          <div className="eyebrow">Quick Book</div>
          <h2 className="sh">What does your system need?</h2>
          <p className="ss">Tap any service to instantly book a certified HVAC technician.</p>
        </div>
        <div className="qtg">
          {QT.map((t,i) => (
            <FadeEl key={t.nm} delay={i*0.07}>
              <div className="qt" onClick={() => showToast('⚡',`Booking ${t.nm}...`)}>
                <div className="qt-ic" dangerouslySetInnerHTML={{__html:t.svg}}/>
                <div className="qt-nm">{t.nm}</div>
                <div className="qt-p">{t.p}</div>
              </div>
            </FadeEl>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="sec sec-alt">
        <div className="sec-head c"><div className="eyebrow">Our Process</div><h2 className="sh">How Climexia Works</h2></div>
        <div className="howw">
          {HOW.map((s,i) => (
            <FadeEl key={s.tt} delay={i*0.1}>
              <div className="how-s">
                <div style={{position:'relative',display:'inline-block'}}>
                  <div className="how-c" dangerouslySetInnerHTML={{__html:s.svg}}/>
                  <div className="how-n">{i+1}</div>
                </div>
                <div><div className="how-tt">{s.tt}</div><div className="how-d">{s.d}</div></div>
              </div>
            </FadeEl>
          ))}
        </div>
      </div>

      {/* AMC BANNER */}
      <div className="sec">
        <div style={{background:'linear-gradient(135deg,#003844 0%,#005B6E 45%,#0097A7 100%)',borderRadius:18,padding:'44px 6%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:0,top:0,bottom:0,width:'44%',background:'radial-gradient(ellipse at 70% 50%,rgba(0,229,255,.08),transparent 70%)',pointerEvents:'none'}}></div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:'.64rem',fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:'rgba(255,255,255,.52)',marginBottom:9}}>Dynamic AMC — Carrier CRM Model</div>
            <h2 style={{fontSize:'clamp(1.35rem,3vw,2.2rem)',fontWeight:900,color:'#fff',marginBottom:9,letterSpacing:'-.015em'}}>AMC priced to your exact<br/><span style={{color:'#69F0AE'}}>equipment & tonnage.</span></h2>
            <p style={{fontSize:'.86rem',color:'rgba(255,255,255,.7)',maxWidth:430,lineHeight:1.75}}>Equipment type · Tonnage · Age · Refrigerant · Site criticality · SLA tier — all dynamically priced, just like Carrier's professional AMC contracts.</p>
          </div>
          <div style={{position:'relative',zIndex:1,flexShrink:0,display:'flex',flexDirection:'column',gap:9}}>
            <button className="btn btn-xl" style={{background:'#69F0AE',color:'#003844',fontWeight:900,border:'none'}} onClick={() => goPage('amc')}>📋 Build AMC Proposal →</button>
            <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.42)',textAlign:'center'}}>Free quote · 24-hr response</div>
          </div>
        </div>
      </div>

      {/* FEATURED */}
      <div className="sec sec-alt">
        <div className="srow">
          <div><div className="eyebrow">Featured Equipment</div><h2 className="sh">Top HVAC Systems</h2></div>
          <span className="sall" onClick={() => goPage('store')}>Full store →</span>
        </div>
        <div className="hscroll">{PRODS.slice(0,9).map(p => <ProductCard key={p.id} p={p} mode="scroll"/>)}</div>
      </div>

      {/* SPARES */}
      <div className="sec">
        <div className="srow">
          <div><div className="eyebrow">Spare Parts</div><h2 className="sh">Genuine OEM Parts</h2></div>
          <span className="sall" onClick={() => goPage('parts')}>All parts →</span>
        </div>
        <div className="hscroll">{PARTS.slice(0,8).map(s => <SparePartCard key={s.id} s={s} mode="scroll"/>)}</div>
      </div>

      {/* REVIEWS */}
      <div className="sec sec-alt">
        <div className="sec-head"><div className="eyebrow">Reviews</div><h2 className="sh">Trusted Across India</h2></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:13}}>
          {REV.map((r,i) => (
            <FadeEl key={r.nm} delay={i*0.07}>
              <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:18}}>
                <div style={{color:'var(--star)',fontSize:'.72rem',letterSpacing:2,marginBottom:9}}>{'★'.repeat(r.s)}{'☆'.repeat(5-r.s)}</div>
                <p style={{fontSize:'.78rem',color:'var(--txt2)',lineHeight:1.76,marginBottom:12,fontStyle:'italic'}}>"{r.t}"</p>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:r.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.76rem',fontWeight:900,color:'#fff',flexShrink:0}}>{r.av}</div>
                  <div>
                    <div style={{fontSize:'.8rem',fontWeight:900}}>{r.nm} <span style={{fontSize:'.56rem',color:'var(--c)',background:'var(--cl)',padding:'2px 6px',borderRadius:50,fontWeight:800,marginLeft:3}}>✓</span></div>
                    <div style={{fontSize:'.66rem',color:'var(--txt3)'}}>📍 {r.loc} · {r.seg}</div>
                  </div>
                </div>
              </div>
            </FadeEl>
          ))}
        </div>
      </div>
    </div>
  );
}