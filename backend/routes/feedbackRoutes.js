const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema do banco de dados (Sincronizado)
const FeedbackSchema = new mongoose.Schema({
  name: String,
  text: String,
  stars: { type: Number, default: 5 }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

// 1. LISTAR TODOS
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) { res.status(500).json(err); }
});

// 2. CRIAR NOVO
router.post('/', async (req, res) => {
  try {
    const saved = await new Feedback(req.body).save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json(err); }
});

// 3. EDITAR (A rota que estava faltando e dava erro 404)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Feedback não encontrado" });
    res.json(updated);
  } catch (err) { res.status(400).json(err); }
});

// 4. EXCLUIR
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Deletado com sucesso" });
  } catch (err) { res.status(400).json(err); }
});

module.exports = router;