import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';

export const seedDoctors = async () => {
  try {
    // We clear existing doctors first to avoid duplicates if run multiple times
    await Doctor.deleteMany();

    // Fetch existing hospitals to map doctors to real hospitals
    const hospitals = await Hospital.find().limit(5);

    if (hospitals.length === 0) {
      console.log('No hospitals found in DB. Doctors cannot be seeded.');
      return;
    }

    const doctorsData = [
      {
        name: 'Dr. Rajesh Sharma',
        specialization: 'Cardiologist',
        hospital: hospitals[0]._id,
        experienceYears: 15,
        qualifications: 'MBBS, MD, DM',
        consultationFee: 1500,
        availability: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM']
      },
      {
        name: 'Dr. Anjali Desai',
        specialization: 'Cardiologist',
        hospital: hospitals[1 % hospitals.length]._id,
        experienceYears: 12,
        qualifications: 'MBBS, MD',
        consultationFee: 1200,
        availability: ['09:00 AM', '11:00 AM', '01:00 PM', '03:30 PM']
      },
      {
        name: 'Dr. Vivek Kumar',
        specialization: 'Oncologist',
        hospital: hospitals[2 % hospitals.length]._id,
        experienceYears: 20,
        qualifications: 'MBBS, MD, DM (Medical Oncology)',
        consultationFee: 2000,
        availability: ['11:00 AM', '01:00 PM', '04:30 PM']
      },
      {
        name: 'Dr. Neha Patel',
        specialization: 'Oncologist',
        hospital: hospitals[3 % hospitals.length]._id,
        experienceYears: 18,
        qualifications: 'MBBS, MS, MCh (Surgical Oncology)',
        consultationFee: 2500,
        availability: ['09:30 AM', '12:00 PM', '02:30 PM']
      },
      {
        name: 'Dr. Sanjay Gupta',
        specialization: 'Neurologist',
        hospital: hospitals[4 % hospitals.length]._id,
        experienceYears: 14,
        qualifications: 'MBBS, MD, DM',
        consultationFee: 1800,
        availability: ['10:00 AM', '12:30 PM', '03:00 PM', '05:00 PM']
      },
      {
        name: 'Dr. Meera Iyer',
        specialization: 'Neurologist',
        hospital: hospitals[0]._id,
        experienceYears: 10,
        qualifications: 'MBBS, MD',
        consultationFee: 1000,
        availability: ['09:00 AM', '10:30 AM', '12:00 PM']
      },
      {
        name: 'Dr. Amit Singh',
        specialization: 'Orthopedics',
        hospital: hospitals[1 % hospitals.length]._id,
        experienceYears: 22,
        qualifications: 'MBBS, MS (Orthopedics)',
        consultationFee: 1600,
        availability: ['10:00 AM', '11:30 AM', '01:30 PM', '03:30 PM']
      },
      {
        name: 'Dr. Priya Reddy',
        specialization: 'Orthopedics',
        hospital: hospitals[2 % hospitals.length]._id,
        experienceYears: 8,
        qualifications: 'MBBS, MS, DNB',
        consultationFee: 800,
        availability: ['08:30 AM', '10:00 AM', '11:30 AM']
      },
      {
        name: 'Dr. Anil Mehta',
        specialization: 'Nephrology',
        hospital: hospitals[3 % hospitals.length]._id,
        experienceYears: 16,
        qualifications: 'MBBS, MD, DM (Nephrology)',
        consultationFee: 1400,
        availability: ['11:00 AM', '01:00 PM', '04:00 PM', '06:00 PM']
      },
      {
        name: 'Dr. Sunita Rao',
        specialization: 'Nephrology',
        hospital: hospitals[4 % hospitals.length]._id,
        experienceYears: 11,
        qualifications: 'MBBS, MD',
        consultationFee: 1200,
        availability: ['09:00 AM', '10:30 AM', '12:30 PM', '03:00 PM']
      },
      {
        name: 'Dr. Vikram Joshi',
        specialization: 'Gastroenterology',
        hospital: hospitals[0]._id,
        experienceYears: 19,
        qualifications: 'MBBS, MD, DM',
        consultationFee: 1700,
        availability: ['10:00 AM', '12:00 PM', '02:00 PM', '04:30 PM']
      },
      {
        name: 'Dr. Kavita Nair',
        specialization: 'Gastroenterology',
        hospital: hospitals[1 % hospitals.length]._id,
        experienceYears: 13,
        qualifications: 'MBBS, MD',
        consultationFee: 1300,
        availability: ['09:30 AM', '11:30 AM', '02:30 PM']
      }
    ];

    await Doctor.insertMany(doctorsData);
    console.log(`Seeded ${doctorsData.length} doctors successfully!`);
    return { success: true, count: doctorsData.length };
  } catch (error) {
    console.error(`Error seeding doctors: ${error.message}`);
    throw error;
  }
};
