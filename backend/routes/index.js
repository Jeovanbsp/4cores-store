import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue' // Ajuste o caminho se necessário
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', component: Home },
  { 
    path: '/admin', 
    component: Admin,
    // Essa função checa se o cara tá logado antes de entrar na página
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token')
      if (token) {
        next()
      } else {
        // Se não tiver token, ele nem entra, a gente avisa o App.vue
        next('/')
        window.dispatchEvent(new CustomEvent('open-login-modal'))
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router