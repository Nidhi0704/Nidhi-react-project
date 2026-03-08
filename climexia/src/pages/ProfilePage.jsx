import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Bookings() {
  return (
    <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:22}}>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,marginBottom:18}}>📋 My Bookings</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[['🔧 Active','3 bookings','#E0F7FA','#00ACC1'],['✅ Completed','47 bookings','#E8F5E9','#2E7D32'],['⏰ Upcoming','2 scheduled','#FFF3E0','#E65100']].map(([t,v,bg,c])=>(
          <div key={t} style={{background:bg,borderRadius:'var(--r2)',padding:14,textAlign:'center'}}>
            <div style={{fontSize:'.8rem',fontWeight:900,color:c,marginBottom:4}}>{t}</div>
            <div style={{fontSize:'1.1rem',fontWeight:900,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {[['Split AC Service','Kothrud, Pune','Today 2PM','In Progress'],['VRF Commissioning','Viman Nagar','Yesterday','Completed'],['Chiller Checkup','MIDC Pimpri','15 Mar','Scheduled']].map(([nm,loc,dt,status])=>(
        <div key={nm} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,border:'1px solid var(--bdr)',borderRadius:'var(--r2)',marginBottom:8,flexWrap:'wrap',gap:8}}>
          <div><div style={{fontSize:'.84rem',fontWeight:800}}>{nm}</div><div style={{fontSize:'.7rem',color:'var(--txt3)'}}>{loc}</div></div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'.72rem',color:'var(--txt3)',marginBottom:3}}>{dt}</div>
            <span style={{fontSize:'.64rem',fontWeight:800,padding:'2px 8px',borderRadius:50,background:status==='Completed'?'#E8F5E9':status==='In Progress'?'#E0F7FA':'#FFF3E0',color:status==='Completed'?'#2E7D32':status==='In Progress'?'#00ACC1':'#E65100'}}>{status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AMCs() {
  const { showToast } = useApp();
  return (
    <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:22}}>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,marginBottom:18}}>🔄 AMC Contracts</h2>
      <div style={{background:'linear-gradient(135deg,#003844,#0097A7)',borderRadius:'var(--r)',padding:20,color:'#fff',marginBottom:16}}>
        <div style={{fontSize:'.66rem',opacity:.7,marginBottom:4}}>ACTIVE CONTRACT · CLX-AMC-289341</div>
        <div style={{fontSize:'1.1rem',fontWeight:900,marginBottom:8}}>Comprehensive AMC — Premium SLA</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[['Equipment','12 units'],['Total TR','24.5 TR'],['Validity','Until Mar 2027']].map(([l,v])=>(
            <div key={l}><div style={{fontSize:'.64rem',opacity:.65}}>{l}</div><div style={{fontSize:'.86rem',fontWeight:900}}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={{background:'var(--bg)',borderRadius:'var(--r2)',padding:14,fontSize:'.8rem',color:'var(--txt2)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>Next PPM Visit: <strong style={{color:'var(--c)'}}>18 Mar 2026</strong> &nbsp;·&nbsp; Visits remaining: <strong>8/12</strong></div>
        <button className="btn btn-c btn-sm" onClick={()=>showToast('📋','Downloading AMC contract...')}>Download Contract</button>
      </div>
    </div>
  );
}

function Wallet() {
  return (
    <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:22}}>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,marginBottom:18}}>👛 Wallet & Loyalty</h2>
      <div style={{background:'linear-gradient(135deg,#003844,#005B6E)',borderRadius:'var(--r)',padding:22,color:'#fff',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14}}>
        <div><div style={{fontSize:'.7rem',opacity:.65,marginBottom:6}}>WALLET BALANCE</div><div style={{fontSize:'2.2rem',fontWeight:900}}>₹2,450</div></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:'.7rem',opacity:.65,marginBottom:6}}>LOYALTY POINTS</div><div style={{fontSize:'2.2rem',fontWeight:900}}>1,280 pts</div></div>
      </div>
      <div style={{fontSize:'.82rem',color:'var(--txt2)'}}>1 point = ₹1 discount on your next service. Points expire in 12 months.</div>
    </div>
  );
}

function EditProfile() {
  const { showToast } = useApp();
  return (
    <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:22}}>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,marginBottom:18}}>✏️ Edit Profile</h2>
      <div style={{display:'flex',flexDirection:'column',gap:11,maxWidth:520}}>
        <div className="fr">
          <div className="fg"><label>First Name</label><input defaultValue="Rahul"/></div>
          <div className="fg"><label>Last Name</label><input defaultValue="Kumar"/></div>
        </div>
        <div className="fg"><label>Mobile</label><input type="tel" defaultValue="+91 98765 43210"/></div>
        <div className="fg"><label>Email</label><input type="email" defaultValue="rahul@example.com"/></div>
        <div className="fg"><label>City</label><input defaultValue="Pune"/></div>
        <button className="btn btn-c btn-lg" style={{width:'fit-content'}} onClick={()=>showToast('✅','Profile saved successfully!')}>Save Changes</button>
      </div>
    </div>
  );
}

const TABS = [
  {key:'bookings',label:'📋 My Bookings'},{key:'amcs',label:'🔄 AMC Contracts'},
  {key:'orders',label:'📦 Equipment Orders'},{key:'parts2',label:'🔩 Parts Orders'},
  {key:'addr',label:'📍 Sites & Addresses'},{key:'wallet',label:'👛 Wallet'},
  {key:'edit',label:'✏️ Edit Profile'},
];

export default function ProfilePage() {
  const [tab, setTab] = useState('bookings');
  const renderContent = () => {
    if(tab==='bookings') return <Bookings/>;
    if(tab==='amcs') return <AMCs/>;
    if(tab==='wallet') return <Wallet/>;
    if(tab==='edit') return <EditProfile/>;
    return <div style={{background:'#fff',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:22}}><div style={{color:'var(--txt3)',fontWeight:700,padding:24,textAlign:'center'}}>No records found.</div></div>;
  };
  return (
    <div className="page on" id="profile">
      <div className="psh">
        <div className="psb">
          <div className="pav">RK</div>
          <div className="pnm">Rahul Kumar</div>
          <div className="pph">+91 98765 43210</div>
          <div className="pnav">
            {TABS.map(t=><div key={t.key} className={`plnk${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>{t.label}</div>)}
          </div>
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}