const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
});

const ListSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  distributions: [{
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    items: [ListItemSchema],
    itemCount: {
      type: Number,
      required: true
    }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('List', ListSchema);