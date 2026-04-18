import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Importando suas páginas
import Home from './views/Home.vue'
import Admin from './views/Admin.vue'

// Configurando as rotas
const routes = [
  { path: '/', component: Home },
  { path: '/admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router) // Ativa as rotas no Vue
app.mount('#app')