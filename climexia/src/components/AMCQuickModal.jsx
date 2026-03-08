import React from 'react';
import { useApp } from '../context/AppContext';

export default function AMCQuickModal() {
  const { amcModal, setAmcModal, showToast } = useApp();
  if (!amcModal) return null;
  return (
    <div className="modal-bg on" onClick={e => { if(e.target===e.currentTarget) setAmcModal(false); }}>
      <div className="mbox" style={{maxWidth:480}}>
        <div className="mhd">
          <h3>📋 Quick AMC Enquiry</h3>
          <button className="mcls" onClick={() => setAmcModal(false)}>✕</button>
        </div>
        <div className="mbd">
          <div className="hint">Our AMC engineers will call within 24 hrs with a custom quote based on your equipment.</div>
          <div style={{display:'flex',flexDirection:'column',gap:11}}>
            <div className="fr">
              <div className="fg"><label>Name</label><input placeholder="Contact Name"/></div>
              <div className="fg"><label>Mobile</label><input type="tel" placeholder="+91 XXXXX XXXXX"/></div>
            </div>
            <div className="fg"><label>Company</label><input placeholder="Organisation Name"/></div>
            <div className="fr">
              <div className="fg"><label>City</label><input placeholder="City"/></div>
              <div className="fg"><label>Equipment Type</label>
                <select>
                  <option>Split AC</option><option>Cassette AC</option><option>VRF/VRV System</option>
                  <option>Chiller</option><option>AHU/FCU</option><option>Ducted AC</option>
                  <option>Package Unit</option><option>Mix</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>No. of Units</label><input type="number" placeholder="e.g. 20"/></div>
              <div className="fg"><label>Total Tonnage (TR)</label><input type="number" placeholder="e.g. 150"/></div>
            </div>
            <button className="btn btn-c btn-blk btn-lg" onClick={() => { setAmcModal(false); showToast('✅','Enquiry submitted! Call in 24 hrs.'); }}>
              Submit Enquiry →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}