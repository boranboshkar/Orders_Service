import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ticketCategory: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1 
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Reserved', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Reserved'
  },
  transactionId: { 
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


export default mongoose.model('Orders', orderSchema);

