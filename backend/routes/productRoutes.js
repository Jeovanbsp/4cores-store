const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const requireAuth = require('../middleware/auth');

// Listar todos os produtos (público)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar novo produto (admin)
router.post('/', requireAuth, async (req, res) => {
  const data = {
    ...req.body,
    status: req.body.soldOut ? 'Esgotado' : 'Disponível'
  };

  const product = new Product(data);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Editar produto (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const data = {
      ...req.body,
      status: req.body.soldOut ? 'Esgotado' : 'Disponível'
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deletar produto (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
