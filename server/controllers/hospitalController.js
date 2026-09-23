import Hospital from '../models/Hospital.js';

// 1. SEARCH & MATCH HOSPITALS (Transparent Matching Engine)
export const searchHospitals = async (req, res) => {
  try {
    const { city, specialization, facility, maxBudget } = req.query;
    
    // Build standard DB query for hard exclusions
    let query = {};
    if (city) query['location.city'] = { $regex: city,$options: 'i' };
    if (specialization) query.specializations = { $regex: specialization,$options: 'i' };
    if (facility) query.facilities = { $regex: facility,$options: 'i' };
    if (maxBudget) query['services.estimatedCost.max'] = { $lte: Number(maxBudget) };

    // Fetch raw hospitals using .lean() so we can easily modify the result objects
    const rawHospitals = await Hospital.find(query).limit(50).lean();
    
    // --- MATCHING ENGINE LOGIC ---
    // Weighting: Specialization (30%), Budget (25%), Facility (20%), Location (15%), Verified (10%)
    const hospitalsWithScores = rawHospitals.map(hospital => {
      let score = 0;
      let matchExplanations = [];

      // 1. Verification (10%)
      if (hospital.isVerified) {
        score += 10;
        matchExplanations.push("✓ Verified hospital information");
      }

      // 2. Location (15%)
      if (city && hospital.location.city.toLowerCase().includes(city.toLowerCase())) {
        score += 15;
        matchExplanations.push(`✓ Located in requested region (${city})`);
      } else if (!city) {
        score += 15; // Give default points if user didn't care about location
      }

      // 3. Specialization (30%)
      if (specialization && hospital.specializations.some(s => s.toLowerCase() === specialization.toLowerCase())) {
        score += 30;
        matchExplanations.push(`✓ Provides required specialization (${specialization})`);
      } else if (!specialization) {
        score += 30;
      }

      // 4. Facility (20%)
      if (facility && hospital.facilities.some(f => f.toLowerCase() === facility.toLowerCase())) {
        score += 20;
        matchExplanations.push(`✓ Required facility available (${facility})`);
      } else if (!facility) {
        score += 20;
      }

      // 5. Budget Compatibility (25%)
      if (maxBudget) {
        const affordableServices = hospital.services.filter(s => s.estimatedCost.max <= Number(maxBudget));
        if (affordableServices.length > 0) {
          score += 25;
          matchExplanations.push("✓ Estimated service cost falls within your budget");
        } else {
          matchExplanations.push("⚠ Some estimated costs may exceed your selected budget");
        }
      } else {
        score += 25;
      }

      return {
        ...hospital,
        matchScore: score,
        matchExplanations
      };
    });

    // Sort by highest match score first
    hospitalsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: hospitalsWithScores.length,
      hospitals: hospitalsWithScores
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to search hospitals" });
  }
};

// 2. GET SINGLE HOSPITAL DETAILS
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch hospital details" });
  }
};

// 3. COMPARE MULTIPLE HOSPITALS
export const compareHospitals = async (req, res) => {
  try {
    const { hospitalIds } = req.body; // Array of IDs sent from frontend

    if (!hospitalIds || !Array.isArray(hospitalIds)) {
      return res.status(400).json({ success: false, message: "Please provide an array of hospital IDs." });
    }

    const hospitals = await Hospital.find({ _id: { $in: hospitalIds } });
    
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch comparison data" });
  }
};

// 4. SEED DEMO DATA
export const seedDemoHospitals = async (req, res) => {
  try {
    await Hospital.deleteMany();
    const demoHospitals = [
      {
        name: "Chandigarh Nephrology Centre",
        type: "Private",
        location: { address: "Sector 34", city: "Chandigarh", state: "Punjab", pincode: "160022", coordinates: { lat: 30.72, lng: 76.76 } },
        specializations: ["Nephrology", "Urology", "General Medicine"],
        facilities: ["Dialysis", "ICU", "24x7 Emergency", "Pharmacy", "Laboratory"],
        services: [{ name: "Dialysis Session", estimatedCost: { min: 2000, max: 4000 } }, { name: "Kidney Transplant", estimatedCost: { min: 400000, max: 700000 } }],
        statistics: { beds: 150, doctors: 45 },
        isVerified: true
      },
      {
        name: "PGIMER",
        type: "Government",
        location: { address: "Sector 12", city: "Chandigarh", state: "Punjab", pincode: "160012", coordinates: { lat: 30.76, lng: 76.77 } },
        specializations: ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Nephrology", "Orthopedics"],
        facilities: ["ICU", "Blood Bank", "Operation Theatre", "24x7 Emergency", "Ambulance"],
        services: [{ name: "Heart Bypass", estimatedCost: { min: 100000, max: 200000 } }, { name: "Dialysis Session", estimatedCost: { min: 500, max: 1500 } }],
        statistics: { beds: 1950, doctors: 500 },
        isVerified: true
      },
      {
        name: "Delhi Heart Institute",
        type: "Private",
        location: { address: "Okhla", city: "New Delhi", state: "Delhi", pincode: "110020", coordinates: { lat: 28.55, lng: 77.28 } },
        specializations: ["Cardiology", "Cardiothoracic Surgery"],
        facilities: ["ICU", "Operation Theatre", "Pharmacy", "Ambulance"],
        services: [{ name: "Angioplasty", estimatedCost: { min: 150000, max: 250000 } }, { name: "Heart Bypass", estimatedCost: { min: 300000, max: 500000 } }],
        statistics: { beds: 300, doctors: 80 },
        isVerified: true
      }
    ];
    await Hospital.insertMany(demoHospitals);
    res.status(201).json({ success: true, message: "Demo hospitals seeded successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to seed data" });
  }
};