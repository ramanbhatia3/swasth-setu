import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { seedDoctors as seedDoctorsScript } from '../seeders/doctorSeeder.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('hospital', 'name location.city');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Book an appointment
// @route   POST /api/doctors/appointment
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Please provide doctorId, date, and timeSlot" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      date,
      timeSlot
    });

    res.status(201).json({ success: true, data: appointment, message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get user's appointments
// @route   GET /api/doctors/appointments/my
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('doctor', 'name specialization')
      .sort('-createdAt');
      
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Seed doctors via API route (Temporary)
// @route   POST /api/doctors/seed
// @access  Public
export const seedDoctorsRoute = async (req, res) => {
  try {
    const result = await seedDoctorsScript();
    if (!result) {
      return res.status(400).json({ success: false, message: "Failed to seed, no hospitals found." });
    }
    res.json({ success: true, message: `Successfully seeded ${result.count} doctors.` });
  } catch (error) {
    console.error("Error seeding:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
