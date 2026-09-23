import Hospital from '../models/Hospital.js';
import Report from '../models/Report.js';
import { completeHospitalList } from '../seeders/hospitalData.js';

// Comprehensive Medical Thesaurus
const MEDICAL_TAXONOMY = {
  Cardiology: ['heart', 'cardiac', 'cardio', 'coronary', 'bypass', 'cabg', 'angioplasty', 'valve', 'hypertension', 'blood pressure', 'arrhythmia', 'heart failure'],
  Gastroenterology: ['pancreatic', 'pancreas', 'pancreatitis', 'pancreatectomy', 'whipple', 'digestive', 'stomach', 'gut', 'colon', 'gallbladder', 'cholecystectomy', 'ercp', 'eus', 'bile', 'acid reflux', 'gerd', 'gastro'],
  Hepatology: ['liver', 'cirrhosis', 'jaundice', 'hepatitis', 'fatty liver', 'ascites'],
  Nephrology: ['kidney', 'renal', 'dialysis', 'hemodialysis', 'kidney stone', 'ckd', 'creatinine', 'urea', 'nephro', 'renal failure'],
  Oncology: ['cancer', 'tumor', 'tumour', 'chemo', 'chemotherapy', 'radiation', 'carcinoma', 'malignancy', 'oncology', 'biopsy', 'lymphoma', 'leukemia'],
  Neurology: ['brain', 'neuro', 'stroke', 'paralysis', 'epilepsy', 'seizure', 'parkinson', 'dementia', 'alzheimer', 'headache', 'migraine', 'spine'],
  Orthopedics: ['bone', 'joint', 'knee replacement', 'hip replacement', 'fracture', 'arthritis', 'ortho', 'ligament', 'cartilage'],
  Endocrinology: ['diabetes', 'sugar', 'insulin', 'thyroid', 'hormone', 'endocrine', 'pcos'],
  Rheumatology: ['rheumatoid', 'arthritis', 'lupus', 'sle', 'joint pain', 'autoimmune'],
  Pulmonology: ['lung', 'respiratory', 'asthma', 'copd', 'breathing', 'bronchitis', 'pulmonary']
};

// Expanded to include States and Regions
const KNOWN_LOCATIONS = [
  'punjab', 'haryana', 'maharashtra', 'karnataka', 'tamil nadu', 'kerala', 'telangana', 'andhra pradesh', 
  'west bengal', 'odisha', 'assam', 'gujarat', 'rajasthan', 'uttar pradesh', 'bihar', 'madhya pradesh',
  'chandigarh', 'mohali', 'panchkula', 'delhi', 'new delhi', 'ncr', 'gurugram', 'noida',
  'mumbai', 'pune', 'nagpur', 'bengaluru', 'bangalore', 'chennai', 'hyderabad',
  'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 'patna', 'bhopal', 'kochi',
  'coimbatore', 'guwahati', 'bhubaneswar', 'ludhiana', 'amritsar', 'surat', 'indore'
];

// Smart mapping: Translates a state search into its respective state AND major nearby cities
const REGION_EXPANSION = {
  'punjab': ['punjab', 'chandigarh', 'mohali', 'ludhiana', 'amritsar', 'jalandhar', 'panchkula'],
  'haryana': ['haryana', 'chandigarh', 'gurugram', 'panchkula', 'faridabad'],
  'ncr': ['delhi', 'new delhi', 'gurugram', 'noida', 'faridabad', 'ghaziabad'],
  'delhi': ['delhi', 'new delhi', 'gurugram', 'noida'],
  'maharashtra': ['maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik']
};

const COMMON_GARBAGE_WORDS = [
  'apple', 'banana', 'orange', 'fruit', 'shoe', 'shirt', 'clothes', 'car', 'bike',
  'laptop', 'phone', 'mobile', 'games', 'movie', 'song', 'cricket', 'football',
  'pizza', 'burger', 'hotel', 'flight', 'shopping', 'random', 'test', 'hello', 'hi'
];

function parseNaturalQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  const text = rawQuery.toLowerCase().trim();
  const tokens = text.split(/[\s,?.!]+/);

  const isPureGarbage = tokens.every(token => COMMON_GARBAGE_WORDS.includes(token));
  if (isPureGarbage && tokens.length > 0) {
    return { isValid: false, reason: "Input appears to be non-medical. Please search for a health condition, procedure, or hospital service." };
  }

  const matchedSpecialties = new Set();
  for (const [specialty, keywords] of Object.entries(MEDICAL_TAXONOMY)) {
    for (const kw of keywords) {
      if (text.includes(kw)) matchedSpecialties.add(specialty);
    }
  }

  // Smart Location Extraction
  let primaryLocationString = '';
  let detectedLocations = [];
  
  // Sort by length so "new delhi" matches before "delhi"
  const sortedLocs = [...KNOWN_LOCATIONS].sort((a, b) => b.length - a.length);
  for (const loc of sortedLocs) {
    const regex = new RegExp(`\\b${loc}\\b`, 'i');
    if (regex.test(text)) {
      primaryLocationString = loc.charAt(0).toUpperCase() + loc.slice(1);
      if (REGION_EXPANSION[loc]) {
        detectedLocations.push(...REGION_EXPANSION[loc]);
      } else {
        detectedLocations.push(loc);
      }
      break; 
    }
  }

  let detectedBudget = null;
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/);
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  const directNumMatch = text.match(/(?:in|within|under|budget|rs\.?|₹)?\s*([0-9]{4,8})\b/);

  if (lakhMatch) detectedBudget = parseFloat(lakhMatch[1]) * 100000;
  else if (kMatch) detectedBudget = parseFloat(kMatch[1]) * 1000;
  else if (directNumMatch) detectedBudget = parseInt(directNumMatch[1], 10);

  if (matchedSpecialties.size === 0 && detectedLocations.length === 0 && !detectedBudget) {
    if (tokens.length <= 3 && !COMMON_GARBAGE_WORDS.some(w => text.includes(w))) {
      return { isValid: true, isNameSearch: true, term: text };
    }
    return {
      isValid: false,
      reason: "Could not identify a recognized health condition, medical specialty, or target hospital in your search. Please try terms like 'pancreatic diseases in Punjab', 'cardiology in Delhi', or 'kidney dialysis'."
    };
  }

  return {
    isValid: true,
    isNameSearch: false,
    specialties: Array.from(matchedSpecialties),
    locations: detectedLocations,
    primaryLocationString, // Used for UI display
    budget: detectedBudget
  };
}

// --- NEW: Extracted core search logic so the AI can use it internally ---
// Export executeSearch so aiController can invoke the exact same regional/budget matching
export const executeSearch = async (q, city, specialization, maxBudget, sortBy) => {
  let targetSpecialties = [];
  let targetLocations = [];
  let primaryLocString = '';
  let targetBudget = maxBudget ? Number(maxBudget) : null;
  let isDirectName = false;
  let directNameTerm = '';

  if (q && q.trim().length > 0) {
    const parsed = parseNaturalQuery(q);
    if (!parsed.isValid) return { isInvalidQuery: true, message: parsed.reason, hospitals: [] };

    if (parsed.isNameSearch) {
      isDirectName = true;
      directNameTerm = parsed.term;
    } else {
      targetSpecialties = parsed.specialties;
      targetLocations = parsed.locations;
      primaryLocString = parsed.primaryLocationString;
      if (!targetBudget && parsed.budget) targetBudget = parsed.budget;
    }
  }

  if (specialization && !targetSpecialties.includes(specialization)) {
    targetSpecialties.push(specialization);
  }

  if (city) {
    targetLocations.push(city);
  }

  let dbQuery = {};
  const andConditions = [];

  if (isDirectName) {
    andConditions.push({
      $or: [
        { name: { $regex: directNameTerm,$options: 'i' } },
        { specializations: { $regex: directNameTerm,$options: 'i' } }
      ]
    });
  } else {
    if (targetLocations.length > 0) {
      const locRegexes = targetLocations.map(l => new RegExp(l, 'i'));
      andConditions.push({
        $or: [{ 'location.city': { $in: locRegexes } }, { 'location.state': {$in: locRegexes } }]
      });
    }
    if (targetSpecialties.length > 0) {
      const specRegexes = targetSpecialties.map(s => new RegExp(s, 'i'));
      andConditions.push({
        $or: [{ specializations: { $in: specRegexes } }, { chronicConditionsHandled: {$in: specRegexes } }]
      });
    }
  }

  if (andConditions.length > 0) dbQuery.$and = andConditions;

  let rawHospitals = await Hospital.find(dbQuery).limit(100).lean();

  let locationRelaxed = false;
  if (rawHospitals.length === 0 && targetLocations.length > 0 && targetSpecialties.length > 0) {
    const specRegexes = targetSpecialties.map(s => new RegExp(s, 'i'));
    rawHospitals = await Hospital.find({
      $or: [{ specializations: { $in: specRegexes } }, { chronicConditionsHandled: {$in: specRegexes } }]
    }).limit(50).lean();
    locationRelaxed = true;
  }

  const scoredHospitals = rawHospitals.map(hospital => {
    let matchScore = 50;
    const matchExplanations = [];

    const hasSpec = targetSpecialties.some(ts =>
      hospital.specializations.some(s => s.toLowerCase() === ts.toLowerCase()) ||
      hospital.chronicConditionsHandled.some(c => c.toLowerCase().includes(ts.toLowerCase()))
    );
    if (hasSpec) { matchScore += 25; matchExplanations.push(`Specialists in ${targetSpecialties.join(' & ')}`); }

    if (targetBudget) {
      const affordable = hospital.procedures.filter(p => p.estimatedCost.min <= targetBudget);
      if (affordable.length > 0) { matchScore += 15; matchExplanations.push(`Procedures starting within ₹${targetBudget.toLocaleString()}`); } 
      else { matchScore -= 5; matchExplanations.push(`Packages may exceed ₹${targetBudget.toLocaleString()}`); }
    }

    if (hospital.metrics?.successRate >= 90) { matchScore += 10; matchExplanations.push(`Clinical success rate: ${hospital.metrics.successRate}%`); }

    if (targetLocations.length > 0) {
      const hCity = hospital.location.city.toLowerCase();
      const hState = hospital.location.state.toLowerCase();
      const isLocMatch = targetLocations.some(l => hCity.includes(l.toLowerCase()) || hState.includes(l.toLowerCase()));
      if (isLocMatch && !locationRelaxed) { matchScore += 8; matchExplanations.push(`Located in ${hospital.location.city}, ${hospital.location.state}`); } 
      else if (locationRelaxed) { matchExplanations.push(`Nationwide specialized center (outside requested region)`); }
    }

    matchScore = Math.min(94, Math.max(50, matchScore));
    return { ...hospital, matchScore, matchExplanations };
  });

  const sort = sortBy || 'successRate';
  if (sort === 'successRate') scoredHospitals.sort((a, b) => (b.metrics?.successRate || 0) - (a.metrics?.successRate || 0));
  else if (sort === 'budgetLow') scoredHospitals.sort((a, b) => (a.procedures?.[0]?.estimatedCost?.min || 9999999) - (b.procedures?.[0]?.estimatedCost?.min || 9999999));
  
  return {
    isInvalidQuery: false,
    parsedQuery: { detectedLocation: primaryLocString, detectedSpecialties: targetSpecialties, detectedBudget: targetBudget },
    hospitals: scoredHospitals
  };
};

export const searchHospitals = async (req, res) => {
  try {
    const { q, city, specialization, maxBudget, sortBy } = req.query;
    const result = await executeSearch(q, city, specialization, maxBudget, sortBy);

    if (result.isInvalidQuery) {
      return res.status(200).json({ success: true, count: 0, isInvalidQuery: true, message: result.message, hospitals: [] });
    }

    res.status(200).json({
      success: true,
      count: result.hospitals.length,
      parsedQuery: result.parsedQuery,
      hospitals: result.hospitals
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ success: false, message: "Search service encountered an issue" });
  }
};


export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });
    res.status(200).json({ success: true, hospital });
  } catch (error) { res.status(500).json({ success: false, message: "Failed" }); }
};

export const compareHospitals = async (req, res) => {
  try {
    const { hospitalIds } = req.body;
    if (!hospitalIds || !Array.isArray(hospitalIds)) return res.status(400).json({ success: false, message: "Provide an array" });
    const hospitals = await Hospital.find({ _id: { $in: hospitalIds } });
    res.status(200).json({ success: true, hospitals });
  } catch (error) { res.status(500).json({ success: false, message: "Failed" }); }
};

export const seedDemoHospitals = async (req, res) => {
  try {
    await Hospital.deleteMany();
    const inserted = await Hospital.insertMany(completeHospitalList);
    res.status(201).json({ success: true, message: `Seeded ${inserted.length} records!`, count: inserted.length });
  } catch (error) { res.status(500).json({ success: false, message: "Failed" }); }
};

// --- NEW: Interactive Map Data with Self-Healing Geocoding ---
const CITY_COORDINATES = {
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'mohali': { lat: 30.7046, lng: 76.7179 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'panchkula': { lat: 30.6942, lng: 76.8606 },
  'default': { lat: 22.9734, lng: 78.6569 } // Central India fallback
};

export const getMapData = async (req, res) => {
  try {
    const hospitals = await Hospital.find().lean();
    
    // Aggregate all reports to determine genuine performance statuses
    const reportAggregates = await Report.aggregate([
      {
        $group: {
          _id: '$hospital',
          totalReports: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['Pending', 'Under Review', 'In Progress']] }, 1, 0] } },
          criticalOpen: { $sum: { $cond: [ { $and: [{ $eq: ['$severity', 'Critical'] }, { $ne: ['$status', 'Resolved'] }] }, 1, 0 ] } }
        }
      }
    ]);

    const reportMap = new Map();
    reportAggregates.forEach(agg => reportMap.set(agg._id.toString(), agg));

    const bulkUpdates = [];
    
    const mapData = hospitals.map(h => {
      // 1. SELF-HEALING GEOCODING: If coordinates are missing, assign and save them
      let coords = h.location?.coordinates;
      if (!coords || !coords.lat || !coords.lng) {
        const cityKey = h.location.city.toLowerCase();
        const baseCoords = CITY_COORDINATES[cityKey] || CITY_COORDINATES['default'];
        
        // Add tiny random jitter so hospitals in the same city don't perfectly overlap
        coords = {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.05,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.05
        };
        
        // Queue database update so we never have to geocode this hospital again
        bulkUpdates.push({
          updateOne: { filter: { _id: h._id }, update: { $set: { 'location.coordinates': coords } } }
        });
      }

      // 2. PERFORMANCE CALCULATION
      const stats = reportMap.get(h._id.toString()) || { totalReports: 0, resolved: 0, pending: 0, criticalOpen: 0 };
      const resolutionRate = stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : null;
      
      let performanceStatus = 'Insufficient Data';
      if (stats.totalReports > 0) {
        if (stats.criticalOpen >= 1 || stats.pending >= 4) {
          performanceStatus = 'Requires Attention';
        } else if (stats.pending >= 2 || resolutionRate < 75) {
          performanceStatus = 'Needs Monitoring';
        } else {
          performanceStatus = 'Good';
        }
      }

      return {
        id: h._id,
        name: h.name,
        type: h.type,
        city: h.location.city,
        state: h.location.state,
        coordinates: coords,
        specializations: h.specializations,
        performanceStatus,
        stats: {
          ...stats,
          resolutionRate,
          clinicalSuccessRate: h.metrics?.successRate
        }
      };
    });

    // Fire and forget coordinates update in the background
    if (bulkUpdates.length > 0) {
      Hospital.bulkWrite(bulkUpdates).catch(err => console.error("Geocoding save error:", err));
    }

    res.status(200).json({
      success: true,
      lastUpdated: new Date().toISOString(),
      hospitals: mapData
    });

  } catch (error) {
    console.error("Map Data Error:", error);
    res.status(500).json({ success: false, message: "Failed to load map data" });
  }
};