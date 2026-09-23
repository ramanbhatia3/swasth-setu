import Hospital from '../models/Hospital.js';
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

export const searchHospitals = async (req, res) => {
  try {
    const { q, sortBy } = req.query;

    let targetSpecialties = [];
    let targetLocations = [];
    let primaryLocString = '';
    let targetBudget = null;
    let isDirectName = false;
    let directNameTerm = '';

    if (q && q.trim().length > 0) {
      const parsed = parseNaturalQuery(q);

      if (!parsed.isValid) {
        return res.status(200).json({
          success: true, count: 0, isInvalidQuery: true, message: parsed.reason, hospitals: []
        });
      }

      if (parsed.isNameSearch) {
        isDirectName = true;
        directNameTerm = parsed.term;
      } else {
        targetSpecialties = parsed.specialties;
        targetLocations = parsed.locations;
        primaryLocString = parsed.primaryLocationString;
        targetBudget = parsed.budget;
      }
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
      // NEW: Search BOTH City and State fields with all regional keywords
      if (targetLocations.length > 0) {
        const locRegexes = targetLocations.map(l => new RegExp(l, 'i'));
        andConditions.push({
          $or: [
            { 'location.city': { $in: locRegexes } },
            { 'location.state': { $in: locRegexes } }
          ]
        });
      }
      if (targetSpecialties.length > 0) {
        const specRegexes = targetSpecialties.map(s => new RegExp(s, 'i'));
        andConditions.push({
          $or: [
            { specializations: { $in: specRegexes } },
            { chronicConditionsHandled: { $in: specRegexes } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      dbQuery.$and = andConditions;
    }

    let rawHospitals = await Hospital.find(dbQuery).limit(100).lean();

    // Fallback: If regional search yields 0 results, drop location and search nationwide
    let locationRelaxed = false;
    if (rawHospitals.length === 0 && targetLocations.length > 0 && targetSpecialties.length > 0) {
      const specRegexes = targetSpecialties.map(s => new RegExp(s, 'i'));
      rawHospitals = await Hospital.find({
        $or: [
          { specializations: { $in: specRegexes } },
          { chronicConditionsHandled: { $in: specRegexes } }
        ]
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
      if (hasSpec) {
        matchScore += 25;
        matchExplanations.push(`Specialists in ${targetSpecialties.join(' & ')}`);
      }

      if (targetBudget) {
        const affordable = hospital.procedures.filter(p => p.estimatedCost.min <= targetBudget);
        if (affordable.length > 0) {
          matchScore += 15;
          matchExplanations.push(`Procedures starting within ₹${targetBudget.toLocaleString()}`);
        } else {
          matchScore -= 5;
          matchExplanations.push(`Packages may exceed ₹${targetBudget.toLocaleString()}`);
        }
      }

      if (hospital.metrics?.successRate >= 90) {
        matchScore += 10;
        matchExplanations.push(`Clinical success rate: ${hospital.metrics.successRate}%`);
      }

      if (targetLocations.length > 0) {
        const hCity = hospital.location.city.toLowerCase();
        const hState = hospital.location.state.toLowerCase();
        const isLocMatch = targetLocations.some(l => hCity.includes(l.toLowerCase()) || hState.includes(l.toLowerCase()));

        if (isLocMatch && !locationRelaxed) {
          matchScore += 8;
          matchExplanations.push(`Located in ${hospital.location.city}, ${hospital.location.state}`);
        } else if (locationRelaxed) {
          matchExplanations.push(`Nationwide specialized center (outside requested region)`);
        }
      }

      matchScore = Math.min(94, Math.max(50, matchScore));
      return { ...hospital, matchScore, matchExplanations };
    });

    const sort = sortBy || 'successRate';
    if (sort === 'successRate') {
      scoredHospitals.sort((a, b) => (b.metrics?.successRate || 0) - (a.metrics?.successRate || 0));
    } else if (sort === 'budgetLow') {
      scoredHospitals.sort((a, b) => (a.procedures?.[0]?.estimatedCost?.min || 9999999) - (b.procedures?.[0]?.estimatedCost?.min || 9999999));
    } else if (sort === 'patientCount') {
      scoredHospitals.sort((a, b) => (b.metrics?.successfulPatientsCount || 0) - (a.metrics?.successfulPatientsCount || 0));
    } else if (sort === 'matchScore') {
      scoredHospitals.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.status(200).json({
      success: true,
      count: scoredHospitals.length,
      parsedQuery: {
        detectedLocation: primaryLocString, // Clean string for UI
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