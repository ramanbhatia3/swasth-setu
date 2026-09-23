import Hospital from '../models/Hospital.js';

// 1. SEARCH HOSPITALS (The core discovery engine)
export const searchHospitals = async (req, res) => {
  try {
    const { city, specialization, facility, maxBudget } = req.query;
    
    // Build a dynamic MongoDB query based on user filters
    let query = {};

    // Filter by City (case-insensitive)
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by Specialization
    if (specialization) {
      query.specializations = { $regex: specialization, $options: 'i' };
    }

    // Filter by Required Facility (e.g., "Dialysis", "ICU")
    if (facility) {
      query.facilities = { $regex: facility, $options: 'i' };
    }

    // Filter by Budget (Check if any service in the hospital has a max cost below user's budget)
    if (maxBudget) {
      query['services.estimatedCost.max'] = { $lte: Number(maxBudget) };
    }

    const hospitals = await Hospital.find(query).limit(50);
    
    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to search hospitals" });
  }
};

// 2. HACKATHON HELPER: SEED DEMO DATA
// Run this once to populate your database with realistic demo hospitals
export const seedDemoHospitals = async (req, res) => {
  try {
    // Clear existing to avoid duplicates
    await Hospital.deleteMany();

    const demoHospitals = [
      {
        name: "Chandigarh Nephrology Centre",
        type: "Private",
        location: { address: "Sector 34", city: "Chandigarh", state: "Punjab", pincode: "160022", coordinates: { lat: 30.72, lng: 76.76 } },
        specializations: ["Nephrology", "Urology", "General Medicine"],
        facilities: ["Dialysis", "ICU", "24x7 Emergency", "Pharmacy", "Laboratory"],
        services: [
          { name: "Dialysis Session", estimatedCost: { min: 2000, max: 4000 } },
          { name: "Kidney Stone Removal", estimatedCost: { min: 40000, max: 80000 } },
          { name: "Kidney Transplant", estimatedCost: { min: 400000, max: 700000 } }
        ],
        statistics: { beds: 150, doctors: 45 },
        isVerified: true
      },
      {
        name: "PGIMER",
        type: "Government",
        location: { address: "Sector 12", city: "Chandigarh", state: "Punjab", pincode: "160012", coordinates: { lat: 30.76, lng: 76.77 } },
        specializations: ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Nephrology", "Orthopedics"],
        facilities: ["ICU", "Blood Bank", "Operation Theatre", "24x7 Emergency", "Ambulance"],
        services: [
          { name: "Heart Bypass", estimatedCost: { min: 100000, max: 200000 } },
          { name: "Dialysis Session", estimatedCost: { min: 500, max: 1500 } }
        ],
        statistics: { beds: 1950, doctors: 500 },
        isVerified: true
      },
      {
        name: "Delhi Heart Institute",
        type: "Private",
        location: { address: "Okhla", city: "New Delhi", state: "Delhi", pincode: "110020", coordinates: { lat: 28.55, lng: 77.28 } },
        specializations: ["Cardiology", "Cardiothoracic Surgery"],
        facilities: ["ICU", "Operation Theatre", "Pharmacy", "Ambulance"],
        services: [
          { name: "Angioplasty", estimatedCost: { min: 150000, max: 250000 } },
          { name: "Heart Bypass", estimatedCost: { min: 300000, max: 500000 } }
        ],
        statistics: { beds: 300, doctors: 80 },
        isVerified: true
      },
      {
        name: "Apollo Hospitals",
        type: "Private",
        location: { address: "Navi Mumbai", city: "Mumbai", state: "Maharashtra", pincode: "400614", coordinates: { lat: 19.03, lng: 73.02 } },
        specializations: ["Neurology", "Orthopedics", "Oncology"],
        facilities: ["ICU", "Blood Bank", "Operation Theatre", "Pharmacy", "Laboratory"],
        services: [
          { name: "Joint Replacement", estimatedCost: { min: 250000, max: 400000 } },
          { name: "Chemotherapy Cycle", estimatedCost: { min: 50000, max: 100000 } }
        ],
        statistics: { beds: 500, doctors: 120 },
        isVerified: true
      }
    ];

    await Hospital.insertMany(demoHospitals);
    res.status(201).json({ success: true, message: "Demo hospitals seeded successfully!", count: demoHospitals.length });
  } catch (error) {
    console.error("Seeder Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to seed data" });
  }
};