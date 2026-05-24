require('dotenv').config();
const mongoose = require('mongoose');
const Alat = require('./models/alat'); 
const Peminjaman = require('./models/peminjaman'); // 👈 TAMBAHKAN INI (sesuaikan nama file modelnya)

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 👈 TAMBAHKAN INI UNTUK MEMBERSIHKAN DATA PEMINJAMAN YANG ERROR
    await Peminjaman.deleteMany({});
    console.log('🗑️ Data Peminjaman lama yang rusak berhasil dihapus');

    await Alat.deleteMany({});
    console.log('🗑️ Data Alat lama dihapus');

    const result = await Alat.insertMany([
      { nama: 'Access Point', stok: 5 },
      { nama: 'Kabel UTP', stok: 10 },
      { nama: 'Router', stok: 3 },
      { nama: 'Switch', stok: 4 },
      { nama: 'NIC', stok: 7 },
      { nama: 'Crimping Tool', stok: 2 },
      { nama: 'Cable Stripper', stok: 3 },
      { nama: 'Lan Tester', stok: 4 },
      { nama: 'Tone Generator dan Probe', stok: 2 },
      { nama: 'Ups Cadangan Listrik', stok: 1 },
    ]);

    console.log(`✅ ${result.length} data alat berhasil di-seed!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seed();