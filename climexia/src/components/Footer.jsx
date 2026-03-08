import React from 'react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { goPage } = useApp();
  return (
    <footer>
      <div className="fgrid">
        <div>
          <div className="fbrand">CLIMEXIA</div>
          <p className="fdesc">End-to-end HVAC — equipment sales, installation, AMC, spare parts, and certified technicians across India.</p>
          <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:7,fontSize:'.72rem',color:'rgba(255,255,255,.42)'}}>
            <div>📞 +91-XXXX-XXXXXX (Mon–Sat 8AM–8PM)</div>
            <div>✉️ support@climexia.com</div>
            <div>📍 Pune, Maharashtra — 411001</div>
          </div>
        </div>
        <div className="fcol"><h4>Products</h4><ul>
          {['Split & Cassette AC','VRF/VRV Systems','Ducted AC','Chillers','AHU / FCU','Package Units','Cooling Towers'].map(i => <li key={i}><a onClick={() => goPage('store')}>{i}</a></li>)}
        </ul></div>
        <div className="fcol"><h4>Services</h4><ul>
          {[['AC Repair & Service','svcs'],['Gas Refilling','svcs'],['New Installation','svcs'],['AMC Contracts','amc'],['Spare Parts','parts'],['Energy Audit','svcs']].map(([l,p]) => <li key={l}><a onClick={() => goPage(p)}>{l}</a></li>)}
        </ul></div>
        <div className="fcol"><h4>Company</h4><ul>
          {['About Us','Careers','Join as Technician','Vendor Partnership','Privacy Policy','Terms of Service'].map(i => <li key={i}><a>{i}</a></li>)}
        </ul></div>
      </div>
      <div className="fbot">
        <div className="fcopy">© 2026 Climexia Technologies Pvt Ltd. All rights reserved.</div>
        <div className="fsoc">{['f','ig','in','wa'].map(s => <div className="fsocb" key={s}>{s}</div>)}</div>
      </div>
    </footer>
  );
}