const router = require('express').Router();
const Peminjaman = require('../models/Peminjaman');
const Alat = require('../models/Alat');
const auth = require('../middleware/auth');

// CREATE PEMINJAMAN
router.post('/', auth, async (req, res) => {
  try {
    const { alatId, jumlah, tanggalKembali, keperluan } = req.body;

    if (!alatId || !jumlah || !tanggalKembali || !keperluan) {
      return res.status(400).json({ msg: 'Semua field wajib diisi' });
    }

    const alat = await Alat.findById(alatId);
    if (!alat) return res.status(404).json({ msg: 'Alat tidak ditemukan' });

    if (alat.stok < jumlah) {
      return res.status(400).json({ msg: `Stok tidak cukup. Tersedia: ${alat.stok}` });
    }

    alat.stok -= jumlah;
    await alat.save();

    const peminjaman = new Peminjaman({
      alatId,
      userId: req.user.id,
      jumlah,
      keperluan,
      tanggalKembali: new Date(tanggalKembali),
      tanggalPinjam: new Date(),
      status: 'Menunggu',
    });

    await peminjaman.save();
    res.json({ msg: 'Berhasil ajukan peminjaman' });

  } catch (err) {
    console.error('POST /peminjaman error:', err);
    res.status(500).json({ msg: 'Gagal pinjam', error: err.message });
  }
});

// GET PEMINJAMAN
router.get('/', auth, async (req, res) => {
  try {
    // mahasiswa hanya lihat miliknya, admin/dosen lihat semua
    const filter = req.user.role === 'mahasiswa'
      ? { userId: req.user.id }
      : {};

    const data = await Peminjaman.find(filter)
      .populate('alatId', 'nama stok')
      .populate('userId', 'nama email')
      .sort({ createdAt: -1 });

    const result = data.map(p => ({
      _id: p._id,
      alat: p.alatId,
      user: p.userId,
      jumlah: p.jumlah,
      keperluan: p.keperluan,
      tanggalPinjam: p.tanggalPinjam,
      tanggalKembali: p.tanggalKembali,
      status: p.status,
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /peminjaman error:', err);
    res.status(500).json({ msg: 'Gagal ambil data', error: err.message });
  }
});

// SETUJUI PEMINJAMAN
router.put('/:id/setujui', auth, async (req, res) => {
  try {
    await Peminjaman.findByIdAndUpdate(req.params.id, { status: 'Dipinjam' });
    res.json({ msg: 'Peminjaman disetujui' });
  } catch (err) {
    console.error('PUT /setujui error:', err);
    res.status(500).json({ msg: 'Gagal setujui' });
  }
});

// KEMBALIKAN ALAT
router.put('/:id/kembalikan', auth, async (req, res) => {
  try {
    const p = await Peminjaman.findById(req.params.id);
    if (!p) return res.status(404).json({ msg: 'Data tidak ditemukan' });

    // Kembalikan stok
    const alat = await Alat.findById(p.alatId);
    if (alat) {
      alat.stok += p.jumlah;
      await alat.save();
    }

    await Peminjaman.findByIdAndUpdate(req.params.id, { status: 'Dikembalikan' });
    res.json({ msg: 'Alat berhasil dikembalikan' });
  } catch (err) {
    console.error('PUT /kembalikan error:', err);
    res.status(500).json({ msg: 'Gagal kembalikan' });
  }
});

module.exports = router;