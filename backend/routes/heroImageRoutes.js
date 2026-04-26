const express = require('express');
const router = express.Router();
const HeroImage = require('../models/HeroImage');
const requireAuth = require('../middleware/auth');

// Listar todas as hero images (público) - ordenadas por posição
router.get('/', async (req, res) => {
  try {
    const heroImages = await HeroImage.find().sort({ position: 1 });
    res.json(heroImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar nova hero image (admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    // Pegar a maior posição atual
    const lastImage = await HeroImage.findOne().sort({ position: -1 });
    const newPosition = lastImage ? lastImage.position + 1 : 0;

    const heroImage = new HeroImage({
      imageUrl: req.body.imageUrl,
      altText: req.body.altText || '',
      link: req.body.link || '',
      position: newPosition
    });

    const savedImage = await heroImage.save();
    res.status(201).json(savedImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Atualizar hero image (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await HeroImage.findByIdAndUpdate(
      req.params.id,
      {
        imageUrl: req.body.imageUrl,
        altText: req.body.altText,
        link: req.body.link,
        position: req.body.position
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deletar hero image (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await HeroImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hero image removida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// reorder - reordernar posições (admin)
router.post('/reorder', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body; // Array de IDs na ordem desejada
    for (let i = 0; i < ids.length; i++) {
      await HeroImage.findByIdAndUpdate(ids[i], { position: i });
    }
    const heroImages = await HeroImage.find().sort({ position: 1 });
    res.json(heroImages);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;