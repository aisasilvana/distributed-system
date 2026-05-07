const router = require('express').Router();
const Peminjaman = require('../models/Peminjaman');
const Alat = require('../models/Alat');
const auth = require('../middleware/auth'); // 🔥 tambah middleware

// 🔥 CREATE PEMINJAMAN
router.post('/', auth, async (req, res) => {
  try {
    const { alatId, jumlah, tanggalKembali, keperluan } = req.body;

    const alat = await Alat.findById(alatId);
    if (!alat) return res.status(404).json({ msg: 'Alat tidak ditemukan' });

    if (alat.stok < jumlah) {
      return res.status(400).json({ msg: 'Stok tidak cukup' });
    }

    alat.stok -= jumlah;
    await alat.save();

    const peminjaman = new Peminjaman({
      alatId,
      userId: req.user.id, // 🔥 simpan siapa yang pinjam
      jumlah,
      tanggalKembali,
      keperluan,
      tanggalPinjam: new Date(),
      status: 'Menunggu' // 🔥 mulai dari Menunggu, bukan langsung Dipinjam
    });

    await peminjaman.save();
    res.json({ msg: 'Berhasil ajukan peminjaman' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Gagal pinjam' });
  }
});

// 🔥 GET PEMINJAMAN
router.get('/', auth, async (req, res) => {
  try {
    const data = await Peminjaman.find()
      .populate('alatId', 'nama') // 🔥 populate alat
      .populate('userId', 'nama email') // 🔥 populate user
      .sort({ createdAt: -1 });

    // 🔥 rename field agar cocok dengan frontend (p.alat, p.user)
    const result = data.map(p => ({
      _id: p._id,
      alat: p.alatId,
      user: p.userId,
      jumlah: p.jumlah,
      tanggalPinjam: p.tanggalPinjam,
      tanggalKembali: p.tanggalKembali,
      keperluan: p.keperluan,
      status: p.status
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal ambil data' });
  }
});

// 🔥 SETUJUI
router.put('/:id/setujui', auth, async (req, res) => {
  try {
    await Peminjaman.findByIdAndUpdate(req.params.id, { status: 'Dipinjam' });
    res.json({ msg: 'Disetujui' });
  } catch (err) {
    res.status(500).json({ msg: 'Gagal setujui' });
  }
});

// 🔥 KEMBALIKAN
router.put('/:id/kembalikan', auth, async (req, res) => {
  try {
    const p = await Peminjaman.findById(req.params.id);
    
    // kembalikan stok
    const alat = await Alat.findById(p.alatId);
    if (alat) {
      alat.stok += p.jumlah;
      await alat.save();
    }

    await Peminjaman.findByIdAndUpdate(req.params.id, { status: 'Dikembalikan' });
    res.json({ msg: 'Dikembalikan' });
  } catch (err) {
    res.status(500).json({ msg: 'Gagal kembalikan' });
  }
});

module.exports = router;