import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  hospital: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  experience: { 
    type: String, 
    required: true,
    maxLength: 1000
  },
  // Optional detailed experience ratings (1-5)
  categories: {
    staffCommunication: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    waitingTime: { type: Number, min: 1, max: 5 }
  },
  isReported: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Ensure a user can only leave ONE review per hospital
reviewSchema.index({ hospital: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);