const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
});

const bountyMonthTrackingSchema = new mongoose.Schema({
  monthNumber: { type: Number, required: true }, // 1-6
  paid: { type: Boolean, default: false },
  payments: [paymentSchema],
  datePaid: { type: String },
  notes: { type: String },
});

const saleSchema = new mongoose.Schema({
  imei: { type: String, required: true },
  storeLocation: { type: String, required: true, enum: ['paris-rd', 'business-loop', 'jefferson-city', 'sedalia'] },
  category: { type: String, required: true, enum: ['new-line', 'port-in', 'upgrade', 'finance-postpaid', 'add-a-line', 'port-in-add-a-line', 'byod'] },
  customerName: { type: String },
  customerPin: { type: String },
  email: { type: String, required: true },
  activationDate: { type: String, required: true },
  bountyTracking: [bountyMonthTrackingSchema],
  status: { type: String, default: 'active', enum: ['active', 'deactivated'] },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // associate with user
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);