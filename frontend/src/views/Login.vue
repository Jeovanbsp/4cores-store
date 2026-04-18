<template>
  <div class="login-page">
    <div class="glass-card login-box">
      <div class="card-header">
        <h2>Acesso ao Painel <span>4Cores</span></h2>
      </div>

      <form @submit.prevent="handleLogin" class="modern-form">
        <div class="input-group">
          <label>Usuário</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="Digite seu usuário" 
            required 
          />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Autenticando...' : 'Entrar no Sistema' }}
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username: username.value,
      password: password.value
    });
    
    // Salva o token para as próximas requisições
    localStorage.setItem('token', res.data.token);
    
    // Redireciona para o Admin
    router.push('/admin');
  } catch (err) {
    error.value = "Usuário ou senha inválidos!";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc; /* Mesmo fundo da sua página admin */
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

.card-header span {
  color: #E30613;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  margin-top: 15px;
  background: #fee2e2;
  padding: 10px;
  border-radius: 8px;
}

/* Reaproveitando seus estilos globais do Admin */
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

input { 
  padding: 12px 16px; 
  border: 1.5px solid #e2e8f0; 
  border-radius: 12px; 
  font-size: 1rem;
}

input:focus {
  border-color: #E30613;
  outline: none;
  box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.05);
}

.btn-primary {
  background: #1e293b;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #E30613;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>