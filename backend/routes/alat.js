const router = require('express').Router();
const Alat = require('../models/Alat');

// GET semua alat
router.get('/', async (req, res) => {
  const data = await Alat.find();
  res.json(data);
});

// POST tambah alat
router.post('/', async (req, res) => {
  try {
    const alat = new Alat(req.body);
    await alat.save();
    res.json(alat);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal tambah alat' });
  }
});

// 🔥 PUT edit alat
router.put('/:id', async (req, res) => {
  try {
    const alat = await Alat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(alat);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal update alat' });
  }
});

// 🔥 DELETE hapus alat
router.delete('/:id', async (req, res) => {
  try {
    await Alat.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Alat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Gagal hapus alat' });
  }
});

module.exports = router;