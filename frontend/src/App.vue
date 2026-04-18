<template>
  <div id="app-container">
    <Notification 
      :message="toastMsg" 
      :type="toastType" 
      v-model:show="showToast" 
    />

    <Navbar @open-login="showLoginModal = true" />
    
    <Transition name="fade">
      <div v-if="showLoginModal" class="login-overlay" @click.self="showLoginModal = false">
        <div class="login-card">
          <div class="login-header">
            <div class="icon-backdrop">
              <span style="font-size: 20px; font-weight: bold;">4C</span>
            </div>
            <h2>Acesso Restrito</h2>
            <p>Gerenciamento da Loja 4Cores</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-wrapper">
              <input 
                v-model="passwordInput" 
                type="password" 
                placeholder="Senha administrativa" 
                class="modern-input"
                style="padding-left: 15px;" 
                required 
                autofocus
              />
            </div>
            
            <div class="login-actions">
              <button type="button" @click="showLoginModal = false" class="btn-cancel-glass">Cancelar</button>
              <button type="submit" class="btn-auth-solid" :disabled="loading">
                {{ loading ? 'Conectando...' : 'Acessar Painel' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <main>
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p><strong>4Cores - Salvador, BA</strong></p>
        <p>Seg-Sex: 07h às 16h | Sáb: 08h às 14h | Dom: 08h às 12h</p>
        
        <div class="socials">
          <a href="https://instagram.com/4cores.loja" target="_blank" class="social-link">
            <InstagramIcon class="lucide-icon" />
            @4cores.loja
          </a>
          
          <a href="https://wa.me/5571982184483" target="_blank" class="social-link">
            <MessageCircleIcon class="lucide-icon" />
            (71) 98218-4483
          </a>
        </div>
        
        <p class="copyright">© 2026 4Cores. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Navbar from './components/Navbar.vue'
import Notification from './components/Notification.vue'
import { 
  InstagramIcon, 
  MessageCircleIcon 
} from 'lucide-vue-next'

const router = useRouter()
const showLoginModal = ref(false)
const passwordInput = ref('')
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('error')
const loading = ref(false)

const notify = (msg, type = 'error') => {
  toastMsg.value = msg
  toastType.value = type
  showToast.value = true
}

const handleLogin = async () => {
  loading.value = true
  try {
    // Comunicação real com o backend seguro
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: passwordInput.value
    })

    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      showLoginModal.value = false
      passwordInput.value = ''
      notify("Bem-vindo de volta!", "success")
      router.push('/admin')
    }
  } catch (err) {
    notify("Senha incorreta. Acesso negado.")
    passwordInput.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Reset e Base */
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f4f7f6;
  color: #333;
}

main { min-height: 80vh; padding-bottom: 50px; }

/* Modal e Overlay */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.icon-backdrop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(227, 6, 19, 0.08);
  border-radius: 14px;
  color: #E30613;
  margin-bottom: 15px;
}

.login-header h2 { font-weight: 800; font-size: 1.4rem; color: #111827; margin: 0; }
.login-header p { color: #6b7280; font-size: 0.9rem; margin: 5px 0 25px; }

/* Formulário */
.input-wrapper {
  position: relative;
  width: 100%; 
  margin-bottom: 20px;
}

.modern-input {
  width: 100%; 
  padding: 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #fdfdfd;
  transition: all 0.2s;
}

.modern-input:focus {
  border-color: #E30613;
  outline: none;
  box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.06);
}

.login-actions { display: flex; gap: 12px; }

.btn-auth-solid {
  flex: 1;
  background: #E30613;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-auth-solid:hover { background: #b3050f; }
.btn-auth-solid:disabled { background: #ccc; cursor: not-allowed; }

.btn-cancel-glass {
  flex: 1;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Footer */
.footer {
  background: white;
  padding: 40px 20px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 0.9rem;
}

.footer-content p { margin: 5px 0; }

.socials { 
  margin: 20px 0; 
  display: flex; 
  justify-content: center; 
  gap: 25px; 
  flex-wrap: wrap;
}

.social-link { 
  display: flex;
  align-items: center;
  gap: 8px;
  color: #E30613; 
  text-decoration: none; 
  font-weight: 600; 
  transition: color 0.3s ease;
}

.social-link:hover { color: #008D36; }

.lucide-icon { width: 18px; height: 18px; }

.copyright { 
  font-size: 0.75rem; 
  color: #999; 
  margin-top: 25px !important; 
}

/* Transições */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>