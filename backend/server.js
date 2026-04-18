const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// 1. Configurar CORS profissional
// Isso permite que seu front na Vercel e seu teste local acessem a API
app.use(cors({
  origin: '*', // Em produção, você pode substituir '*' pela URL da Vercel para mais segurança
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Aumentar o limite do JSON para aceitar as fotos em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Conexão com MongoDB Atlas usando variável de ambiente
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Conectado com Sucesso"))
  .catch(err => console.log("❌ Erro ao conectar ao MongoDB:", err));

// 4. Definição das Rotas de Dados
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// 5. Configuração da Porta dinâmica para o Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});