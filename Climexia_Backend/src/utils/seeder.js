'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');
const User     = require('../models/User');
const Partner  = require('../models/Partner');
const {
  Product, SparePart, Service, Booking,
  AMC, Order, AuditLog, Notification, Ticket, City,
} = require('../models/index');
const { ROLES } = require('../config/roles');

const log  = (msg) => console.log(`\x1b[36m[SEED]\x1b[0m ${msg}`);
const ok   = (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m[!]\x1b[0m ${msg}`);
const err  = (msg) => console.error(`\x1b[31m[✗]\x1b[0m ${msg}`);
const head = (msg) => console.log(`\n\x1b[35m━━━ ${msg} ━━━\x1b[0m`);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected to MongoDB → ' + process.env.MONGO_URI);

    // ══════════════════════════════════════════════════════════
    // 0. DROP BAD INDEXES (fix slug null duplicate key issue)
    // ══════════════════════════════════════════════════════════
    head('CLEANUP');
    try {
      await mongoose.connection.db.collection('products').dropIndex('slug_1');
      ok('Dropped old products slug index');
    } catch (e) { warn('No stale slug index to drop (OK)'); }
    try {
      await mongoose.connection.db.collection('spareparts').dropIndex('slug_1');
      ok('Dropped old spareparts slug index');
    } catch (e) { warn('No stale spareparts slug index to drop (OK)'); }
    try {
      await mongoose.connection.db.collection('services').dropIndex('slug_1');
      ok('Dropped old services slug index');
    } catch (e) { warn('No stale services slug index to drop (OK)'); }

    // Remove any documents with null slugs that would block upserts
    await mongoose.connection.db.collection('products').deleteMany({ slug: null });
    await mongoose.connection.db.collection('spareparts').deleteMany({ slug: null });
    await mongoose.connection.db.collection('services').deleteMany({ slug: null });
    ok('Cleaned up null-slug documents');

    // ══════════════════════════════════════════════════════════
    // 1. CITIES
    // ══════════════════════════════════════════════════════════
    head('CITIES');
    const cityList = [
      { name: 'Pune',      state: 'Maharashtra' },
      { name: 'Mumbai',    state: 'Maharashtra' },
      { name: 'Delhi',     state: 'Delhi' },
      { name: 'Bengaluru', state: 'Karnataka' },
      { name: 'Hyderabad', state: 'Telangana' },
      { name: 'Chennai',   state: 'Tamil Nadu' },
      { name: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Kolkata',   state: 'West Bengal' },
      { name: 'Nagpur',    state: 'Maharashtra' },
      { name: 'Surat',     state: 'Gujarat' },
    ];
    for (const c of cityList) {
      await City.findOneAndUpdate(
        { name: c.name },
        { ...c, isActive: true, serviceTypes: ['domestic', 'commercial', 'industrial'] },
        { upsert: true, new: true }
      );
    }
    ok(`${cityList.length} cities seeded`);

    // ══════════════════════════════════════════════════════════
    // 2. SUPER ADMIN
    // ══════════════════════════════════════════════════════════
    head('SUPER ADMIN');
    let superAdmin = await Admin.findOne({ isSuperAdmin: true });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        name:         process.env.SUPER_ADMIN_NAME     || 'Super Admin',
        email:        process.env.SUPER_ADMIN_EMAIL    || 'superadmin@climexia.in',
        phone:        process.env.SUPER_ADMIN_PHONE    || '9999999999',
        password:     process.env.SUPER_ADMIN_PASSWORD || 'Climexia@Super2026!',
        role:         ROLES.SUPER_ADMIN,
        isSuperAdmin: true,
        isActive:     true,
      });
      ok(`Super Admin created → ${superAdmin.email}`);
    } else {
      warn('Super Admin already exists, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 3. STAFF ADMINS
    // ══════════════════════════════════════════════════════════
    head('STAFF ADMINS');
    const staffList = [
      { name: 'Arjun Mehta',  email: 'subadmin1@climexia.in',   phone: '9111111101', role: ROLES.SUB_ADMIN,       assignedCities: [] },
      { name: 'Priya Sharma', email: 'catalog@climexia.in',     phone: '9111111102', role: ROLES.CATALOG_MANAGER, assignedCities: [] },
      { name: 'Rahul Joshi',  email: 'amc@climexia.in',         phone: '9111111103', role: ROLES.AMC_MANAGER,     assignedCities: [] },
      { name: 'Sneha Patil',  email: 'finance@climexia.in',     phone: '9111111104', role: ROLES.FINANCE_MANAGER, assignedCities: [] },
      { name: 'Vikram Singh', email: 'support@climexia.in',     phone: '9111111105', role: ROLES.SUPPORT_AGENT,   assignedCities: [] },
      { name: 'Anjali Desai', email: 'pune@climexia.in',        phone: '9111111106', role: ROLES.CITY_MANAGER,    assignedCities: ['Pune'] },
      { name: 'Kiran Kumar',  email: 'mumbai@climexia.in',      phone: '9111111107', role: ROLES.CITY_MANAGER,    assignedCities: ['Mumbai'] },
      { name: 'Deepak Rao',   email: 'techmanager@climexia.in', phone: '9111111108', role: ROLES.TECH_MANAGER,    assignedCities: [] },
      { name: 'Meera Nair',   email: 'viewer@climexia.in',      phone: '9111111109', role: ROLES.VIEWER,          assignedCities: [] },
    ];
    for (const s of staffList) {
      const exists = await Admin.findOne({ email: s.email });
      if (!exists) {
        await Admin.create({
          ...s,
          password:  'Climexia@Staff2026!',
          isActive:  true,
          createdBy: superAdmin._id,
        });
        ok(`Staff created → ${s.email} (${s.role})`);
      } else {
        warn(`Staff exists → ${s.email}`);
      }
    }

    // ══════════════════════════════════════════════════════════
    // 4. CUSTOMERS
    // ══════════════════════════════════════════════════════════
    head('CUSTOMERS');
    const customerList = [
      { firstName: 'Rahul',  lastName: 'Kumar',  phone: '9876543210', email: 'rahul@example.com',  city: 'Pune',      state: 'Maharashtra' },
      { firstName: 'Pooja',  lastName: 'Verma',  phone: '9876543211', email: 'pooja@example.com',  city: 'Mumbai',    state: 'Maharashtra' },
      { firstName: 'Amit',   lastName: 'Shah',   phone: '9876543212', email: 'amit@example.com',   city: 'Delhi',     state: 'Delhi' },
      { firstName: 'Sunita', lastName: 'Reddy',  phone: '9876543213', email: 'sunita@example.com', city: 'Hyderabad', state: 'Telangana' },
      { firstName: 'Manish', lastName: 'Gupta',  phone: '9876543214', email: 'manish@example.com', city: 'Bengaluru', state: 'Karnataka' },
      { firstName: 'Kavita', lastName: 'Jain',   phone: '9876543215', email: 'kavita@example.com', city: 'Chennai',   state: 'Tamil Nadu' },
      { firstName: 'Rohit',  lastName: 'Nair',   phone: '9876543216', email: 'rohit@example.com',  city: 'Pune',      state: 'Maharashtra' },
      { firstName: 'Ananya', lastName: 'Pillai', phone: '9876543217', email: 'ananya@example.com', city: 'Mumbai',    state: 'Maharashtra' },
      { firstName: 'Suresh', lastName: 'Iyer',   phone: '9876543218', email: 'suresh@example.com', city: 'Chennai',   state: 'Tamil Nadu' },
      { firstName: 'Divya',  lastName: 'Mishra', phone: '9876543219', email: 'divya@example.com',  city: 'Delhi',     state: 'Delhi' },
    ];
    const createdCustomers = [];
    for (const c of customerList) {
      let user = await User.findOne({ phone: c.phone });
      if (!user) {
        user = await User.create({ ...c, password: 'Customer@123', isVerified: true, isActive: true });
        ok(`Customer created → ${c.phone} (${c.firstName} ${c.lastName})`);
      } else {
        warn(`Customer exists → ${c.phone}`);
      }
      createdCustomers.push(user);
    }

    // ══════════════════════════════════════════════════════════
    // 5. PARTNERS
    // ══════════════════════════════════════════════════════════
    head('PARTNERS');
    const partnerList = [
      { firstName: 'Suresh', lastName: 'Patil',    phone: '9765432101', email: 'suresh.p@example.com',  city: 'Pune',      partnerType: 'technician',      skills: ['split_ac','cassette_ac','ahu_fcu'],     experienceYears: 5,  partnerLevel: 'gold',     approvalStatus: 'approved' },
      { firstName: 'Ravi',   lastName: 'Shankar',  phone: '9765432102', email: 'ravi.s@example.com',    city: 'Mumbai',    partnerType: 'technician',      skills: ['vrf_vrv','chiller','ducted_ac'],        experienceYears: 8,  partnerLevel: 'platinum', approvalStatus: 'approved' },
      { firstName: 'Manoj',  lastName: 'Tiwari',   phone: '9765432103', email: 'manoj.t@example.com',   city: 'Delhi',     partnerType: 'technician',      skills: ['split_ac','package_unit'],             experienceYears: 3,  partnerLevel: 'silver',   approvalStatus: 'approved' },
      { firstName: 'Ganesh', lastName: 'More',     phone: '9765432104', email: 'ganesh.m@example.com',  city: 'Pune',      partnerType: 'technician',      skills: ['split_ac','cassette_ac'],              experienceYears: 4,  partnerLevel: 'silver',   approvalStatus: 'approved' },
      { firstName: 'Karan',  lastName: 'Mehta',    phone: '9765432105', email: 'karan.m@example.com',   city: 'Bengaluru', partnerType: 'service_company', skills: ['vrf_vrv','chiller','cooling_tower'],    experienceYears: 10, partnerLevel: 'platinum', approvalStatus: 'approved' },
      { firstName: 'Nitin',  lastName: 'Kulkarni', phone: '9765432106', email: 'nitin.k@example.com',   city: 'Mumbai',    partnerType: 'technician',      skills: ['split_ac','electrical','plumbing'],    experienceYears: 6,  partnerLevel: 'gold',     approvalStatus: 'approved' },
      { firstName: 'Prasad', lastName: 'Reddy',    phone: '9765432107', email: 'prasad.r@example.com',  city: 'Hyderabad', partnerType: 'dealer',          skills: ['split_ac','cassette_ac'],              experienceYears: 7,  partnerLevel: 'gold',     approvalStatus: 'approved' },
      { firstName: 'Ajay',   lastName: 'Patel',    phone: '9765432108', email: 'ajay.p@example.com',    city: 'Ahmedabad', partnerType: 'technician',      skills: ['split_ac'],                            experienceYears: 2,  partnerLevel: 'bronze',   approvalStatus: 'pending'  },
      { firstName: 'Sanjay', lastName: 'Dubey',    phone: '9765432109', email: 'sanjay.d@example.com',  city: 'Delhi',     partnerType: 'contractor',      skills: ['ducted_ac','ahu_fcu','package_unit'],   experienceYears: 9,  partnerLevel: 'platinum', approvalStatus: 'approved' },
      { firstName: 'Vijay',  lastName: 'Naik',     phone: '9765432110', email: 'vijay.n@example.com',   city: 'Mumbai',    partnerType: 'technician',      skills: ['split_ac','cassette_ac','electrical'],  experienceYears: 5,  partnerLevel: 'silver',   approvalStatus: 'approved' },
    ];
    const createdPartners = [];
    for (const p of partnerList) {
      let partner = await Partner.findOne({ phone: p.phone });
      if (!partner) {
        partner = await Partner.create({
          ...p,
          password:      'Partner@123',
          isActive:      p.approvalStatus === 'approved',
          kycStatus:     p.approvalStatus === 'approved' ? 'verified' : 'submitted',
          avgRating:     parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          totalReviews:  Math.floor(Math.random() * 80) + 5,
          totalJobsDone: Math.floor(Math.random() * 200) + 10,
        });
        ok(`Partner created → ${p.phone} (${p.firstName} ${p.lastName})`);
      } else {
        warn(`Partner exists → ${p.phone}`);
      }
      createdPartners.push(partner);
    }
    const approvedPartners = createdPartners.filter(p => p.approvalStatus === 'approved');

    // ══════════════════════════════════════════════════════════
    // 6. PRODUCTS
    // ══════════════════════════════════════════════════════════
    head('PRODUCTS');
    const productList = [
      { name: 'Daikin Inverter Split AC 1.5TR',  slug: 'daikin-inverter-split-1-5tr',  brand: 'Daikin',           model: 'FTKF35UV16V',  category: 'split_ac',    description: 'Daikin 1.5TR 5-Star Inverter with Auto Clean Technology.',      shortDescription: 'Premium 1.5TR Inverter AC',          price: 42000,   mrp: 52000,   tonnage: 1.5, refrigerant: 'R-32',   energyRating: 5, stock: 25, status: 'published', isFeatured: true,  isBestseller: true,  gstRate: 28 },
      { name: 'LG Dual Inverter Split AC 1.5TR', slug: 'lg-dual-inverter-split-1-5tr', brand: 'LG',               model: 'PS-Q19YNZE',   category: 'split_ac',    description: 'LG 1.5TR Dual Inverter 5-Star with Wi-Fi ThinQ.',              shortDescription: 'Smart 1.5TR Wi-Fi AC',               price: 45000,   mrp: 56000,   tonnage: 1.5, refrigerant: 'R-32',   energyRating: 5, stock: 18, status: 'published', isFeatured: true,                       gstRate: 28 },
      { name: 'Voltas 2TR Window AC',             slug: 'voltas-2tr-window-ac',         brand: 'Voltas',           model: '242 DZA',      category: 'split_ac',    description: 'Voltas 2TR 3-Star Window AC with Auto Restart and Sleep Mode.', shortDescription: 'Budget-friendly 2TR Window AC',      price: 28000,   mrp: 34000,   tonnage: 2,   refrigerant: 'R-22',   energyRating: 3, stock: 30, status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Samsung WindFree 1TR Split AC',    slug: 'samsung-windfree-1tr',         brand: 'Samsung',          model: 'AR12CY5AAWK',  category: 'split_ac',    description: 'Samsung WindFree 5-Star Inverter with 23,000 micro holes.',     shortDescription: 'WindFree Technology 1TR AC',         price: 38000,   mrp: 47000,   tonnage: 1,   refrigerant: 'R-32',   energyRating: 5, stock: 12, status: 'published', isFeatured: true,  isNew: true,         gstRate: 28 },
      { name: 'Carrier Cassette AC 2TR',          slug: 'carrier-cassette-2tr',         brand: 'Carrier',          model: '42NQV24H8F',   category: 'cassette_ac', description: 'Carrier 2TR 4-way Cassette AC for commercial spaces.',         shortDescription: 'Commercial 2TR 4-way Cassette AC',  price: 95000,   mrp: 115000,  tonnage: 2,   refrigerant: 'R-32',   energyRating: 4, stock: 8,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Blue Star Cassette AC 1.5TR',      slug: 'blue-star-cassette-1-5tr',     brand: 'Blue Star',        model: 'IC518FLTX',    category: 'cassette_ac', description: 'Blue Star 1.5TR 4-way cassette with iGreen technology.',       shortDescription: 'Office grade 1.5TR Cassette AC',    price: 78000,   mrp: 95000,   tonnage: 1.5, refrigerant: 'R-410A', energyRating: 4, stock: 10, status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Daikin VRV-IV 8TR',                slug: 'daikin-vrv-iv-8tr',            brand: 'Daikin',           model: 'RYYQ8T7Y1B',   category: 'vrf_vrv',     description: 'Daikin VRV-IV 8TR variable refrigerant volume system.',        shortDescription: 'Commercial VRV 8TR Multi-split',     price: 680000,  mrp: 820000,  tonnage: 8,   refrigerant: 'R-410A', energyRating: 5, stock: 3,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Mitsubishi Heavy VRF 10TR',        slug: 'mitsubishi-vrf-10tr',          brand: 'Mitsubishi Heavy', model: 'SCM100ZM-S',   category: 'vrf_vrv',     description: 'Mitsubishi Heavy 10TR VRF system with heat recovery.',         shortDescription: 'Heavy-duty 10TR VRF',                price: 920000,  mrp: 1100000, tonnage: 10,  refrigerant: 'R-410A', energyRating: 5, stock: 2,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Carrier 30XA Chiller 60TR',        slug: 'carrier-30xa-chiller-60tr',    brand: 'Carrier',          model: '30XA060',      category: 'chiller',     description: 'Carrier air-cooled screw chiller 60TR for large commercial.',   shortDescription: 'Industrial 60TR Air-cooled Chiller', price: 3200000, mrp: 3900000, tonnage: 60,  refrigerant: 'R-134a', energyRating: 5, stock: 2,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Trane RTAF Chiller 100TR',         slug: 'trane-rtaf-100tr',             brand: 'Trane',            model: 'RTAF100',      category: 'chiller',     description: 'Trane 100TR air-cooled chiller with Adaptive Control.',        shortDescription: 'Mission-critical 100TR Chiller',     price: 5500000, mrp: 6800000, tonnage: 100, refrigerant: 'R-513A', energyRating: 5, stock: 1,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Daikin AHU 5000 CFM',              slug: 'daikin-ahu-5000-cfm',          brand: 'Daikin',           model: 'DAF-5000',     category: 'ahu',         description: 'Daikin Air Handling Unit 5000 CFM with HEPA filtration.',      shortDescription: 'HEPA filtered AHU 5000 CFM',         price: 420000,  mrp: 510000,  tonnage: 5,   refrigerant: 'R-32',   energyRating: 4, stock: 5,  status: 'published', isFeatured: false,                      gstRate: 28 },
      { name: 'Blue Star FCU 4-pipe 600 CFM',     slug: 'blue-star-fcu-600-cfm',        brand: 'Blue Star',        model: 'FCU4P600',     category: 'fcu',         description: 'Blue Star 4-pipe fan coil unit 600 CFM for heating & cooling.',shortDescription: '4-pipe FCU for heating & cooling',   price: 38000,   mrp: 46000,   tonnage: 1.5, refrigerant: 'R-410A', energyRating: 4, stock: 15, status: 'published', isFeatured: false,                      gstRate: 28 },
    ];
    for (const p of productList) {
      await Product.findOneAndUpdate(
        { slug: p.slug },
        { $set: p },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    ok(`${productList.length} products seeded`);

    // ══════════════════════════════════════════════════════════
    // 7. SPARE PARTS
    // ══════════════════════════════════════════════════════════
    head('SPARE PARTS');
    const partsList = [
      { name: 'LG Rotary Compressor 1.5TR R-32',     slug: 'lg-rotary-comp-1-5tr-r32',    brand: 'LG',        modelNumber: 'GA113AC-J2LU',  category: 'compressor',      compatibility: ['LG Split 1.5TR'],           price: 8500,  mrp: 11000, stock: 12,  warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: 'Daikin Rotary Compressor 1TR',        slug: 'daikin-rotary-comp-1tr',      brand: 'Daikin',    modelNumber: 'JT125G-YE',     category: 'compressor',      compatibility: ['Daikin FTKF25'],            price: 7200,  mrp: 9500,  stock: 8,   warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: 'Samsung Scroll Compressor 2TR',       slug: 'samsung-scroll-comp-2tr',     brand: 'Samsung',   modelNumber: 'QK226KAD',      category: 'compressor',      compatibility: ['Samsung 2TR Inverter'],     price: 12000, mrp: 15500, stock: 6,   warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: 'Daikin PCB Control Board FTKF35',     slug: 'daikin-pcb-ftkf35',           brand: 'Daikin',    modelNumber: 'FTKF35UV-PCB',  category: 'pcb_board',       compatibility: ['Daikin FTKF35'],            price: 3200,  mrp: 4500,  stock: 20,  warranty: '6 Months', isGenuineOem: true,  status: 'active' },
      { name: 'LG Main PCB Display Board',           slug: 'lg-main-pcb-display',         brand: 'LG',        modelNumber: 'EBR74632408',   category: 'pcb_board',       compatibility: ['LG Split AC Series'],       price: 2800,  mrp: 3800,  stock: 15,  warranty: '6 Months', isGenuineOem: true,  status: 'active' },
      { name: 'Universal Indoor Fan Motor 35W',      slug: 'universal-fan-motor-35w',     brand: 'Generic',   modelNumber: 'FM-035-UA',     category: 'fan_motor',       compatibility: ['Universal Fit'],            price: 1200,  mrp: 1800,  stock: 40,  warranty: '3 Months', isGenuineOem: false, status: 'active' },
      { name: 'Daikin Outdoor Fan Motor',            slug: 'daikin-outdoor-fan-motor',    brand: 'Daikin',    modelNumber: 'KFQ33-1QJ1',    category: 'fan_motor',       compatibility: ['Daikin FTKF Series'],       price: 2200,  mrp: 3000,  stock: 18,  warranty: '6 Months', isGenuineOem: true,  status: 'active' },
      { name: 'Honeywell Electronic Expansion Valve',slug: 'honeywell-exv-12',            brand: 'Honeywell', modelNumber: 'EXV-HW-12',     category: 'expansion_valve', compatibility: ['Universal Commercial ACs'], price: 4500,  mrp: 5800,  stock: 15,  warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: '3M HEPA Air Filter 1.5TR',            slug: '3m-hepa-filter-1-5tr',        brand: '3M',        modelNumber: 'HEPA-AC-1T5',   category: 'air_filter',      compatibility: ['Universal 1-1.5TR'],        price: 350,   mrp: 500,   stock: 100, warranty: 'N/A',      isGenuineOem: false, status: 'active' },
      { name: 'Blue Star HEPA Filter Cassette',      slug: 'blue-star-hepa-cassette',     brand: 'Blue Star', modelNumber: 'HEPA-BS-CAST',  category: 'air_filter',      compatibility: ['Blue Star Cassette AC'],    price: 650,   mrp: 900,   stock: 60,  warranty: 'N/A',      isGenuineOem: true,  status: 'active' },
      { name: 'AC Run Capacitor 35+5 MFD 440V',     slug: 'run-cap-35-5-440v',           brand: 'Havells',   modelNumber: 'CAP-35-5-440V', category: 'capacitor',       compatibility: ['Universal 1-2TR ACs'],      price: 180,   mrp: 280,   stock: 80,  warranty: '3 Months', isGenuineOem: false, status: 'active' },
      { name: 'Start Capacitor 75 MFD 300V',        slug: 'start-cap-75-300v',           brand: 'Siemens',   modelNumber: 'CAP-75-300V',   category: 'capacitor',       compatibility: ['Universal Large ACs'],      price: 320,   mrp: 480,   stock: 50,  warranty: '3 Months', isGenuineOem: false, status: 'active' },
      { name: 'NTC Temperature Sensor 10K',          slug: 'ntc-temp-sensor-10k',         brand: 'Generic',   modelNumber: 'SENS-NTC-10K',  category: 'sensor',          compatibility: ['Universal Split ACs'],      price: 150,   mrp: 250,   stock: 120, warranty: '3 Months', isGenuineOem: false, status: 'active' },
      { name: 'Daikin Plate Heat Exchanger',         slug: 'daikin-plate-heat-exchanger', brand: 'Daikin',    modelNumber: 'PHE-DAI-5TR',   category: 'heat_exchanger',  compatibility: ['Daikin VRV Series'],        price: 18000, mrp: 24000, stock: 5,   warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: 'Schneider AC Contactor 25A',          slug: 'schneider-contactor-25a',     brand: 'Schneider', modelNumber: 'LC1D25M7',      category: 'contactor',       compatibility: ['Commercial HVAC'],          price: 850,   mrp: 1200,  stock: 35,  warranty: '1 Year',   isGenuineOem: true,  status: 'active' },
      { name: 'Condensate Drain Pump Mini',          slug: 'condensate-drain-pump-mini',  brand: 'Aspen',     modelNumber: 'FP-2212',       category: 'drain_pump',      compatibility: ['Universal Mini Split'],     price: 2800,  mrp: 3800,  stock: 22,  warranty: '1 Year',   isGenuineOem: false, status: 'active' },
    ];
    for (const p of partsList) {
      await SparePart.findOneAndUpdate(
        { slug: p.slug },
        { $set: p },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    ok(`${partsList.length} spare parts seeded`);

    // ══════════════════════════════════════════════════════════
    // 8. SERVICES
    // ══════════════════════════════════════════════════════════
    head('SERVICES');
    const serviceList = [
      { name: 'Split AC Deep Service',              slug: 'split-ac-deep-service',        category: 'domestic',   description: 'Complete deep cleaning — jet wash coil, clean filter, flush drain, check gas pressure.',         price: 399,   mrp: 599,   duration: 90,  isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'AC Gas Refilling R-32/R-410A',       slug: 'ac-gas-refilling',             category: 'domestic',   description: 'Complete refrigerant refill with leak detection test and pressure check.',                       price: 1199,  mrp: 1499,  duration: 60,  isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'New Split AC Installation',          slug: 'new-split-ac-installation',    category: 'domestic',   description: 'Professional installation including copper piping, wall bracket, drain pipe, and connections.',   price: 799,   mrp: 1100,  duration: 120, isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'AC Uninstallation & Reinstallation', slug: 'ac-uninstall-reinstall',       category: 'domestic',   description: 'Safe removal, gas recovery, transport support, and professional reinstallation.',                price: 1299,  mrp: 1799,  duration: 150, isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'Water Leakage Fix',                  slug: 'water-leakage-fix',            category: 'domestic',   description: 'Diagnose and fix AC water leakage — drain pan, drain line, pipe repair or replacement.',         price: 399,   mrp: 599,   duration: 45,  isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'AC Not Cooling — Full Diagnosis',    slug: 'ac-not-cooling-diagnosis',     category: 'domestic',   description: 'Complete AC diagnosis — gas check, coil cleaning, electrical fault diagnosis, and repair.',      price: 399,   mrp: 599,   duration: 60,  isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'AC Compressor Replacement',          slug: 'ac-compressor-replacement',    category: 'domestic',   description: 'Remove faulty compressor, install new OEM unit, pressure test, gas charging, and test run.',    price: 4999,  mrp: 6999,  duration: 240, isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'PCB Board Repair / Replacement',     slug: 'pcb-board-repair',             category: 'domestic',   description: 'Diagnose PCB fault, repair minor failures, or replace board with OEM part.',                   price: 899,   mrp: 1299,  duration: 90,  isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'Cassette AC Annual Service',         slug: 'cassette-ac-service',          category: 'commercial', description: '4-way cassette deep service — coil wash, drain pan, filter replacement, electrical check.',      price: 2499,  mrp: 3499,  duration: 180, isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'VRF / VRV System Service',           slug: 'vrf-vrv-system-service',       category: 'commercial', description: 'Comprehensive VRF/VRV service — outdoor unit, indoor unit, pipe check, BMS integration.',       price: 8999,  mrp: 12999, duration: 480, isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'AHU Preventive Maintenance',         slug: 'ahu-preventive-maintenance',   category: 'commercial', description: 'Full AHU PPM — coil cleaning, filter replacement, belt tension, motor check, drain clean.',     price: 4999,  mrp: 6999,  duration: 240, isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'FCU Quarterly Service',              slug: 'fcu-quarterly-service',        category: 'commercial', description: 'Fan coil unit quarterly maintenance — filter, coil wash, drain check, thermostat calibration.',  price: 1499,  mrp: 1999,  duration: 90,  isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'Chiller Operation Audit',            slug: 'chiller-operation-audit',      category: 'industrial', description: 'Full chiller audit — log analysis, efficiency report, leak test, compressor health check.',     price: 12999, mrp: 17999, duration: 480, isActive: true, isFeatured: true,  gstRate: 18 },
      { name: 'Cooling Tower Cleaning & Service',   slug: 'cooling-tower-service',        category: 'industrial', description: 'Cooling tower service — basin cleaning, fill inspection, motor & fan check, water treatment.',  price: 9999,  mrp: 13999, duration: 360, isActive: true, isFeatured: false, gstRate: 18 },
      { name: 'Ducted AC System Commission',        slug: 'ducted-ac-commissioning',      category: 'commercial', description: 'Full commissioning — duct leak test, airflow balancing, thermostat programming, handover.',      price: 6999,  mrp: 9999,  duration: 360, isActive: true, isFeatured: false, gstRate: 18 },
    ];
    for (const s of serviceList) {
      await Service.findOneAndUpdate(
        { slug: s.slug },
        { $set: s },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    ok(`${serviceList.length} services seeded`);

    // Reload for references
    const services  = await Service.find({ isActive: true });
    const customers = createdCustomers;
    const partners  = approvedPartners;

    // ══════════════════════════════════════════════════════════
    // 9. BOOKINGS
    // ══════════════════════════════════════════════════════════
    head('BOOKINGS');
    if (await Booking.countDocuments() === 0) {
      const bookingStatuses = ['pending', 'confirmed', 'assigned', 'completed', 'completed', 'completed', 'cancelled'];
      const timeSlots = ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'];
      const addresses = [
        { label: 'Home',   line1: '12, Rose Apartment, FC Road',    area: 'Shivajinagar', city: 'Pune',      state: 'Maharashtra', pincode: '411005' },
        { label: 'Office', line1: '304, Business Hub, Andheri East', area: 'Andheri',      city: 'Mumbai',    state: 'Maharashtra', pincode: '400069' },
        { label: 'Home',   line1: '7B, Green Park Extension',        area: 'Green Park',   city: 'Delhi',     state: 'Delhi',       pincode: '110016' },
        { label: 'Home',   line1: '23, Jubilee Hills Rd No 36',      area: 'Jubilee Hills',city: 'Hyderabad', state: 'Telangana',   pincode: '500033' },
        { label: 'Home',   line1: '14, Indiranagar 100ft Road',      area: 'Indiranagar',  city: 'Bengaluru', state: 'Karnataka',   pincode: '560038' },
      ];
      const bookingsToCreate = [];
      for (let i = 0; i < 20; i++) {
        const customer      = customers[i % customers.length];
        const service       = services[i % services.length];
        const partner       = partners[i % partners.length];
        const statusChoice  = bookingStatuses[i % bookingStatuses.length];
        const addr          = addresses[i % addresses.length];
        const daysAgo       = Math.floor(Math.random() * 60);
        const scheduledDate = new Date(Date.now() - daysAgo * 86400000);
        const servicePrice  = service.price;
        const platformFee   = 29;
        const gstAmount     = Math.round((servicePrice + platformFee) * 0.18);
        const totalAmount   = servicePrice + platformFee + gstAmount;
        bookingsToCreate.push({
          customer:          customer._id,
          service:           service._id,
          assignedPartner:   ['assigned','completed'].includes(statusChoice) ? partner._id : undefined,
          assignedBy:        ['assigned','completed'].includes(statusChoice) ? superAdmin._id : undefined,
          address:           addr,
          scheduledDate,
          scheduledTimeSlot: timeSlots[i % timeSlots.length],
          status:            statusChoice,
          servicePrice,
          platformFee,
          gstAmount,
          discountAmount:    0,
          totalAmount,
          partnerEarning:    Math.round(servicePrice * 0.85),
          paymentStatus:     statusChoice === 'completed' ? 'paid' : 'pending',
          source:            'web',
          ...(statusChoice === 'completed' ? {
            serviceReport: {
              workDone:     'Coil cleaned, filter replaced, gas checked.',
              partsUsed:    ['Air Filter'],
              otpConfirmed: true,
              completedAt:  new Date(scheduledDate.getTime() + 2 * 3600000),
            },
            customerReview: {
              rating:    Math.floor(Math.random() * 2) + 4,
              comment:   ['Excellent service!', 'Quick and clean job.', 'Very professional.', 'Great experience!'][i % 4],
              createdAt: new Date(scheduledDate.getTime() + 5 * 3600000),
            },
          } : {}),
          ...(statusChoice === 'cancelled' ? {
            cancelledBy:        'customer',
            cancellationReason: 'Change of plans',
            cancelledAt:        scheduledDate,
          } : {}),
        });
      }
      await Booking.insertMany(bookingsToCreate);
      ok(`${bookingsToCreate.length} bookings seeded`);
    } else {
      warn('Bookings already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 10. AMC CONTRACTS
    // ══════════════════════════════════════════════════════════
    head('AMC CONTRACTS');
    if (await AMC.countDocuments() === 0) {
      const amcPlans = [
        { planType: 'silver',   planName: 'Silver AMC Plan',   annualValue: 15000,  status: 'active',  slaType: 'basic' },
        { planType: 'gold',     planName: 'Gold AMC Plan',     annualValue: 28000,  status: 'active',  slaType: 'standard' },
        { planType: 'platinum', planName: 'Platinum AMC Plan', annualValue: 55000,  status: 'active',  slaType: 'premium' },
        { planType: 'gold',     planName: 'Gold AMC Plan',     annualValue: 28000,  status: 'draft',   slaType: 'standard' },
        { planType: 'custom',   planName: 'Enterprise Custom', annualValue: 120000, status: 'active',  slaType: 'mission_critical' },
        { planType: 'silver',   planName: 'Silver AMC Plan',   annualValue: 15000,  status: 'expired', slaType: 'basic' },
      ];
      for (let i = 0; i < amcPlans.length; i++) {
        const plan      = amcPlans[i];
        const customer  = customers[i % customers.length];
        const partner   = partners[i % partners.length];
        const gst       = Math.round(plan.annualValue * 0.18);
        const startDate = new Date(Date.now() - (i * 30 * 86400000));
        const endDate   = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        await AMC.create({
          customer:   customer._id,
          planType:   plan.planType,
          planName:   plan.planName,
          siteInfo: {
            orgName:       `${customer.firstName}'s Property`,
            contactPerson: customer.firstName + ' ' + customer.lastName,
            address:       '123 Sample Street',
            city:          customer.city,
            state:         customer.state || 'Maharashtra',
            pincode:       '411001',
            facilityType:  i % 2 === 0 ? 'Residential' : 'Commercial',
          },
          equipment: [
            { equipmentType: 'Split AC',    brand: 'Daikin',  modelNumber: 'FTKF35UV', tonnage: 1.5, refrigerant: 'R-32',   ageYears: 3, qty: 2 },
            { equipmentType: 'Cassette AC', brand: 'Carrier', modelNumber: '42NQV',    tonnage: 2,   refrigerant: 'R-410A', ageYears: 2, qty: 1 },
          ],
          totalUnits:            3,
          totalTonnage:          5,
          slaType:               plan.slaType,
          responseTimeHours:     plan.slaType === 'mission_critical' ? 2 : plan.slaType === 'premium' ? 4 : 8,
          annualValue:           plan.annualValue,
          gstAmount:             gst,
          totalPayable:          plan.annualValue + gst,
          discount:              0,
          contractDurationYears: 1,
          startDate,
          endDate,
          status:                plan.status,
          paymentStatus:         plan.status === 'active' ? 'paid' : 'pending',
          ppmTotal:              plan.slaType === 'mission_critical' ? 12 : 4,
          ppmDone:               plan.status === 'active' ? Math.floor(Math.random() * 3) : 0,
          assignedPartner:       plan.status === 'active' ? partner._id : undefined,
          managedBy:             plan.status === 'active' ? superAdmin._id : undefined,
          source:                'web',
        });
      }
      ok(`${amcPlans.length} AMC contracts seeded`);
    } else {
      warn('AMC contracts already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 11. ORDERS
    // ══════════════════════════════════════════════════════════
    head('ORDERS');
    if (await Order.countDocuments() === 0) {
      const allProducts     = await Product.find({ status: 'published' }).limit(6);
      const orderStatusList = ['placed', 'confirmed', 'shipped', 'delivered', 'delivered', 'cancelled'];
      for (let i = 0; i < 12; i++) {
        const customer   = customers[i % customers.length];
        const product    = allProducts[i % allProducts.length];
        const qty        = Math.floor(Math.random() * 2) + 1;
        const unitPrice  = product.price;
        const totalPrice = unitPrice * qty;
        const gstAmount  = Math.round(totalPrice * 0.28);
        const subtotal   = totalPrice;
        const shipping   = subtotal > 10000 ? 0 : 199;
        const total      = subtotal + gstAmount + shipping;
        const status     = orderStatusList[i % orderStatusList.length];
        await Order.create({
          customer: customer._id,
          items: [{
            itemType:  'product',
            itemRef:   product._id,
            itemModel: 'Product',
            name:      product.name,
            brand:     product.brand,
            quantity:  qty,
            unitPrice,
            totalPrice,
            gstRate:   28,
            gstAmount,
          }],
          shippingAddress: {
            name:    customer.firstName + ' ' + customer.lastName,
            phone:   customer.phone,
            line1:   '123 Sample Street',
            area:    'Sample Area',
            city:    customer.city,
            state:   customer.state || 'Maharashtra',
            pincode: '411001',
          },
          subtotal,
          gstTotal:       gstAmount,
          shippingFee:    shipping,
          discountAmount: 0,
          totalAmount:    total,
          paymentStatus:  status === 'delivered' ? 'paid' : 'pending',
          paymentMethod:  'UPI',
          status,
          source:         'web',
          statusHistory:  [{ status: 'placed', note: 'Order placed successfully' }],
          ...(status === 'delivered' ? { deliveredAt: new Date(Date.now() - i * 86400000), fulfilledBy: superAdmin._id } : {}),
        });
      }
      ok('12 orders seeded');
    } else {
      warn('Orders already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 12. SUPPORT TICKETS
    // ══════════════════════════════════════════════════════════
    head('SUPPORT TICKETS');
    if (await Ticket.countDocuments() === 0) {
      const supportAdmin = await Admin.findOne({ role: ROLES.SUPPORT_AGENT });
      const ticketData = [
        { subject: 'AC not cooling after service',         description: 'Technician serviced my AC 2 days ago but still not cooling.',      category: 'booking_issue', priority: 'high',   status: 'open' },
        { subject: 'Refund not received for cancellation', description: 'Cancelled booking 5 days ago, refund not credited yet.',           category: 'payment',       priority: 'high',   status: 'in_progress' },
        { subject: 'Technician was late by 3 hours',       description: 'Scheduled 10 AM, technician arrived at 1 PM.',                    category: 'technician',    priority: 'medium', status: 'resolved' },
        { subject: 'Product delivery delayed',             description: 'Ordered Daikin Split AC 10 days ago, not delivered yet.',          category: 'product',       priority: 'medium', status: 'open' },
        { subject: 'AMC contract renewal query',           description: 'My AMC expires next month. Need info on Gold plan renewal.',        category: 'amc',           priority: 'low',    status: 'closed' },
        { subject: 'Gas leaking from AC unit',             description: 'Can smell gas near indoor unit. Hissing sound. Urgent!',           category: 'complaint',     priority: 'urgent', status: 'open' },
        { subject: 'Wrong spare part delivered',           description: 'Ordered LG Compressor 1.5TR but received 1TR model.',              category: 'product',       priority: 'high',   status: 'in_progress' },
        { subject: 'How to track my service technician?',  description: 'Is there a way to track technician location or get ETA updates?', category: 'general',       priority: 'low',    status: 'resolved' },
      ];
      for (let i = 0; i < ticketData.length; i++) {
        const customer = customers[i % customers.length];
        const ticket   = ticketData[i];
        await Ticket.create({
          customer:    customer._id,
          subject:     ticket.subject,
          description: ticket.description,
          category:    ticket.category,
          priority:    ticket.priority,
          status:      ticket.status,
          assignedTo:  supportAdmin ? supportAdmin._id : undefined,
          messages: [
            { sender: customer._id, senderModel: 'User', senderName: customer.firstName + ' ' + customer.lastName, message: ticket.description, timestamp: new Date(Date.now() - (ticketData.length - i) * 2 * 86400000) },
            ...(ticket.status !== 'open' ? [{ sender: superAdmin._id, senderModel: 'Admin', senderName: 'Support Team', message: 'We received your complaint and are looking into it.', timestamp: new Date(Date.now() - (ticketData.length - i) * 86400000) }] : []),
            ...(ticket.status === 'resolved' || ticket.status === 'closed' ? [{ sender: superAdmin._id, senderModel: 'Admin', senderName: 'Support Team', message: 'Your issue has been resolved. Let us know if you need further help.', timestamp: new Date() }] : []),
          ],
          resolvedAt: ticket.status === 'resolved' || ticket.status === 'closed' ? new Date() : undefined,
          closedAt:   ticket.status === 'closed' ? new Date() : undefined,
        });
      }
      ok(`${ticketData.length} support tickets seeded`);
    } else {
      warn('Support tickets already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 13. NOTIFICATIONS
    // ══════════════════════════════════════════════════════════
    head('NOTIFICATIONS');
    if (await Notification.countDocuments() === 0) {
      const notifData = [];
      for (let i = 0; i < customers.length; i++) {
        notifData.push(
          { recipient: customers[i]._id, recipientModel: 'User',    title: 'Welcome to Climexia!', message: 'Book your first AC service and get Rs.100 off with code FIRST100.', type: 'system',  isRead: false },
          { recipient: customers[i]._id, recipientModel: 'User',    title: 'Booking Confirmed',    message: 'Your AC service booking is confirmed. A technician will be assigned shortly.', type: 'booking', isRead: i % 2 === 0 },
          { recipient: customers[i]._id, recipientModel: 'User',    title: 'Service Reminder',     message: 'Your AC is due for its 6-month service. Book now for 15% discount!', type: 'promo', isRead: false }
        );
      }
      for (let i = 0; i < partners.length; i++) {
        notifData.push(
          { recipient: partners[i]._id, recipientModel: 'Partner', title: 'Account Approved!',  message: 'Your partner account has been approved. You will now receive job assignments.', type: 'system',  isRead: true },
          { recipient: partners[i]._id, recipientModel: 'Partner', title: 'New Job Assigned',   message: 'You have a new Split AC Deep Service job in your area.', type: 'booking', isRead: i % 2 === 0 }
        );
      }
      await Notification.insertMany(notifData);
      ok(`${notifData.length} notifications seeded`);
    } else {
      warn('Notifications already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // 14. AUDIT LOGS
    // ══════════════════════════════════════════════════════════
    head('AUDIT LOGS');
    if (await AuditLog.countDocuments() === 0) {
      const auditEntries = [
        { action: 'admin.login',     actorName: 'Super Admin',  actorRole: 'super_admin',        description: 'Super Admin logged in' },
        { action: 'admin.create',    actorName: 'Super Admin',  actorRole: 'super_admin',        description: 'Created catalog_manager: Priya Sharma' },
        { action: 'product.create',  actorName: 'Priya Sharma', actorRole: 'catalog_manager',    description: 'Created product: Daikin Inverter Split AC 1.5TR' },
        { action: 'partner.approve', actorName: 'Deepak Rao',   actorRole: 'technician_manager', description: 'Approved partner: Suresh Patil' },
        { action: 'booking.assign',  actorName: 'Anjali Desai', actorRole: 'city_manager',       description: 'Assigned booking to Suresh Patil' },
        { action: 'amc.activate',    actorName: 'Rahul Joshi',  actorRole: 'amc_manager',        description: 'Activated AMC contract' },
        { action: 'order.status',    actorName: 'Super Admin',  actorRole: 'super_admin',        description: 'Updated order status to shipped' },
        { action: 'user.block',      actorName: 'Super Admin',  actorRole: 'super_admin',        description: 'Blocked user for policy violation' },
        { action: 'admin.login',     actorName: 'Vikram Singh', actorRole: 'support_agent',      description: 'Support agent logged in' },
        { action: 'product.publish', actorName: 'Priya Sharma', actorRole: 'catalog_manager',    description: 'Published product: LG Dual Inverter Split AC' },
      ];
      await AuditLog.insertMany(
        auditEntries.map((e) => ({
          ...e,
          actorId:    superAdmin._id,
          actorModel: 'Admin',
          status:     'success',
          ipAddress:  '127.0.0.1',
          userAgent:  'Mozilla/5.0 (Seeder)',
          createdAt:  new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
        }))
      );
      ok(`${auditEntries.length} audit logs seeded`);
    } else {
      warn('Audit logs already exist, skipping');
    }

    // ══════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ══════════════════════════════════════════════════════════
    console.log('\n\x1b[32m╔══════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[32m║      ✅  Climexia Database Seeded Successfully!       ║\x1b[0m');
    console.log('\x1b[32m╚══════════════════════════════════════════════════════╝\x1b[0m');
    console.log('\n\x1b[33m🔑 Login Credentials:\x1b[0m');
    console.log('  ┌─────────────────────────────────────────────────────┐');
    console.log(`  │ Super Admin  : ${(process.env.SUPER_ADMIN_EMAIL || 'superadmin@climexia.in').padEnd(36)}│`);
    console.log(`  │ Password     : ${'Climexia@Super2026!'.padEnd(36)}│`);
    console.log('  ├─────────────────────────────────────────────────────┤');
    console.log('  │ All Staff    : *@climexia.in / Climexia@Staff2026!  │');
    console.log('  ├─────────────────────────────────────────────────────┤');
    console.log('  │ Customer     : 9876543210   / Customer@123          │');
    console.log('  ├─────────────────────────────────────────────────────┤');
    console.log('  │ Partner      : 9765432101   / Partner@123           │');
    console.log('  └─────────────────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (e) {
    err(e.message);
    console.error(e);
    process.exit(1);
  }
}

seed();