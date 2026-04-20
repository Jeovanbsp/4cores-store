const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' }, // Descrição curta opcional
  // stock mantido no schema para compatibilidade com documentos antigos,
  // mas o sistema passa a usar soldOut para marcar itens indisponíveis.
  stock: { type: Number, default: 1 },
  soldOut: { type: Boolean, default: false },
  status: { type: String, default: 'Disponível' },
  category: { type: String, default: 'venda' },
  topic: { type: String, default: '' },
  visible: { type: Boolean, default: true },
  displayMode: { type: String, default: 'single' }, 
  images: [String] 
});

module.exports = mongoose.model('Product', ProductSchema);