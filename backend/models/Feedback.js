const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  stars: { type: Number, default: 5 },
  active: { type: Boolean, default: true } // Para ela poder desativar se quiser
});

module.exports = mongoose.model('Feedback', FeedbackSchema);