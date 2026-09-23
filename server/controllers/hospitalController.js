import Hospital from '../models/Hospital.js';
import { completeHospitalList } from '../seeders/hospitalData.js';

// Comprehensive Medical Thesaurus for Natural Language Matching
const MEDICAL_TAXONOMY = {
  Cardiology: [
    'heart', 'cardiac', 'cardio', 'coronary', 'bypass', 'cabg', 'angioplasty',
    'valve', 'hypertension', 'blood pressure', 'arrhythmia', 'heart failure'
  ],
  Gastroenterology: [
    'pancreatic', 'pancreas', 'pancreatitis', 'pancreatectomy', 'whipple',
    'digestive', 'stomach', 'gut', 'colon', 'gallbladder', 'cholecystectomy',
    'ercp', 'eus', 'bile', 'acid reflux', 'gerd', 'gastro'
  ],
  Hepatology: [
    'liver', 'cirrhosis', 'jaundice', 'hepatitis', 'fatty liver', 'ascites'
  ],
  Nephrology: [
    'kidney', 'renal', 'dialysis', 'hemodialysis', 'kidney stone', 'ckd',
    'creatinine', 'urea', 'nephro', 'renal failure'
  ],
  Oncology: [
    'cancer', 'tumor', 'tumour', 'chemo', 'chemotherapy', 'radiation',
    'carcinoma', 'malignancy', 'oncology', 'biopsy', 'lymphoma', 'leukemia'
  ],
  Neurology: [
    'brain', 'neuro', 'stroke', 'paralysis', 'epilepsy', 'seizure',
    'parkinson', 'dementia', 'alzheimer', 'headache', 'migraine', 'spine'
  ],
  Orthopedics: [
    'bone', 'joint', 'knee replacement', 'hip replacement', 'fracture',
    'arthritis', 'ortho', 'ligament', 'cartilage'
  ],
  Endocrinology: [
    'diabetes', 'sugar', 'insulin', 'thyroid', 'hormone', 'endocrine', 'pcos'
  ],
  Rheumatology: [
    'rheumatoid', 'arthritis', 'lupus', 'sle', 'joint pain', 'autoimmune'
  ],
  Pulmonology: [
    'lung', 'respiratory', 'asthma', 'copd', 'breathing', 'bronchitis', 'pulmonary'
  ]
};

// Known Indian cities for sentence extraction
const KNOWN_CITIES = [
  'chandigarh', 'mohali', 'panchkula', 'delhi', 'new delhi', 'gurugram', 'noida',
  'mumbai', 'pune', 'nagpur', 'bengaluru', 'bangalore', 'chennai', 'hyderabad',
  'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 'patna', 'bhopal', 'kochi',
  'coimbatore', 'guwahati', 'bhubaneswar', 'ludhiana', 'amritsar', 'surat', 'indore'
];

// Common non-medical words to flag pure invalid inputs
const COMMON_GARBAGE_WORDS = [
  'apple', 'banana', 'orange', 'fruit', 'shoe', 'shirt', 'clothes', 'car', 'bike',
  'laptop', 'phone', 'mobile', 'games', 'movie', 'song', 'cricket', 'football',
  'pizza', 'burger', 'hotel', 'flight', 'shopping', 'random', 'test', 'hello', 'hi'
];

// Helper to extract medical entities from natural text
function parseNaturalQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;

  const text = rawQuery.toLowerCase().trim();
  const tokens = text.split(/[\s,?.!]+/);

  // 1. Check if user typed obvious non-medical garbage
  const isPureGarbage = tokens.every(token => COMMON_GARBAGE_WORDS.includes(token));
  if (isPureGarbage && tokens.length > 0) {
    return { isValid: false, reason: "Input appears to be non-medical. Please search for a health condition, procedure, or hospital service." };
  }

  // 2. Extract Specializations from taxonomy
  const matchedSpecialties = new Set();
  const matchedKeywords = [];

  for (const [specialty, keywords] of Object.entries(MEDICAL_TAXONOMY)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        matchedSpecialties.add(specialty);
        matchedKeywords.push(kw);
      }
    }
  }

  // 3. Extract City
  let detectedCity = '';
  for (const city of KNOWN_CITIES) {
    if (text.includes(city)) {
      detectedCity = city;
      break;
    }
  }

  // 4. Extract Budget Number
  let detectedBudget = null;
  // Match "200000", "2,00,000", "2 lakh", "2l", "50k", etc.
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/);
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  const directNumMatch = text.match(/(?:in|within|under|budget|rs\.?|₹)?\s*([0-9]{4,8})\b/);

  if (lakhMatch) {
    detectedBudget = parseFloat(lakhMatch[1]) * 100000;
  } else if (kMatch) {
    detectedBudget = parseFloat(kMatch[1]) * 1000;
  } else if (directNumMatch) {
    detectedBudget = parseInt(directNumMatch[1], 10);
  }

  // If no specialties, cities, or budget detected, and query has no health resemblance
  if (matchedSpecialties.size === 0 && !detectedCity && !detectedBudget) {
    // Check if it might be a direct hospital name query
    if (tokens.length <= 3 && !COMMON_GARBAGE_WORDS.some(w => text.includes(w))) {
      return { isValid: true, isNameSearch: true, term: text };
    }
    return {
      isValid: false,
      reason: "Could not identify a recognized health condition, medical specialty, or target hospital in your search. Please try terms like 'pancreatic diseases in Chandigarh', 'cardiology in Delhi', or 'kidney dialysis'."
    };
  }

  return {
    isValid: true,
    isNameSearch: false,
    specialties: Array.from(matchedSpecialties),
    matchedKeywords,
    city: detectedCity,
    budget: detectedBudget
  };
}

// 1. SEARCH & MATCH HOSPITALS (NLP + Chronic-Priority + Transparent Scoring)
export const searchHospitals = async (req, res) => {
  try {
    const { q, city, specialization, maxBudget, sortBy } = req.query;

    let targetSpecialties = [];
    let targetCity = city || '';
    let targetBudget = maxBudget ? Number(maxBudget) : null;
    let isDirectName = false;
    let directNameTerm = '';

    // If natural language query 'q' is provided
    if (q && q.trim().length > 0) {
      const parsed = parseNaturalQuery(q);

      if (!parsed.isValid) {
        return res.status(200).json({
          success: true,
          count: 0,
          isInvalidQuery: true,
          message: parsed.reason,
          hospitals: []
        });
      }

      if (parsed.isNameSearch) {
        isDirectName = true;
        directNameTerm = parsed.term;
      } else {
        targetSpecialties = parsed.specialties;
        if (parsed.city && !targetCity) targetCity = parsed.city;
        if (parsed.budget && !targetBudget) targetBudget = parsed.budget;
      }
    }

    if (specialization && !targetSpecialties.includes(specialization)) {
      targetSpecialties.push(specialization);
    }

    // Build database query
    let dbQuery = {};
    if (isDirectName) {
      dbQuery.$or = [
        { name: { $regex: directNameTerm,$options: 'i' } },
        { specializations: { $regex: directNameTerm,$options: 'i' } }
      ];
    } else {
      if (targetCity) {
        dbQuery['location.city'] = { $regex: targetCity,$options: 'i' };
      }
      if (targetSpecialties.length > 0) {
        dbQuery.$or = [
          { specializations: { $in: targetSpecialties.map(s => new RegExp(s, 'i')) } },
          { chronicConditionsHandled: { $in: targetSpecialties.map(s => new RegExp(s, 'i')) } }
        ];
      }
    }

    // Fetch matching hospitals
    let rawHospitals = await Hospital.find(dbQuery).limit(100).lean();

    // If city was specified but yielded zero results (chronic disease care is flexible),
    // fallback to nationwide hospitals for that medical condition
    let locationRelaxed = false;
    if (rawHospitals.length === 0 && targetCity && targetSpecialties.length > 0) {
      rawHospitals = await Hospital.find({
        $or: [
          { specializations: { $in: targetSpecialties.map(s => new RegExp(s, 'i')) } },
          { chronicConditionsHandled: { $in: targetSpecialties.map(s => new RegExp(s, 'i')) } }
        ]
      }).limit(50).lean();
      locationRelaxed = true;
    }

    // Score calculations
    const scoredHospitals = rawHospitals.map(hospital => {
      let matchScore = 50; // Neutral baseline
      const matchExplanations = [];

      // 1. Specialty & Chronic Disease match (Weight: High)
      const hasSpec = targetSpecialties.some(ts =>
        hospital.specializations.some(s => s.toLowerCase() === ts.toLowerCase()) ||
        hospital.chronicConditionsHandled.some(c => c.toLowerCase().includes(ts.toLowerCase()))
      );

      if (hasSpec) {
        matchScore += 25;
        matchExplanations.push(`Dedicated specialists in ${targetSpecialties.join(' & ')}`);
      }

      // 2. Budget Compatibility
      if (targetBudget) {
        const affordable = hospital.procedures.filter(p => p.estimatedCost.min <= targetBudget);
        if (affordable.length > 0) {
          matchScore += 15;
          matchExplanations.push(`Procedures starting within your ₹${targetBudget.toLocaleString()} budget`);
        } else {
          matchScore -= 5;
          matchExplanations.push(`Estimated procedure packages may exceed ₹${targetBudget.toLocaleString()}`);
        }
      }

      // 3. Clinical Track Record
      if (hospital.metrics?.successRate >= 90) {
        matchScore += 10;
        matchExplanations.push(`High clinical success rate of ${hospital.metrics.successRate}% (${hospital.metrics.successfulPatientsCount?.toLocaleString()}+ treated)`);
      }

      // 4. Location Match
      if (targetCity && hospital.location.city.toLowerCase().includes(targetCity.toLowerCase())) {
        matchScore += 8;
        matchExplanations.push(`Conveniently located in ${hospital.location.city}`);
      } else if (locationRelaxed) {
        matchExplanations.push(`High-specialty center outside ${targetCity} (Chronic condition care available)`);
      }

      // Cap score to strictly avoid deceptive 100% "perfection" claims
      matchScore = Math.min(94, Math.max(50, matchScore));

      return {
        ...hospital,
        matchScore,
        matchExplanations
      };
    });

    // Default Sorting: High Success Rate first!
    const sort = sortBy || 'successRate';
    if (sort === 'successRate') {
      scoredHospitals.sort((a, b) => (b.metrics?.successRate || 0) - (a.metrics?.successRate || 0));
    } else if (sort === 'budgetLow') {
      scoredHospitals.sort((a, b) => {
        const minA = a.procedures?.[0]?.estimatedCost?.min || 9999999;
        const minB = b.procedures?.[0]?.estimatedCost?.min || 9999999;
        return minA - minB;
      });
    } else if (sort === 'patientCount') {
      scoredHospitals.sort((a, b) => (b.metrics?.successfulPatientsCount || 0) - (a.metrics?.successfulPatientsCount || 0));
    } else if (sort === 'matchScore') {
      scoredHospitals.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.status(200).json({
      success: true,
      count: scoredHospitals.length,
      parsedQuery: {
        detectedCity: targetCity,
        detectedSpecialties: targetSpecialties,
        detectedBudget: targetBudget
      },
      hospitals: scoredHospitals
    });

  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ success: false, message: "Search service encountered an issue" });
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
    const { hospitalIds } = req.body;
    if (!hospitalIds || !Array.isArray(hospitalIds)) {
      return res.status(400).json({ success: false, message: "Provide an array of hospital IDs" });
    }
    const hospitals = await Hospital.find({ _id: { $in: hospitalIds } });
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch comparison data" });
  }
};

// 4. BULK SEED DIVERSE 100+ HOSPITALS
export const seedDemoHospitals = async (req, res) => {
  try {
    await Hospital.deleteMany();
    const inserted = await Hospital.insertMany(completeHospitalList);
    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} comprehensive hospital records across India!`,
      count: inserted.length
    });
  } catch (error) {
    console.error("Seeding Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to seed hospital dataset" });
  }
};