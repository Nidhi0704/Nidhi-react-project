import { I } from './svgIcons';

export const BG = {
  'Split AC':'#E0F7FA','Cassette AC':'#E8F5E9','Ducted AC':'#FFF8E1',
  'VRF/VRV System':'#F3E5F5','Chiller':'#E3F2FD','AHU':'#E8EAF6',
  'FCU':'#FFF3E0','Package Unit':'#FBE9E7','Cooling Tower':'#E0F2F1'
};
export const TC = {
  'Split AC':'#00ACC1','Cassette AC':'#2E7D32','Ducted AC':'#F9A825',
  'VRF/VRV System':'#6A1B9A','Chiller':'#1565C0','AHU':'#283593',
  'FCU':'#E65100','Package Unit':'#BF360C','Cooling Tower':'#00695C'
};
export const CMAP = {
  split:'Split AC',cas:'Cassette AC',duct:'Ducted AC',
  vrf:'VRF/VRV System',chl:'Chiller',ahu:'AHU',
  fcu:'FCU',pkg:'Package Unit',twr:'Cooling Tower'
};
export const CATS = [
  {id:'split',lbl:'Split AC',svg:I.split},{id:'cas',lbl:'Cassette',svg:I.cas},
  {id:'duct',lbl:'Ducted AC',svg:I.duct},{id:'vrf',lbl:'VRF/VRV',svg:I.vrf},
  {id:'chl',lbl:'Chiller',svg:I.chl},{id:'ahu',lbl:'AHU',svg:I.ahu},
  {id:'fcu',lbl:'FCU',svg:I.fcu},{id:'pkg',lbl:'Package',svg:I.pkg},
  {id:'twr',lbl:'Cool Tower',svg:I.twr},
];
export const PRODS = [
  {id:'p01',cat:'Split AC',br:'Daikin',svg:I.split,nm:'Daikin FTKF35UV16V',sub:'1.5 TR · 5-Star · Inverter · R-32',p:42000,mrp:52000,r:4.9,rv:1820,off:19,tag:'Best Seller',tons:1.5,ref:'R-32',star:5,isNew:false},
  {id:'p02',cat:'Split AC',br:'LG',svg:I.split,nm:'LG PS-Q19YNZE Dual Inverter',sub:'1.5 TR · 5-Star · R-32 · Auto Clean',p:45000,mrp:56000,r:4.8,rv:1240,off:20,tag:'',tons:1.5,ref:'R-32',star:5,isNew:false},
  {id:'p03',cat:'Split AC',br:'Samsung',svg:I.split,nm:'Samsung WindFree Premium',sub:'1.5 TR · 5-Star · Wi-Fi · R-32',p:48000,mrp:59000,r:4.8,rv:980,off:19,tag:'Smart',tons:1.5,ref:'R-32',star:5,isNew:true},
  {id:'p04',cat:'Split AC',br:'Voltas',svg:I.split,nm:'Voltas 183V Adjustable',sub:'1.5 TR · 5-Star · Inverter · R-32',p:38000,mrp:48000,r:4.7,rv:2100,off:21,tag:'',tons:1.5,ref:'R-32',star:5,isNew:false},
  {id:'p05',cat:'Cassette AC',br:'Carrier',svg:I.cas,nm:'Carrier 42NQV036H8',sub:'3 TR · 4-Way Cassette · VRF Ready',p:95000,mrp:115000,r:4.8,rv:380,off:17,tag:'',tons:3,ref:'R-410A',star:4,isNew:false},
  {id:'p06',cat:'Cassette AC',br:'O-General',svg:I.cas,nm:'O-General ASGG12CGTB',sub:'1 TR · Cassette · Wireless RC',p:38000,mrp:46000,r:4.7,rv:420,off:17,tag:'',tons:1,ref:'R-410A',star:4,isNew:false},
  {id:'p07',cat:'Ducted AC',br:'Blue Star',svg:I.duct,nm:'Blue Star FHIA048AU',sub:'4 TR · Ducted · High Static · R-410A',p:145000,mrp:175000,r:4.7,rv:210,off:17,tag:'',tons:4,ref:'R-410A',star:3,isNew:true},
  {id:'p08',cat:'Ducted AC',br:'Hitachi',svg:I.duct,nm:'Hitachi RPI-6.0FSRE',sub:'6 TR · Inverter · Low Noise · R-410A',p:280000,mrp:340000,r:4.8,rv:88,off:18,tag:'',tons:6,ref:'R-410A',star:4,isNew:false},
  {id:'p09',cat:'VRF/VRV System',br:'Daikin',svg:I.vrf,nm:'Daikin VRV-IV Heat Pump',sub:'8 TR · 4-Pipe · BACnet / Modbus',p:680000,mrp:820000,r:4.9,rv:92,off:17,tag:'Premium',tons:8,ref:'R-410A',star:5,isNew:false},
  {id:'p10',cat:'VRF/VRV System',br:'Mitsubishi',svg:I.vrf,nm:'Mitsubishi City Multi VRF',sub:'22 TR · PUHY-EP250 · R-410A',p:1250000,mrp:1500000,r:4.9,rv:45,off:17,tag:'',tons:22,ref:'R-410A',star:5,isNew:false},
  {id:'p11',cat:'VRF/VRV System',br:'LG',svg:I.vrf,nm:'LG Multi V 5 Heat Recovery',sub:'14 TR · Inverter VRF · R-410A',p:890000,mrp:1080000,r:4.8,rv:62,off:18,tag:'',tons:14,ref:'R-410A',star:5,isNew:true},
  {id:'p12',cat:'Chiller',br:'Carrier',svg:I.chl,nm:'Carrier 30XAB060 Air-Cooled',sub:'60 TR · Screw Compressor · R-134a',p:3200000,mrp:3900000,r:4.9,rv:28,off:18,tag:'Industrial',tons:60,ref:'R-134a',star:5,isNew:false},
  {id:'p13',cat:'Chiller',br:'Trane',svg:I.chl,nm:'Trane CGAM150 Water-Cooled',sub:'150 TR · Centrifugal · R-134a',p:7500000,mrp:9000000,r:4.9,rv:14,off:17,tag:'',tons:150,ref:'R-134a',star:5,isNew:false},
  {id:'p14',cat:'Chiller',br:'York',svg:I.chl,nm:'York YVAA VSD Air-Cooled',sub:'80 TR · Variable Speed · R-134a',p:4200000,mrp:5100000,r:4.8,rv:19,off:18,tag:'',tons:80,ref:'R-134a',star:5,isNew:true},
  {id:'p15',cat:'AHU',br:'Blue Star',svg:I.ahu,nm:'Blue Star MAU 5000 CFM',sub:'8 TR Eq · MERV-13 · DDC Ready',p:285000,mrp:340000,r:4.7,rv:67,off:16,tag:'',tons:8,ref:'R-410A',star:4,isNew:true},
  {id:'p16',cat:'AHU',br:'Carrier',svg:I.ahu,nm:'Carrier 39CC Series 10000CFM',sub:'10K CFM · Variable Speed · BACnet',p:420000,mrp:510000,r:4.8,rv:44,off:18,tag:'',tons:12,ref:'R-410A',star:4,isNew:false},
  {id:'p17',cat:'FCU',br:'Carrier',svg:I.fcu,nm:'Carrier 40GRC FCU 4-Pipe',sub:'0.5 TR · 4-Pipe · High COP',p:18000,mrp:22000,r:4.8,rv:340,off:18,tag:'Popular',tons:0.5,ref:'R-410A',star:4,isNew:false},
  {id:'p18',cat:'FCU',br:'Daikin',svg:I.fcu,nm:'Daikin Fan Coil FWD07ATN',sub:'2 TR · Concealed · 2-Pipe System',p:28000,mrp:34000,r:4.7,rv:198,off:18,tag:'',tons:2,ref:'R-410A',star:4,isNew:false},
  {id:'p19',cat:'Package Unit',br:'Voltas',svg:I.pkg,nm:'Voltas PAC 15T Rooftop',sub:'15 TR · Packaged · R-410A',p:520000,mrp:640000,r:4.7,rv:52,off:19,tag:'',tons:15,ref:'R-410A',star:3,isNew:false},
  {id:'p20',cat:'Package Unit',br:'Blue Star',svg:I.pkg,nm:'Blue Star SPAC-30T',sub:'30 TR · Self-Contained · R-410A',p:980000,mrp:1180000,r:4.8,rv:34,off:17,tag:'',tons:30,ref:'R-410A',star:4,isNew:false},
  {id:'p21',cat:'Cooling Tower',br:'Paharpur',svg:I.twr,nm:'Paharpur FRP Induced Draft',sub:'100 TR · FRP Body · SS Hardware',p:380000,mrp:460000,r:4.8,rv:38,off:17,tag:'',tons:100,ref:'Water',star:0,isNew:true},
  {id:'p22',cat:'Cooling Tower',br:'Brentwood',svg:I.twr,nm:'Brentwood ModuCell 200T',sub:'200 TR · PVC Fill · Auto Dosing',p:650000,mrp:790000,r:4.7,rv:22,off:18,tag:'',tons:200,ref:'Water',star:0,isNew:false},
];
export const SVCS = [
  {id:'sv1',cat:'Domestic',svg:I.split,nm:'Split AC Service & Deep Clean',sub:'Coil wash, filter clean, drain flush',p:399,mrp:599,r:4.9,rv:2841,off:'33% off'},
  {id:'sv2',cat:'Domestic',svg:I.split,nm:'Gas Refilling R22/R32/R410A',sub:'Refrigerant top-up with leak test',p:1199,mrp:1599,r:4.8,rv:1620,off:'25% off'},
  {id:'sv3',cat:'Domestic',svg:I.split,nm:'AC Not Cooling — Diagnosis & Fix',sub:'Full electrical & mechanical check',p:399,mrp:599,r:4.9,rv:980,off:'33% off'},
  {id:'sv4',cat:'Domestic',svg:I.split,nm:'Split AC New Installation',sub:'New install with copper piping up to 10 ft',p:799,mrp:1099,r:4.9,rv:3200,off:'27% off'},
  {id:'sv5',cat:'Domestic',svg:I.split,nm:'Water Leakage Fix',sub:'Drain pipe, coil, overflow tray repair',p:399,mrp:550,r:4.8,rv:870,off:'27% off'},
  {id:'sv6',cat:'Domestic',svg:I.pcb,nm:'PCB & Electrical Repair',sub:'Control board, wiring, sensor fix',p:799,mrp:1199,r:4.7,rv:520,off:'33% off'},
  {id:'sv7',cat:'Commercial',svg:I.cas,nm:'Cassette AC Installation',sub:'4-way cassette for offices & malls',p:2499,mrp:3499,r:4.8,rv:420,off:'29% off'},
  {id:'sv8',cat:'Commercial',svg:I.vrf,nm:'VRF/VRV Commissioning',sub:'Multi-zone startup & parameter setting',p:0,mrp:0,r:4.9,rv:180,off:'Custom'},
  {id:'sv9',cat:'Commercial',svg:I.duct,nm:'Ducted AC Service & Balancing',sub:'Air balance, filter change, coil clean',p:3999,mrp:5499,r:4.8,rv:220,off:'27% off'},
  {id:'sv10',cat:'Industrial',svg:I.chl,nm:'Chiller Annual Service',sub:'Chemical treatment & performance test',p:0,mrp:0,r:4.9,rv:95,off:'Custom'},
  {id:'sv11',cat:'Industrial',svg:I.ahu,nm:'AHU / FCU Service & Cleaning',sub:'Coil clean, filter replace, drain flush',p:4999,mrp:6999,r:4.8,rv:140,off:'29% off'},
  {id:'sv12',cat:'Industrial',svg:I.twr,nm:'Cooling Tower Maintenance',sub:'Basin clean, fill pack, pump check',p:0,mrp:0,r:4.9,rv:80,off:'Custom'},
];
export const PARTS = [
  {id:'sp01',svg:I.comp,br:'LG',nm:'Rotary Compressor R-32',mdl:'GA113AC-J2LU',cat:'Compressor',compat:'LG Split 1–2 TR',p:8500,mrp:10000,wty:'12M',stk:true,badge:'Best Seller'},
  {id:'sp02',svg:I.comp,br:'Daikin',nm:'Scroll Compressor JT90',mdl:'JT90BHBY1L',cat:'Compressor',compat:'Daikin 2–3 TR',p:12000,mrp:14500,wty:'12M',stk:true,badge:'OEM'},
  {id:'sp03',svg:I.comp,br:'Carrier',nm:'Semi-Hermetic Compressor',mdl:'06ER250360',cat:'Compressor',compat:'Carrier Chiller 10–50TR',p:85000,mrp:102000,wty:'18M',stk:true,badge:'Industrial'},
  {id:'sp04',svg:I.pcb,br:'Samsung',nm:'PCB Control Board Indoor',mdl:'DB93-11115K',cat:'PCB Board',compat:'Samsung Split AC',p:2800,mrp:3500,wty:'6M',stk:true,badge:''},
  {id:'sp05',svg:I.pcb,br:'Voltas',nm:'Indoor PCB Main Board',mdl:'VOLTAS-PCB-18K',cat:'PCB Board',compat:'Voltas 1.5 TR',p:1800,mrp:2400,wty:'6M',stk:false,badge:''},
  {id:'sp06',svg:I.pcb,br:'Daikin',nm:'VRF System Main PCB',mdl:'DAIKIN-VRF-PCB8',cat:'PCB Board',compat:'Daikin VRV-IV 8TR+',p:18500,mrp:23000,wty:'12M',stk:true,badge:'Premium'},
  {id:'sp07',svg:I.motor,br:'Universal',nm:'Condenser Fan Motor 3-Ph',mdl:'CFM-380-3PH',cat:'Fan Motor',compat:'All 3-phase commercial AC',p:3200,mrp:4200,wty:'6M',stk:true,badge:''},
  {id:'sp08',svg:I.motor,br:'EBM Papst',nm:'AHU Fan Motor 4-Pole',mdl:'A2D300-AA02',cat:'Fan Motor',compat:'AHU/FCU all brands',p:14500,mrp:18000,wty:'12M',stk:true,badge:'Industrial'},
  {id:'sp09',svg:I.exv,br:'Danfoss',nm:'Electronic Expansion Valve',mdl:'ETS100B-1',cat:'Expansion Valve',compat:'VRF / Chillers',p:12000,mrp:15000,wty:'12M',stk:true,badge:'OEM'},
  {id:'sp10',svg:I.filt,br:'Camfil',nm:'HEPA Filter H13 Panel',mdl:'CC-H13-610',cat:'Air Filter',compat:'AHU / FCU HEPA',p:4500,mrp:5800,wty:'—',stk:true,badge:'Premium'},
  {id:'sp11',svg:I.filt,br:'Universal',nm:'Pre-Filter G4 Washable',mdl:'UNI-G4-24x24',cat:'Air Filter',compat:'All AHU systems',p:850,mrp:1200,wty:'—',stk:true,badge:'Popular'},
  {id:'sp12',svg:I.cap,br:'Havells',nm:'Run Capacitor 35+5µF',mdl:'HC-35+5-440V',cat:'Capacitor',compat:'All single-phase AC',p:280,mrp:400,wty:'3M',stk:true,badge:''},
  {id:'sp13',svg:I.snsr,br:'Honeywell',nm:'Digital Room Thermostat',mdl:'T6800DP2000',cat:'Sensor',compat:'FCU / AHU 2-pipe',p:3800,mrp:4800,wty:'12M',stk:true,badge:'Smart'},
  {id:'sp14',svg:I.snsr,br:'Carrier',nm:'Chiller Thermistor Sensor',mdl:'CX-TERM-04',cat:'Sensor',compat:'Carrier 30XA/30XAB',p:2200,mrp:3000,wty:'6M',stk:true,badge:''},
  {id:'sp15',svg:I.hx,br:'Alfa Laval',nm:'Brazed Plate Heat Exchanger',mdl:'CBXP52-L-40H',cat:'Heat Exchanger',compat:'Chiller / VRF heat recovery',p:28000,mrp:35000,wty:'24M',stk:true,badge:'Industrial'},
];
export const QT = [
  {svg:I.split,nm:'AC Service',p:'₹399'},{svg:I.split,nm:'Gas Refill',p:'₹1,199'},
  {svg:I.split,nm:'Not Cooling',p:'₹399'},{svg:I.split,nm:'Installation',p:'₹799'},
  {svg:I.split,nm:'Water Leak',p:'₹399'},{svg:I.pcb,nm:'PCB Repair',p:'₹799'},
  {svg:I.ahu,nm:'AHU Service',p:'₹4,999'},{svg:I.chl,nm:'Chiller Svc',p:'Custom'},
];
export const HOW = [
  {svg:`<svg viewBox="0 0 30 30" fill="none"><circle cx="15" cy="11" r="7" stroke="#00ACC1" stroke-width="2" fill="none"/><path d="M8 28 C8 22 22 22 22 28" stroke="#00ACC1" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,tt:'Choose & Configure',d:'Select equipment type or service category'},
  {svg:`<svg viewBox="0 0 30 30" fill="none"><rect x="4" y="10" width="22" height="16" rx="3" stroke="#00ACC1" stroke-width="2" fill="none"/><path d="M4 16 L26 16" stroke="#00ACC1" stroke-width="1.5"/><path d="M8 6L8 12M15 6L15 12" stroke="#00ACC1" stroke-width="2" stroke-linecap="round"/><circle cx="22" cy="23" r="4" fill="#00ACC1" opacity=".15" stroke="#00ACC1" stroke-width="1.5"/><path d="M20.5 23L22 24.5L24.5 21.5" stroke="#00ACC1" stroke-width="1.5" stroke-linecap="round"/></svg>`,tt:'Book & Schedule',d:'Choose date, time slot and confirm location'},
  {svg:`<svg viewBox="0 0 30 30" fill="none"><path d="M8 26L5 23L16 12L21 17Z" fill="#00ACC1" opacity=".3" stroke="#00ACC1" stroke-width="1.5"/><path d="M21 17L26 12Q29 9 27 7Q25 5 22 8L17 13" stroke="#00ACC1" stroke-width="1.5" stroke-linecap="round"/></svg>`,tt:'Expert Service',d:'Certified HVAC engineers execute professionally'},
  {svg:`<svg viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="11" stroke="#00ACC1" stroke-width="2" fill="none"/><path d="M10 15L13 18L20 11" stroke="#00ACC1" stroke-width="2.5" stroke-linecap="round"/></svg>`,tt:'Handover & AMC',d:'Job report, warranty docs, optional AMC activation'},
];
export const REV = [
  {av:'RK',bg:'#00ACC1',nm:'Rajesh Khanna',loc:'Mumbai',seg:'VRF System',s:5,t:'12-TR VRF installed across 3 floors. Commissioning was flawless. AMC signed same day.'},
  {av:'PM',bg:'#FF6D00',nm:'Priya Mehta',loc:'Pune',seg:'Domestic AMC',s:5,t:'Gold AMC for 5 split ACs. 4 PPM visits, gas top-up, emergency handled in 3 hours.'},
  {av:'SN',bg:'#004D5B',nm:'Suresh Nair',loc:'Hyderabad',seg:'Chiller AMC',s:5,t:'Two 60-TR chillers managed by Climexia — monthly checks, water treatment, 24x7 support.'},
  {av:'AT',bg:'#6A1B9A',nm:'Anita Tiwari',loc:'Delhi',seg:'AHU Supply',s:5,t:'8 AHUs for our hospital. Genuine parts, proper docs, BMS integration perfect.'},
  {av:'MF',bg:'#1565C0',nm:'Faisal M.',loc:'Bengaluru',seg:'Spare Parts',s:4,t:'VRF PCB ordered — next day delivery, genuine OEM with Daikin warranty cards.'},
  {av:'GS',bg:'#2E7D32',nm:'Gurmeet Singh',loc:'Chandigarh',seg:'Ducted Install',s:5,t:'3200 sqft office ducted AC — design to commissioning in 8 days. Impressive.'},
];
export const AMCS = [
  {n:1,l:'Site Info'},{n:2,l:'Equipment'},{n:3,l:'Scope'},
  {n:4,l:'Pricing'},{n:5,l:'SLA'},{n:6,l:'Proposal'}
];