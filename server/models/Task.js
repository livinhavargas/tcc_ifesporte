const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  descricao: { type: String, default: '' },
  prazo: { type: String, default: '' },
  done: { type: Boolean, default: false },
  criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
