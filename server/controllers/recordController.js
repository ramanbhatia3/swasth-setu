import path from 'path';
import MedicalRecord from '../models/MedicalRecord.js';

// 1. UPLOAD A RECORD
export const uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, category, reportDate } = req.body;

    const record = await MedicalRecord.create({
      user: req.user._id,
      title,
      category,
      originalFileName: req.file.originalname,
      internalFilePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      reportDate: reportDate || Date.now()
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to upload record" });
  }
};

// 2. GET ALL RECORDS FOR LOGGED IN USER
export const getMyRecords = async (req, res) => {
  try {
    // Sort by newest first
    const records = await MedicalRecord.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch records" });
  }
};

// 3. SECURELY VIEW/DOWNLOAD A FILE
export const viewSecureFile = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    // PRIVACY CHECK: Ensure the logged-in user actually owns this file!
    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to medical record" });
    }

    // Resolve absolute path and send file securely
    const absolutePath = path.resolve(record.internalFilePath);
    res.set('Content-Type', record.mimeType);
    res.sendFile(absolutePath);

  } catch (error) {
    console.error("File View Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to securely load file" });
  }
};