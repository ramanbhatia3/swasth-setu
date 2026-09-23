import Review from '../models/Review.js';
import Hospital from '../models/Hospital.js';

// 1. ADD OR UPDATE A REVIEW (Protected)
export const addReview = async (req, res) => {
  try {
    const { hospitalId, rating, experience, categories } = req.body;

    // Verify hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    // Check if user already reviewed this hospital
    const existingReview = await Review.findOne({ hospital: hospitalId, user: req.user._id });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this hospital. Edit feature coming soon!" 
      });
    }

    const review = await Review.create({
      hospital: hospitalId,
      user: req.user._id,
      rating,
      experience,
      categories
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

// 2. GET REVIEWS FOR A SPECIFIC HOSPITAL (Public)
export const getHospitalReviews = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const reviews = await Review.find({ hospital: hospitalId })
      .populate('user', 'name profileImage') // Only get name and picture
      .sort('-createdAt'); // Newest first

    // Calculate basic statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({ 
      success: true, 
      count: totalReviews,
      averageRating,
      reviews 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};