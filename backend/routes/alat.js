const router = require('express').Router();
const Alat = require('../models/Alat');

// ambil semua alat
router.get('/', async (req, res) => {
  const data = await Alat.find();
  res.json(data);
});

// tambah alat (optional)
router.post('/', async (req, res) => {
  const alat = new Alat(req.body);
  await alat.save();
  res.json(alat);
});

module.exports = router;