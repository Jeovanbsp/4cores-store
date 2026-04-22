import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

// Importando suas páginas
import Home from './views/Home.vue'
import Admin from './views/Admin.vue'
import Login from './views/Login.vue'

// Configurando as rotas
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { 
    path: '/admin', 
    component: Admin,
    // Essa função impede que entrem no /admin sem o token
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      if (token) {
        next(); // Tem token? Pode entrar.
      } else {
        next('/'); // Não tem? Chuta de volta pra Home.
        // O modal de login vai abrir porque o botão da Navbar já controla isso no App.vue
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Anexa o JWT em todas as requisições para rotas protegidas do backend.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar/estiver inválido, limpa o storage e volta para a Home.
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      if (router.currentRoute.value.path.startsWith('/admin')) {
        router.push('/');
      }
    }
    return Promise.reject(err);
  }
);

const app = createApp(App)
app.use(router) 
app.mount('#app')
