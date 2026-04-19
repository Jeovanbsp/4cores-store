import { createApp } from 'vue'
import App from './App.vue'
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

const app = createApp(App)
app.use(router) 
app.mount('#app')