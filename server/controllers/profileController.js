import HealthProfile from '../models/HealthProfile.js';

// GET USER PROFILE
export const getMyProfile = async (req, res) => {
  try {
    // Find the health profile linked to the logged-in user
    let profile = await HealthProfile.findOne({ user: req.user._id }).populate('user', 'name email profileImage');

    // If it doesn't exist, create an empty one automatically
    if (!profile) {
      profile = await HealthProfile.create({
        user: req.user._id
      });
      // Populate user info before sending
      profile = await HealthProfile.findById(profile._id).populate('user', 'name email profileImage');
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// UPDATE USER PROFILE
export const updateMyProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Update fields only if they are provided in the request
    const updateData = req.body;
    
    profile = await HealthProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'name email profileImage');

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};