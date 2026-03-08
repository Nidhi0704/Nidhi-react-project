'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ['aadhaar', 'pan', 'hvac_cert', 'other'], required: true },
  fileUrl: { type: String, required: true },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
});

const partnerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String },
    // Partner type
    partnerType: {
      type: String,
      enum: ['technician', 'dealer', 'contractor'],
      required: true,
      default: 'technician',
    },
    // Approval
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: false }, // becomes true on admin approval
    isOnline: { type: Boolean, default: false },
    // KYC documents
    documents: [documentSchema],
    // Assigned cities
    cities: [String],
    // Service specializations
    serviceCategories: [String],
    // Wallet
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    // Rejection info
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    lastLogin: { type: Date },
    fcmToken: { type: String },
  },
  { timestamps: true }
);

partnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

partnerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Partner', partnerSchema);