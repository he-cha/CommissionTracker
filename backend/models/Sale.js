const mongoose = require('mongoose');

const bountyMonthTrackingSchema = new mongoose.Schema({
  monthNumber: { type: Number, required: true }, // 1-6
  paid: { type: Boolean, default: false },
  amountPaid: { type: Number },
  dateChecked: { type: String },
  notes: { type: String },
});

const saleSchema = new mongoose.Schema({
  imei: { type: String, required: true },
  storeLocation: { type: String, required: true, enum: ['paris-rd', 'business-loop', 'jefferson-city', 'sedalia'] },
  category: { type: String, required: true, enum: ['new-line', 'port-in', 'upgrade', 'finance-postpaid'] },
  customerPin: { type: String },
  email: { type: String, required: true },
  activationDate: { type: String, required: true },
  bountyTracking: [bountyMonthTrackingSchema],
  status: { type: String, default: 'active', enum: ['active', 'deactivated'] },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // associate with user
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);