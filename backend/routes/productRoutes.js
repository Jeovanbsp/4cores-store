const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Listar todos os produtos
//
// Usamos .lean() para receber POJOs sem os defaults do schema (Mongoose
// preenche `soldOut: false` nos docs hidratados mesmo quando o campo não
// existe no MongoDB). Assim conseguimos detectar docs antigos que não
// possuem `soldOut` e derivar o valor a partir do `stock` legado.
// Como .lean() também desabilita os defaults dos demais campos, aplicamos
// defaults equivalentes ao schema para proteger os consumidores no frontend
// (ex.: Admin.vue acessa p.images[0] sem null-guard).
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    const normalized = products.map(p => {
      const soldOut = typeof p.soldOut === 'boolean'
        ? p.soldOut
        : (typeof p.stock === 'number' && p.stock <= 0);
      return {
        ...p,
        soldOut,
        images: Array.isArray(p.images) ? p.images : [],
        visible: typeof p.visible === 'boolean' ? p.visible : true,
        category: typeof p.category === 'string' ? p.category : 'venda',
        displayMode: typeof p.displayMode === 'string' ? p.displayMode : 'single',
        description: typeof p.description === 'string' ? p.description : '',
        topic: typeof p.topic === 'string' ? p.topic : '',
        status: soldOut ? 'Esgotado' : 'Disponível',
      };
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Criar novo produto
router.post('/', async (req, res) => {
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

// Editar produto
router.put('/:id', async (req, res) => {
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