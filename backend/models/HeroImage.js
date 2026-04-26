const mongoose = require('mongoose');

const HeroImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  altText: { type: String, default: '' },
  link: { type: String, default: '' }, // Link opcional para onde a imagem pode redirecionar
  position: { type: Number, default: 0 }, // Posição no carrossel
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HeroImage', HeroImageSchema);