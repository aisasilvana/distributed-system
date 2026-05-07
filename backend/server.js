require('dotenv').config(); // ← TAMBAHKAN INI DI BARIS PERTAMA!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI); // ← ganti juga ini pakai .env

app.use('/auth', require('./routes/auth'));
app.use('/alat', require('./routes/alat'));
app.use('/peminjaman', require('./routes/peminjaman'));

app.listen(process.env.PORT, () => 
  console.log(`Server jalan di http://localhost:${process.env.PORT}`)
);