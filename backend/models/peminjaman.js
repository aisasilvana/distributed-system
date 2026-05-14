const mongoose = require('mongoose');

const PeminjamanSchema = new mongoose.Schema({
  alatId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Alat', required: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jumlah:        { type: Number, required: true },
  keperluan:     { type: String, required: true },
  tanggalPinjam: { type: Date, default: Date.now },
  tanggalKembali:{ type: Date, required: true },
  status:        { type: String, default: 'Menunggu' },
}, { timestamps: true });

module.exports = mongoose.model('Peminjaman', PeminjamanSchema);