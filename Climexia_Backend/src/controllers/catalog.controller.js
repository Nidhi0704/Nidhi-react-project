'use strict';
const { Product, SparePart, Service } = require('../models/index');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── SERVICES ──────────────────────────────────────────────────────────────────

const listServices = async (req, res) => {
  const { category, serviceType, isFeatured, page = 1, limit = 10, search } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (serviceType) filter.serviceType = serviceType;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (search) filter.name = new RegExp(search, 'i');

  const [data, total] = await Promise.all([
    Service.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).sort({ isFeatured: -1, createdAt: -1 }),
    Service.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const getService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service || !service.isActive) return sendError(res, 'Service not found', 404);
  return sendSuccess(res, { service });
};

const createService = async (req, res) => {
  const image = req.file ? `/uploads/services/${req.file.filename}` : undefined;
  const service = await Service.create({ ...req.body, image });
  return sendSuccess(res, { service }, 'Service created', 201);
};

const updateService = async (req, res) => {
  const updates = { ...req.body };
  if (req.file) updates.image = `/uploads/services/${req.file.filename}`;
  const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!service) return sendError(res, 'Service not found', 404);
  return sendSuccess(res, { service }, 'Service updated');
};

const deleteService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) return sendError(res, 'Service not found', 404);
  return sendSuccess(res, {}, 'Service deactivated');
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

const listProducts = async (req, res) => {
  const { category, brand, isFeatured, minPrice, maxPrice, page = 1, limit = 10, search } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (isFeatured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (search) filter.name = new RegExp(search, 'i');

  const [data, total] = await Promise.all([
    Product.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).sort({ isFeatured: -1 }),
    Product.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, { product });
};

const createProduct = async (req, res) => {
  const images = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];
  const product = await Product.create({ ...req.body, images });
  return sendSuccess(res, { product }, 'Product created', 201);
};

const updateProduct = async (req, res) => {
  const updates = { ...req.body };
  if (req.files?.length) updates.images = req.files.map((f) => `/uploads/products/${f.filename}`);
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, { product }, 'Product updated');
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return sendError(res, 'Product not found', 404);
  return sendSuccess(res, {}, 'Product deactivated');
};

// ── SPARE PARTS ───────────────────────────────────────────────────────────────

const listParts = async (req, res) => {
  const { category, search, isFeatured, page = 1, limit = 10 } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { compatibleBrands: new RegExp(search, 'i') },
  ];

  const [data, total] = await Promise.all([
    SparePart.find(filter).skip((page - 1) * limit).limit(parseInt(limit)),
    SparePart.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const getPart = async (req, res) => {
  const part = await SparePart.findById(req.params.id);
  if (!part || !part.isActive) return sendError(res, 'Spare part not found', 404);
  return sendSuccess(res, { part });
};

const createPart = async (req, res) => {
  const images = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];
  const part = await SparePart.create({ ...req.body, images });
  return sendSuccess(res, { part }, 'Spare part created', 201);
};

const updatePart = async (req, res) => {
  const part = await SparePart.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!part) return sendError(res, 'Spare part not found', 404);
  return sendSuccess(res, { part }, 'Spare part updated');
};

const deletePart = async (req, res) => {
  const part = await SparePart.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!part) return sendError(res, 'Spare part not found', 404);
  return sendSuccess(res, {}, 'Spare part deactivated');
};

module.exports = {
  listServices, getService, createService, updateService, deleteService,
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  listParts, getPart, createPart, updatePart, deletePart,
};