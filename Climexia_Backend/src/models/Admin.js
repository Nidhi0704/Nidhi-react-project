'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ADMIN_ROLES, ROLE_DEFAULT_PERMISSIONS } = require('../config/roles');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      required: true,
      default: ROLES.VIEWER,
    },
    permissions: {
      type: [String],
      default: function () {
        return ROLE_DEFAULT_PERMISSIONS[this.role] || [];
      },
    },
    // City managers are scoped to specific cities
    assignedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    // Brute-force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    lastLogin: { type: Date },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Hash password before save
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts, lock if >= 5
adminSchema.methods.incLoginAttempts = async function () {
  // Unlock if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock for 15 minutes after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model('Admin', adminSchema);