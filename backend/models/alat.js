const mongoose = require('mongoose');

const AlatSchema = new mongoose.Schema({
  nama: String,
  stok: Number,
});

module.exports = mongoose.model('Alat', AlatSchema);