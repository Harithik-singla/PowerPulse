const mongoose = require('mongoose');

const outageSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locality:   { type: String, required: true },
  pincode:    { type: String, required: true },
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  durationMinutes: { type: Number, default: 0 },
  description:     { type: String, default: '' },
  status: {
    type:    String,
    enum:    ['reported', 'under_repair', 'resolved'],
    default: 'reported'
  },
  ert:       { type: Date, default: null },
  upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  photo:     { type: String, default: null },
  resolvedAt:{ type: Date, default: null }
}, { timestamps: true });

outageSchema.index({ location: '2dsphere' });
outageSchema.index({ pincode: 1, createdAt: -1 });
outageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Outage', outageSchema);