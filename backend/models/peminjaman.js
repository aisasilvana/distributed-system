const mongoose = require('mongoose');

const PeminjamanSchema = new mongoose.Schema({
  alatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alat' },
  jumlah: Number,
  tanggalPinjam: { type: Date, default: Date.now },
  tanggalKembali: Date,
  status: { type: String, default: 'Menunggu' },
});

module.exports = mongoose.model('Peminjaman', PeminjamanSchema);