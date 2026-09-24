import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
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

    // Check if the file is stored in Cloudinary (starts with http) or is a legacy local file
    if (record.internalFilePath.startsWith('http')) {
      const response = await axios.get(record.internalFilePath, { responseType: 'stream' });
      res.set('Content-Type', record.mimeType);
      response.data.pipe(res);
    } else {
      // Resolve absolute path and send file securely for legacy files
      const absolutePath = path.resolve(record.internalFilePath);
      res.set('Content-Type', record.mimeType);
      res.sendFile(absolutePath);
    }

  } catch (error) {
    console.error("File View Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to securely load file" });
  }
};

// 4. DELETE A RECORD
export const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to medical record" });
    }

    if (record.internalFilePath.startsWith('http')) {
      // Extract public_id from Cloudinary URL (assuming format: .../upload/v1234/folder/filename.ext)
      const urlParts = record.internalFilePath.split('/');
      const filenameWithExt = urlParts.pop();
      const folder = urlParts.pop();
      const filename = filenameWithExt.split('.')[0];
      const publicId = `${folder}/${filename}`;
      
      await cloudinary.uploader.destroy(publicId);
    } else {
      const absolutePath = path.resolve(record.internalFilePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete record" });
  }
};