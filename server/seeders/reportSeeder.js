import Hospital from '../models/Hospital.js';
import Report from '../models/Report.js';

export const seedSampleReports = async () => {
  try {
    const reportCount = await Report.countDocuments();
    if (reportCount >= 25) {
      return console.log(`ℹ️ Reports already present (${reportCount} complaints). Skipping seeder.`);
    }

    const hospitals = await Hospital.find().limit(15).lean();
    if (!hospitals || hospitals.length === 0) {
      return console.log('⚠️ No hospitals found to attach reports to. Seed hospitals first.');
    }

    const categories = [
      'Cleanliness', 'Staff Behavior', 'Infrastructure', 'Medicine Availability',
      'Equipment', 'Waiting Time', 'Emergency Services', 'Treatment/Service Issues'
    ];

    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Pending', 'Under Review', 'In Progress', 'Resolved'];
    const officers = [
      { name: 'Dr. Rajesh Verma', email: 'rajesh.verma@swasthsetu.gov.in', role: 'Chief Medical Monitoring Officer' },
      { name: 'Dr. Ananya Iyer', email: 'ananya.iyer@swasthsetu.gov.in', role: 'District Healthcare Commissioner' },
      { name: 'Vikramjit Singh', email: 'vikram.singh@swasthsetu.gov.in', role: 'Hospital Infrastructure Inspector' },
      { name: 'Pooja Kulkarni', email: 'pooja.kulkarni@swasthsetu.gov.in', role: 'Quality & Ethics Grievance Officer' }
    ];

    const descriptions = [
      'The automated dialysis machine was out of order for 6 hours with no technician available.',
      'Emergency room doctors took over 45 minutes to triage chest pain patient upon ambulance arrival.',
      'Government dispensary was out of basic immunosuppressants and insulin cartridges.',
      'Wards on 3rd floor lacked hygienic sanitation and regular linen replacement.',
      'Nursing staff was unresponsive during night shift in the intensive post-operative ward.',
      'Diagnostic ultrasound unit displayed repeated artifact errors delaying procedure approvals.',
      'OPD registration token system experienced server malfunction resulting in massive crowding.',
      'Overcharging noted on surgical disposables beyond standard National Health Authority limits.'
    ];

    const dummyReports = [];

    for (let i = 0; i < hospitals.length; i++) {
      const h = hospitals[i];
      const reportsForThisHospital = (i % 3 === 0) ? 5 : 2; // Some hospitals have higher complaint density

      for (let j = 0; j < reportsForThisHospital; j++) {
        const cat = categories[(i + j) % categories.length];
        const sev = (i === 0 && j === 0) ? 'Critical' : severities[(i + j) % severities.length];
        const stat = statuses[(i + j * 2) % statuses.length];
        const off = officers[(i + j) % officers.length];
        const isRepeated = (j > 0 && cat === categories[i % categories.length]);

        dummyReports.push({
          hospital: h._id,
          hospitalName: h.name,
          reportedBy: {
            name: `Citizen ${i + 1}-${j + 1}`,
            email: `citizen${i}${j}@gmail.com`,
            phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`
          },
          category: cat,
          description: descriptions[(i + j) % descriptions.length],
          severity: sev,
          status: stat,
          assignedOfficer: off,
          adminRemarks: stat === 'Resolved' ? 'Verified on-site by district inspection team. Issue addressed.' : 'Assigned for procedural review.',
          isEscalated: sev === 'Critical' && stat !== 'Resolved',
          isRepeated,
          resolutionDate: stat === 'Resolved' ? new Date(Date.now() - 86400000 * 2) : null,
          createdAt: new Date(Date.now() - 86400000 * (j * 3 + 1))
        });
      }
    }

    await Report.insertMany(dummyReports);
    console.log(`✅ Seeded ${dummyReports.length} realistic citizen healthcare grievances into database!`);
  } catch (err) {
    console.error('Failed to seed reports:', err.message);
  }
};