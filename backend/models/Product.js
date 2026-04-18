const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' }, // ADICIONADO: Para salvar a descrição curta
  stock: { type: Number, default: 1 },
  status: { type: String, default: 'Disponível' },
  category: { type: String, default: 'venda' },
  topic: { type: String, default: '' },
  visible: { type: Boolean, default: true },
  displayMode: { type: String, default: 'single' }, 
  images: [String] 
});

module.exports = mongoose.model('Product', ProductSchema);