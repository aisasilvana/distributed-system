const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    const emailNormalized = email.toLowerCase().trim();
    const hash = await bcrypt.hash(password, 10);
    await User.create({ nama, email, password: hash, role });
    res.json({ msg: 'Registrasi berhasil' });
  } catch (e) {
    res.status(400).json({ msg: 'Email sudah digunakan' });
  }
});

router.post('/login', async (req, res) => {
const { email, password } = req.body;
const emailNormalized = email.toLowerCase().trim();

const user = await User.findOne({ email: emailNormalized });
  if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ msg: 'Password salah' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { nama: user.nama, role: user.role } });
});

module.exports = router;