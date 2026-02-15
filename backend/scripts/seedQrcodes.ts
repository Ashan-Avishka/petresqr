// scripts/seedQRCodes.ts
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const qrCodeSchema = new mongoose.Schema({
  websiteUrl: String,
  tagId: String,
  qrCodeData: String,
  availability: {
    type: String,
    enum: ['available', 'assigned', 'used'],
    default: 'available'
  }
});

const QRCode = mongoose.models.QRCode || mongoose.model('QRCode', qrCodeSchema);

async function seedQRCodes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const workbook = XLSX.readFile(path.join(__dirname, './QR_codes.xlsx'));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData: any[] = XLSX.utils.sheet_to_json(sheet);
    
    // Map Excel columns to schema fields with availability
    const qrCodes = excelData.map(row => ({
      websiteUrl: row['Website URL'] || row.websiteUrl || '',
      tagId: row['Tag ID'] || row.tagId || '',
      qrCodeData: row['QR Code Data'] || row.qrCodeData || '',
      availability: 'available' // All new QR codes start as available
    }));

    await QRCode.deleteMany({});
    await QRCode.insertMany(qrCodes);
    
    console.log(`✅ Imported ${qrCodes.length} QR codes`);
    
    // Show stats
    const total = await QRCode.countDocuments();
    const available = await QRCode.countDocuments({ availability: 'available' });
    console.log(`📊 Total: ${total}, Available: ${available}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedQRCodes();