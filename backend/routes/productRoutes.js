const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar novo produto
router.post('/', async (req, res) => {
  const data = {
    ...req.body,
    status: req.body.stock > 0 ? 'Disponível' : 'Esgotado'
  };
  
  const product = new Product(data);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Editar produto
router.put('/:id', async (req, res) => {
  try {
    const data = {
      ...req.body,
      status: req.body.stock > 0 ? 'Disponível' : 'Esgotado'
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

// Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;