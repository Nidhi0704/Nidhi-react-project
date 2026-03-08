'use strict';
const mongoose = require('mongoose');

// ── Counter (for auto-increment IDs) ─────────────────────────────────────────
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

const getNextSequence = async (name) => {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};

// ── City ──────────────────────────────────────────────────────────────────────
const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  state: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  pinCodes: [String],
}, { timestamps: true });
const City = mongoose.model('City', citySchema);

// ── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    brand: { type: String, required: true },
    category: {
      type: String,
      enum: ['split_ac', 'window_ac', 'cassette_ac', 'tower_ac', 'vrv_vrf', 'chiller', 'other'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [String],
    specifications: { type: Map, of: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tonnage: { type: String },
    starRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);
const Product = mongoose.model('Product', productSchema);

// ── SparePart ─────────────────────────────────────────────────────────────────
const sparePartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    partNumber: { type: String, unique: true, sparse: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['compressor', 'pcb', 'fan_motor', 'expansion_valve', 'filter', 'capacitor', 'other'],
      required: true,
    },
    compatibleBrands: [String],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const SparePart = mongoose.model('SparePart', sparePartSchema);

// ── Service ───────────────────────────────────────────────────────────────────
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['domestic', 'commercial', 'industrial'],
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['repair', 'installation', 'deep_service', 'gas_refill', 'amc', 'ahu_ppm', 'chiller_audit', 'other'],
      required: true,
    },
    basePrice: { type: Number, required: true, min: 0 },
    image: { type: String },
    duration: { type: Number }, // in minutes
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Service = mongoose.model('Service', serviceSchema);

// ── Booking ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    acType: { type: String, required: true },
    issue: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTimeSlot: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['customer', 'partner', 'admin'] },
    serviceReport: { type: String },
    completedAt: { type: Date },
    review: reviewSchema,
    city: { type: String },
  },
  { timestamps: true }
);

bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const seq = await getNextSequence('booking');
    this.bookingId = `CLX-BK-${String(seq).padStart(6, '0')}`;
  }
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);

// ── AMC Contract ──────────────────────────────────────────────────────────────
const amcSchema = new mongoose.Schema(
  {
    contractId: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, required: true },
    acCount: { type: Number, required: true, min: 1 },
    acType: { type: String, required: true },
    address: {
      line1: String,
      city: String,
      pincode: String,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'renewed', 'cancelled'],
      default: 'draft',
    },
    amount: { type: Number },
    ppmTotal: { type: Number, default: 2 },
    ppmDone: { type: Number, default: 0 },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    activatedAt: { type: Date },
    renewedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'AMC' },
    city: { type: String },
  },
  { timestamps: true }
);

amcSchema.pre('save', async function (next) {
  if (!this.contractId) {
    const seq = await getNextSequence('amc');
    this.contractId = `CLX-AMC-${String(seq).padStart(6, '0')}`;
  }
  next();
});
const AMC = mongoose.model('AMC', amcSchema);

// ── Order ─────────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['product', 'part'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.itemModel' },
  itemModel: { type: String, enum: ['Product', 'SparePart'] },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      line1: String, line2: String, city: String, state: String, pincode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String },
    cancellationReason: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const seq = await getNextSequence('order');
    this.orderId = `CLX-ORD-${String(seq).padStart(6, '0')}`;
  }
  next();
});
const Order = mongoose.model('Order', orderSchema);

// ── Support Ticket ────────────────────────────────────────────────────────────
const ticketReplySchema = new mongoose.Schema({
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  attachments: [String],
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['booking', 'order', 'amc', 'payment', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    replies: [ticketReplySchema],
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const seq = await getNextSequence('ticket');
    this.ticketId = `CLX-TKT-${String(seq).padStart(5, '0')}`;
  }
  next();
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// ── Audit Log ─────────────────────────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    adminName: { type: String },
    action: { type: String, required: true },
    resource: { type: String },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object },
    ip: { type: String },
  },
  { timestamps: true }
);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// ── Notification ──────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientType: { type: String, enum: ['user', 'partner', 'admin'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Counter,
  getNextSequence,
  City,
  Product,
  SparePart,
  Service,
  Booking,
  AMC,
  Order,
  Ticket,
  AuditLog,
  Notification,
};