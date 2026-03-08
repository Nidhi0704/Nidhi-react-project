import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AMCS } from '../data/constants';

const DEFAULT_AMC = {
  step:1, site:{}, equip:[], tier:'standard', sla:'standard',
  crit:'normal', incl:{filt:true,gas:true,elec:false,comp:false}, tons:5, units:3, age:3
};

function calcPrice(amc) {
  const tons=amc.tons||5, units=amc.units||3, age=amc.age||3;
  const base=Math.round(units*2400+tons*450);
  const ageSur=Math.round(base*(age*0.04));
  const crit=amc.crit==='critical'?Math.round(base*.2):0;
  const {filt,gas,elec,comp}=amc.incl;
  const partsC=Math.round((filt?units*600:0)+(gas?units*800:0)+(elec?units*400:0)+(comp?units*2000:0));
  const tierM={basic:.8,standard:1,comprehensive:1.35}[amc.tier]||1;
  const total=Math.round((base+ageSur+crit+partsC)*tierM);
  return {base,ageSur,crit,partsC,tierM,total};
}

function Step1({amc,setAmc,onNext}) {
  const [form,setForm]=useState({org:amc.site.org||'',cp:amc.site.cp||'',addr:amc.site.addr||'',city:amc.site.city||'',state:amc.site.state||'',pin:'',fl:'',area:'',ftype:'commercial',mob:'',email:'',start:'',dur:'1'});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div>
      <div className="hint">Step 1 of 6 — Customer & facility details. These appear as the contract header in your AMC proposal, exactly like Carrier's CRM registration.</div>
      <div style={{display:'flex',flexDirection:'column',gap:11}}>
        <div className="fr">
          <div className="fg"><label>Organisation / Client Name</label><input placeholder="e.g. Infosys Ltd, Apollo Hospitals" value={form.org} onChange={e=>set('org',e.target.value)}/></div>
          <div className="fg"><label>Contact Person</label><input placeholder="Full Name" value={form.cp} onChange={e=>set('cp',e.target.value)}/></div>
        </div>
        <div className="fg"><label>Site / Facility Address</label><textarea rows="2" placeholder="Full address with floor, wing, landmark" value={form.addr} onChange={e=>set('addr',e.target.value)}/></div>
        <div className="fr3">
          <div className="fg"><label>City</label><input placeholder="Pune" value={form.city} onChange={e=>set('city',e.target.value)}/></div>
          <div className="fg"><label>State</label><input placeholder="Maharashtra" value={form.state} onChange={e=>set('state',e.target.value)}/></div>
          <div className="fg"><label>PIN</label><input placeholder="411001" value={form.pin} onChange={e=>set('pin',e.target.value)}/></div>
        </div>
        <div className="fr3">
          <div className="fg"><label>No. of Floors</label><input type="number" placeholder="5" value={form.fl} onChange={e=>set('fl',e.target.value)}/></div>
          <div className="fg"><label>Total Area (sqft)</label><input type="number" placeholder="25000" value={form.area} onChange={e=>set('area',e.target.value)}/></div>
          <div className="fg"><label>Facility Type</label>
            <select value={form.ftype} onChange={e=>set('ftype',e.target.value)}>
              <option value="commercial">Commercial Office</option><option value="hospital">Hospital/Healthcare</option>
              <option value="hotel">Hotel/Hospitality</option><option value="industrial">Industrial/Manufacturing</option>
              <option value="datacenter">Data Center</option><option value="retail">Retail/Mall</option>
              <option value="residential">Residential Complex</option>
            </select>
          </div>
        </div>
        <div className="fr">
          <div className="fg"><label>Mobile</label><input type="tel" placeholder="+91 XXXXX XXXXX" value={form.mob} onChange={e=>set('mob',e.target.value)}/></div>
          <div className="fg"><label>Email</label><input type="email" placeholder="facility@company.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
        </div>
        <div className="fr">
          <div className="fg"><label>Contract Start Date</label><input type="date" value={form.start} onChange={e=>set('start',e.target.value)}/></div>
          <div className="fg"><label>Contract Duration</label>
            <select value={form.dur} onChange={e=>set('dur',e.target.value)}>
              <option value="1">1 Year</option><option value="2">2 Years</option><option value="3">3 Years</option>
            </select>
          </div>
        </div>
      </div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-c btn-lg" onClick={()=>{setAmc(a=>({...a,site:form}));onNext();}}>Next: Equipment Inventory →</button>
      </div>
    </div>
  );
}

function Step2({amc,setAmc,onNext,onBack}) {
  const [form,setForm]=useState({type:'Split AC',brand:'Daikin',tons:'',ref:'R-32',age:'',model:'',qty:'1'});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const addEquip=()=>{
    if(!form.tons) return;
    const newE=[...amc.equip,{type:form.type,brand:form.brand,tons:+form.tons,ref:form.ref,age:+form.age||0,model:form.model,qty:+form.qty||1}];
    setAmc(a=>({...a,equip:newE,tons:newE.reduce((s,e)=>s+parseFloat(e.tons)*e.qty,0),units:newE.reduce((s,e)=>s+e.qty,0)}));
  };
  const removeEquip=i=>{const newE=amc.equip.filter((_,idx)=>idx!==i);setAmc(a=>({...a,equip:newE,tons:newE.reduce((s,e)=>s+parseFloat(e.tons)*e.qty,0),units:newE.reduce((s,e)=>s+e.qty,0)}));};
  const totT=amc.equip.reduce((s,e)=>s+parseFloat(e.tons)*e.qty,0);
  return (
    <div>
      <div className="hint">Step 2 of 6 — Build your equipment asset register. Add each unit with type, brand, tonnage, refrigerant & age. This directly drives AMC pricing.</div>
      <div className="etw">
        <table className="et">
          <thead><tr><th>#</th><th>Type</th><th>Brand</th><th>Model No.</th><th>Capacity</th><th>Refrigerant</th><th>Age</th><th>Qty</th><th></th></tr></thead>
          <tbody>
            {amc.equip.length===0 ? <tr><td colSpan="9" style={{textAlign:'center',color:'var(--txt3)',padding:18,fontWeight:700}}>No equipment added. Use form below.</td></tr>
              : amc.equip.map((e,i)=>(
                <tr key={i}><td>{i+1}</td><td><span className="ebadge">{e.type}</span></td><td>{e.brand}</td>
                  <td style={{fontSize:'.7rem',fontFamily:'monospace'}}>{e.model||'—'}</td>
                  <td>{e.tons} TR</td><td>{e.ref}</td><td>{e.age}y</td><td>{e.qty}</td>
                  <td><button onClick={()=>removeEquip(i)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'.9rem'}}>✕</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="eadd">
        <div className="fg"><label>Equipment Type</label><select value={form.type} onChange={e=>set('type',e.target.value)}>{['Split AC','Cassette AC','Ducted AC','VRF/VRV System','Package Unit','Chiller (Air-Cooled)','Chiller (Water-Cooled)','AHU','FCU','Cooling Tower','BMS Panel'].map(o=><option key={o}>{o}</option>)}</select></div>
        <div className="fg"><label>Brand</label><select value={form.brand} onChange={e=>set('brand',e.target.value)}>{['Daikin','Carrier','LG','Samsung','Voltas','Blue Star','Hitachi','Mitsubishi','O-General','Trane','York','Other'].map(o=><option key={o}>{o}</option>)}</select></div>
        <div className="fg"><label>Capacity (TR)</label><input type="number" step="0.5" min="0.5" placeholder="e.g. 1.5" value={form.tons} onChange={e=>set('tons',e.target.value)}/></div>
        <div className="fg"><label>Refrigerant</label><select value={form.ref} onChange={e=>set('ref',e.target.value)}>{['R-32','R-410A','R-22','R-134a','R-407C'].map(o=><option key={o}>{o}</option>)}</select></div>
        <div className="fg"><label>Age (years)</label><input type="number" min="0" placeholder="3" value={form.age} onChange={e=>set('age',e.target.value)}/></div>
        <div className="fg"><label>Model No.</label><input placeholder="Optional" value={form.model} onChange={e=>set('model',e.target.value)}/></div>
        <div className="fg"><label>Qty</label><input type="number" min="1" value={form.qty} onChange={e=>set('qty',e.target.value)}/></div>
        <div className="fg"><label>&nbsp;</label><button className="btn btn-c btn-blk" onClick={addEquip}>+ Add</button></div>
      </div>
      <div className="ebar">Equipment added: <strong>{amc.equip.length} items</strong> &nbsp;·&nbsp; Total capacity: <strong>{totT.toFixed(1)} TR</strong></div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-out btn-lg" onClick={onBack}>← Back</button>
        {amc.equip.length>0 ? <button className="btn btn-c btn-lg" style={{minWidth:150}} onClick={onNext}>Next: Scope →</button>
          : <button className="btn btn-white btn-lg" disabled>Add at least 1 equipment</button>}
      </div>
    </div>
  );
}

function Step3({onNext,onBack}) {
  const sgs=[
    {ic:'🔧',t:'Preventive Maintenance (PPM)',items:['Monthly Filter Inspection & Cleaning','Quarterly Coil Chemical Wash','Semi-Annual Gas Pressure Check','Annual Full Performance Test','Electrical Contact Cleaning','Drain Pan & Pipe Cleaning','Belt & Pulley Inspection (AHU)','Oil Level Check (Chiller/Screw)','Condenser Tube Brushing (Water-Cooled)']},
    {ic:'🚨',t:'Breakdown / Corrective Maintenance',items:['Emergency Call Response (24x7)','Minor Electrical Repairs','PCB Diagnostics & Replacement','Refrigerant Leak Detection & Recharge','Fan Motor Replacement','Compressor Valve Service','Expansion Valve Service']},
    {ic:'📊',t:'Monitoring & Reporting',items:['Monthly Service Report (per equipment)','Quarterly Energy Efficiency Report','Annual Asset Health Report','BMS Integration & Alarm Monitoring','Online Portal Access (job status)','Pre-Summer & Pre-Winter Checkup']},
    {ic:'🔩',t:'Parts & Consumables Coverage',items:['Filters Included (all scheduled)','Refrigerant Gas Included (up to X kg/yr)','Lubricating Oil Included','Belts & Minor Consumables','Compressor Covered (Comprehensive)','All Electrical Parts Covered (Comp.)']},
  ];
  return (
    <div>
      <div className="hint">Step 3 of 6 — Select scope of services. Check items to include. Service frequency affects pricing dynamically.</div>
      <div className="sgrid">
        {sgs.map(g=>(
          <div className="sgc" key={g.t}>
            <div className="sgt">{g.ic} {g.t}</div>
            {g.items.map(it=><label className="scck" key={it}><input type="checkbox" defaultChecked/> {it}</label>)}
            <select className="fsel"><option>Monthly (12×/yr)</option><option>Quarterly (4×/yr)</option><option>Bi-annual (2×/yr)</option><option>Annual (1×/yr)</option></select>
          </div>
        ))}
      </div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-out btn-lg" onClick={onBack}>← Back</button>
        <button className="btn btn-c btn-lg" style={{minWidth:150}} onClick={onNext}>Next: Pricing →</button>
      </div>
    </div>
  );
}

function PriceSummary({amc}) {
  const {base,ageSur,crit,partsC,tierM,total}=calcPrice(amc);
  return (
    <div className="psum">
      <div className="psum-t">AMC Price Estimate</div>
      <div className="psum-rows">
        <div className="psr"><span className="pl">Base labour cost</span><span className="pv">₹{base.toLocaleString('en-IN')}</span></div>
        <div className="psr"><span className="pl">Capacity factor</span><span className="pv">₹{Math.round(amc.tons*450).toLocaleString('en-IN')}</span></div>
        <div className="psr"><span className="pl">Age surcharge</span><span className="pv">₹{ageSur.toLocaleString('en-IN')}</span></div>
        <div className="psr"><span className="pl">Parts & consumables</span><span className="pv">₹{partsC.toLocaleString('en-IN')}</span></div>
        <div className="psr"><span className="pl">Criticality premium</span><span className="pv">₹{crit.toLocaleString('en-IN')}</span></div>
        <div className="psr"><span className="pl">Tier multiplier</span><span className="pv">{tierM}×</span></div>
      </div>
      <div className="psum-tot">
        <div style={{fontSize:'.66rem',opacity:.6,marginBottom:3}}>Total Annual AMC Value</div>
        <div className="psum-amt">₹{total.toLocaleString('en-IN')}</div>
        <div className="psum-per">per year + GST @18%</div>
      </div>
      <div className="psum-note">💡 Indicative estimate. Final price after site survey, scope confirmation & negotiation.<br/><br/>Multi-year contracts: 5–15% discount applicable.</div>
    </div>
  );
}

function Step4({amc,setAmc,onNext,onBack}) {
  return (
    <div>
      <div className="hint">Step 4 of 6 — Dynamic pricing calculator. Every slider and toggle updates your AMC cost in real-time, exactly like Carrier's professional AMC pricing model.</div>
      <div className="pcw">
        <div className="pfs">
          <div className="pfc">
            <div className="pfch"><div className="pfct">⚡ Contract Tier</div><div className="pfcb">{amc.tier.charAt(0).toUpperCase()+amc.tier.slice(1)}</div></div>
            <div className="tgrid">
              {[['basic','Basic','Labour only'],['standard','Standard','Labour + parts'],['comprehensive','Comprehensive','All inclusive']].map(([k,l,s])=>(
                <div key={k} className={`tbtn${amc.tier===k?' on':''}`} onClick={()=>setAmc(a=>({...a,tier:k}))}>
                  <span className="tbn">{l}</span><span className="tbs">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pfc">
            <div className="pfch"><div className="pfct">🌡️ Total Cooling Capacity (TR)</div><div className="pfcb">{Number(amc.tons).toFixed(1)} TR</div></div>
            <input type="range" className="psl" min="1" max="1000" value={amc.tons} onChange={e=>setAmc(a=>({...a,tons:+e.target.value}))}/>
            <div className="slbls"><span>1 TR</span><span>500 TR</span><span>1000 TR</span></div>
          </div>
          <div className="pfc">
            <div className="pfch"><div className="pfct">📦 No. of Equipment Units</div><div className="pfcb">{amc.units} units</div></div>
            <input type="range" className="psl" min="1" max="500" value={amc.units} onChange={e=>setAmc(a=>({...a,units:+e.target.value}))}/>
            <div className="slbls"><span>1</span><span>250</span><span>500</span></div>
          </div>
          <div className="pfc">
            <div className="pfch"><div className="pfct">📅 Average Equipment Age</div><div className="pfcb">{amc.age} years</div></div>
            <input type="range" className="psl" min="0" max="20" value={amc.age} onChange={e=>setAmc(a=>({...a,age:+e.target.value}))}/>
            <div className="slbls"><span>New</span><span>10 yrs</span><span>20 yrs</span></div>
            <div style={{fontSize:'.72rem',color:'var(--txt3)',marginTop:4}}>⚠️ Older equipment = higher failure risk = cost premium</div>
          </div>
          <div className="pfc">
            <div className="pfch"><div className="pfct">🏢 Facility Criticality</div></div>
            <div className="crit-grid">
              {[['normal','Normal','Office/Retail'],['critical','Critical ⚠️','Hospital/Data Center']].map(([k,l,s])=>(
                <div key={k} className={`tbtn${amc.crit===k?' on':''}`} onClick={()=>setAmc(a=>({...a,crit:k}))}>
                  <span className="tbn">{l}</span><span className="tbs">{s}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:'.72rem',color:'var(--txt3)',marginTop:6}}>Critical sites: 4-hr response SLA (+20% premium)</div>
          </div>
          <div className="pfc">
            <div className="pfch"><div className="pfct">🔩 Parts & Consumables Inclusion</div></div>
            <div className="pchks">
              {[['filt','Filters & consumables included'],['gas','Refrigerant gas refill (up to 2 kg/unit/yr)'],['elec','Minor electrical parts (capacitors, contactors)'],['comp','Compressor replacement (comprehensive)']].map(([k,l])=>(
                <label className="pchk" key={k}><input type="checkbox" checked={amc.incl[k]} onChange={e=>setAmc(a=>({...a,incl:{...a.incl,[k]:e.target.checked}}))} /> {l}</label>
              ))}
            </div>
          </div>
        </div>
        <PriceSummary amc={amc}/>
      </div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-out btn-lg" onClick={onBack}>← Back</button>
        <button className="btn btn-c btn-lg" style={{minWidth:150}} onClick={onNext}>Next: SLA →</button>
      </div>
    </div>
  );
}

function Step5({amc,setAmc,onNext,onBack}) {
  const slaOptions=[
    {key:'basic',title:'⚙️ Basic SLA',price:'Base price',items:[['✓','Response: 24 business hours'],['✓','PPM visits as scheduled'],['✓','Email + phone support'],['✓','Monthly service report'],['—','24/7 emergency coverage'],['—','Uptime guarantee'],['—','SLA breach penalty']]},
    {key:'standard',title:'🔄 Standard SLA',price:'+8% premium',items:[['✓','Response: 8 business hours'],['✓','All PPM + emergency visits'],['✓','WhatsApp + dedicated line'],['✓','Monthly + quarterly reports'],['✓','8×5 emergency coverage'],['✓','95% uptime guarantee'],['—','Financial penalty clause']]},
    {key:'premium',title:'🏆 Premium SLA',price:'+20% premium',items:[['✓','Response: 4 hours (24×7)'],['✓','Dedicated site engineer'],['✓','Real-time BMS monitoring'],['✓','Weekly + monthly reports'],['✓','24×7 emergency coverage'],['✓','99% uptime SLA'],['✓','Financial penalty clause']]},
    {key:'mission',title:'🚀 Mission Critical',price:'+35% premium',items:[['✓','Response: 2 hours (24×7×365)'],['✓','Resident engineer on-site'],['✓','Predictive monitoring + AI alerts'],['✓','Daily reports + CEO dashboard'],['✓','24×7 emergency coverage'],['✓','99.9% uptime SLA'],['✓','Financial penalty + insurance']]},
  ];
  return (
    <div>
      <div className="hint">Step 5 of 6 — Select your Service Level Agreement (SLA). The SLA defines response times, uptime guarantees & penalty clauses.</div>
      <div className="slag">
        {slaOptions.map(s=>(
          <div key={s.key} className={`slac${amc.sla===s.key?' on':''}`} onClick={()=>setAmc(a=>({...a,sla:s.key}))}>
            <div className="slah"><div className="slat">{s.title}</div><div className="slap">{s.price}</div></div>
            <ul className="slal">{s.items.map(([chk,text])=><li key={text}><span className={chk==='✓'?'slachk':'slax'}>{chk}</span> {text}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{background:'var(--bg)',borderRadius:'var(--r2)',padding:'14px 18px',fontSize:'.78rem',color:'var(--txt2)',lineHeight:1.8}}>
        <strong>Key Contract Terms (Standard)</strong><br/>
        • Payment: 100% advance for 1-year · 50% advance for 2-year+ contracts<br/>
        • Escalation: 5% per year on renewal<br/>
        • Termination: 30 days notice · Pro-rata refund<br/>
        • Excluded: Civil/structural damage · Misuse damage · Acts of God<br/>
        • Jurisdiction: Pune, Maharashtra
      </div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-out btn-lg" onClick={onBack}>← Back</button>
        <button className="btn btn-c btn-lg" style={{minWidth:150}} onClick={onNext}>Next: Proposal →</button>
      </div>
    </div>
  );
}

function Step6({amc,onBack,onSubmit}) {
  const {showToast}=useApp();
  const propNo='CLX-AMC-'+Date.now().toString().slice(-6);
  const {base,ageSur,crit,partsC,tierM,total}=calcPrice(amc);
  const gst=Math.round(total*0.18);
  const totT=amc.equip.reduce((s,e)=>s+parseFloat(e.tons||0)*e.qty,0)||amc.tons;
  const equipment=amc.equip.length?amc.equip:[{type:'Split AC',brand:'Daikin',model:'—',tons:1.5,ref:'R-32',age:2,qty:1}];
  return (
    <div>
      <div className="hint">Step 6 of 6 — Review your AMC proposal. Download or submit for engineer sign-off.</div>
      <div className="propw">
        <div className="prophd">
          <div><div className="proplo">CLIMEXIA Technologies Pvt Ltd</div><div style={{fontSize:'.7rem',opacity:.7,marginTop:3}}>AMC Proposal | {propNo} | {new Date().toLocaleDateString('en-IN')}</div></div>
          <div style={{textAlign:'right',fontSize:'.72rem',opacity:.7}}>Pune, Maharashtra<br/>support@climexia.com</div>
        </div>
        <div className="propbd">
          <div className="propsec">
            <div className="propst">Client Information</div>
            <div className="propig">
              <div><div className="proplbl">Organisation</div><div className="propval">{amc.site.org||'—'}</div></div>
              <div><div className="proplbl">Contact Person</div><div className="propval">{amc.site.cp||'—'}</div></div>
              <div><div className="proplbl">City</div><div className="propval">{amc.site.city||'—'}</div></div>
              <div><div className="proplbl">Facility Type</div><div className="propval">{amc.site.ftype||'Commercial'}</div></div>
            </div>
          </div>
          <div className="propsec">
            <div className="propst">Equipment Register ({equipment.length} items · {Number(totT).toFixed(1)} TR total)</div>
            <table className="propet">
              <thead><tr><th>#</th><th>Type</th><th>Brand</th><th>Model</th><th>TR</th><th>Ref.</th><th>Age</th><th>Qty</th></tr></thead>
              <tbody>{equipment.map((e,i)=><tr key={i}><td>{i+1}</td><td>{e.type}</td><td>{e.brand}</td><td style={{fontFamily:'monospace',fontSize:'.7rem'}}>{e.model||'—'}</td><td>{e.tons}</td><td>{e.ref}</td><td>{e.age}y</td><td>{e.qty}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="propsec">
            <div className="propst">Contract Terms</div>
            <div className="propig">
              <div><div className="proplbl">Contract Type</div><div className="propval">{amc.tier.charAt(0).toUpperCase()+amc.tier.slice(1)} AMC</div></div>
              <div><div className="proplbl">SLA Tier</div><div className="propval">{amc.sla.charAt(0).toUpperCase()+amc.sla.slice(1)}</div></div>
              <div><div className="proplbl">Site Criticality</div><div className="propval">{amc.crit.charAt(0).toUpperCase()+amc.crit.slice(1)}</div></div>
              <div><div className="proplbl">Duration</div><div className="propval">1 Year (renewable)</div></div>
            </div>
          </div>
          <div className="propsec">
            <div className="propst">Pricing Breakdown</div>
            <div className="proppb">
              <div className="ppbr">
                <div className="pprow"><span>Base Labour Cost</span><span>₹{base.toLocaleString('en-IN')}</span></div>
                <div className="pprow"><span>Age Surcharge</span><span>₹{ageSur.toLocaleString('en-IN')}</span></div>
                <div className="pprow"><span>Criticality Premium</span><span>₹{crit.toLocaleString('en-IN')}</span></div>
                <div className="pprow"><span>Parts & Consumables</span><span>₹{partsC.toLocaleString('en-IN')}</span></div>
                <div className="pprow"><span>Tier Multiplier ({amc.tier})</span><span>{tierM}×</span></div>
                <div className="pprow tot"><span>Annual AMC Value</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                <div className="pprow"><span>GST @18%</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
                <div className="pprow tot"><span>Total Payable</span><span>₹{(total+gst).toLocaleString('en-IN')}</span></div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:900,color:'var(--c2)'}}>₹{total.toLocaleString('en-IN')}</div>
                <div style={{fontSize:'.7rem',color:'var(--txt3)',fontWeight:700}}>per year (excl. GST)</div>
                <div style={{fontSize:'.64rem',color:'var(--txt3)',marginTop:4}}>₹{Math.round(total/12).toLocaleString('en-IN')}/month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="aw-ft" style={{paddingLeft:0,paddingRight:0}}>
        <button className="btn btn-out btn-lg" onClick={onBack}>← Back</button>
        <button className="btn btn-c btn-lg" onClick={onSubmit}>📤 Submit Proposal</button>
        <button className="btn btn-out btn-lg" onClick={()=>showToast('📥','Downloading PDF...')}>📥 Download PDF</button>
      </div>
    </div>
  );
}

export default function AMCPage() {
  const {showToast,goPage}=useApp();
  const [amc,setAmc]=useState({...DEFAULT_AMC});
  const goStep=n=>setAmc(a=>({...a,step:n}));
  const next=()=>goStep(amc.step+1);
  const back=()=>goStep(amc.step-1);
  const submitProp=()=>{showToast('🎉','AMC proposal submitted! Our team will contact you within 24 hours.');setAmc({...DEFAULT_AMC});goPage('home');};
  return (
    <div className="page on" id="amc">
      <div className="sec">
        <div className="sec-head">
          <div className="eyebrow">Annual Maintenance Contracts</div>
          <h2 className="sh">Dynamic AMC — Carrier CRM Flow</h2>
          <p className="ss">6-step wizard builds your custom contract — equipment, scope, dynamic pricing, SLA & proposal generation.</p>
        </div>
        <div className="amcwiz">
          <div className="aw-hd"><h3>📋 AMC Contract Builder</h3><p>Equipment type · Tonnage · Age · Refrigerant · Criticality · SLA — all factors dynamically priced</p></div>
          <div className="awprog">
            {AMCS.map(s=>(
              <div key={s.n} className={`awt${amc.step===s.n?' on':amc.step>s.n?' done':''}`} onClick={()=>amc.step>s.n&&goStep(s.n)}>
                <div className="awn">{amc.step>s.n?'✓':s.n}</div>
                {s.l}
              </div>
            ))}
          </div>
          <div className="aw-bd">
            {amc.step===1 && <Step1 amc={amc} setAmc={setAmc} onNext={next}/>}
            {amc.step===2 && <Step2 amc={amc} setAmc={setAmc} onNext={next} onBack={back}/>}
            {amc.step===3 && <Step3 onNext={next} onBack={back}/>}
            {amc.step===4 && <Step4 amc={amc} setAmc={setAmc} onNext={next} onBack={back}/>}
            {amc.step===5 && <Step5 amc={amc} setAmc={setAmc} onNext={next} onBack={back}/>}
            {amc.step===6 && <Step6 amc={amc} onBack={back} onSubmit={submitProp}/>}
          </div>
        </div>
      </div>
    </div>
  );
}