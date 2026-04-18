<template>
  <div class="home">
    <Notification :message="toastMsg" :type="toastType" v-model:show="showToast" />
    
    <!-- ZOOM -->
    <Transition name="fade">
      <div v-if="zoomedImage" class="zoom-overlay" @click="zoomedImage = null">
        <div class="zoom-content" @click.stop>
          <img :src="zoomedImage" class="zoomed-image" />
          <button class="close-zoom" @click="zoomedImage = null">×</button>
        </div>
      </div>
    </Transition>

    <!-- LOGIN -->
    <Transition name="fade">
      <div v-if="showLoginModal" class="login-overlay">
        <div class="login-card">
          <div class="login-header">
            <LockIcon :size="28" color="#E30613" />
            <h2>Acesso Restrito</h2>
            <p>Gerenciamento da Loja 4Cores</p>
          </div>
          <form @submit.prevent="handleLogin" class="login-form">
            <input 
              v-model="passwordInput" 
              type="password" 
              placeholder="Senha administrativa" 
              class="admin-input"
              required 
            />
            <div class="login-actions">
              <button type="button" @click="showLoginModal = false" class="btn-cancel-login">Cancelar</button>
              <button type="submit" class="btn-auth">Entrar</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- HEADER -->
    <header class="header-main">
      <img src="../assets/4cores.png" class="main-logo" @dblclick="showLoginModal = true">
      
      <div class="search-wrapper">
        <SearchIcon class="icon-search" />
        <input type="text" v-model="search" placeholder="Buscar..." class="search-bar" />
      </div>
    </header>

    <!-- FILTROS -->
    <section class="filter-controls">
      <div class="main-filters">
        <button :class="{ active: filter === 'todos' }" @click="filter = 'todos'">Todos</button>
        <button :class="{ active: filter === 'venda' }" @click="filter = 'venda'">Comprar</button>
        <button :class="{ active: filter === 'aluguel' }" @click="filter = 'aluguel'">Alugar</button>
      </div>

      <div class="topics-wrapper">
        <button class="btn-topics-menu" @click="showTopicsMenu = !showTopicsMenu">
          <LayoutGridIcon :size="16" />
          <span>{{ selectedTopic === 'todos' ? 'Tópicos' : selectedTopic }}</span>
          <ChevronDownIcon :size="14" :class="{ rotate: showTopicsMenu }" />
        </button>

        <Transition name="slide-up">
          <div v-if="showTopicsMenu" class="topics-dropdown">
            <button @click="selectedTopic = 'todos'; showTopicsMenu = false">Todos</button>
            <button v-for="t in availableTopics" :key="t"
              @click="selectedTopic = t; showTopicsMenu = false">
              {{ t }}
            </button>
          </div>
        </Transition>
      </div>
    </section>

    <!-- PRODUTOS -->
    <div v-if="filteredProducts.length" class="product-grid">
      <ProductCard 
        v-for="p in filteredProducts" 
        :key="p._id" 
        :product="p" 
        @add="addToCart" 
        @zoom-image="openZoom"
      />
    </div>

    <div v-else class="no-results">
      <PackageSearchIcon class="icon-big" />
      <p>Nenhum item encontrado</p>
    </div>

    <!-- FEEDBACK -->
    <section class="testimonials" v-if="feedbacks.length">
      <h3>Clientes</h3>
      <div class="testimonial-slider">
        <div v-for="f in feedbacks" :key="f._id" class="testimonial-card">
          <div class="stars-row">
            <StarIcon v-for="i in (f.stars || 5)" :key="i" class="icon-star-fill" />
          </div>
          <p>"{{ f.text || f.comment }}"</p>
          <span>{{ f.name || f.user }}</span>
        </div>
      </div>
    </section>

    <!-- CARRINHO -->
    <CartModal :cartItems="cart" :isOpen="showCart" @close="showCart = false" />
    <button class="cart-toggle" @click="showCart = !showCart">
      <ShoppingCartIcon />
      <span v-if="cart.length" class="cart-count">{{ cart.length }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import {
  SearchIcon, ShoppingCartIcon, StarIcon,
  PackageSearchIcon, LockIcon, ChevronDownIcon, LayoutGridIcon
} from 'lucide-vue-next'

import ProductCard from '../components/ProductCard.vue'
import CartModal from '../components/CartModal.vue'
import Notification from '../components/Notification.vue'

const API_URL = "https://fourcores-api.onrender.com/api"

const products = ref([])
const feedbacks = ref([])
const search = ref('')
const filter = ref('todos')
const selectedTopic = ref('todos')
const showTopicsMenu = ref(false)
const zoomedImage = ref(null)
const cart = ref([])
const showCart = ref(false)
const showLoginModal = ref(false)
const passwordInput = ref('')
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('error')

const openZoom = (url) => zoomedImage.value = url

const availableTopics = computed(() => {
  return [...new Set(products.value.map(p => p.topic).filter(Boolean))]
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return (
      p.visible !== false &&
      p.name?.toLowerCase().includes(search.value.toLowerCase()) &&
      (filter.value === 'todos' || p.category === filter.value) &&
      (selectedTopic.value === 'todos' || p.topic === selectedTopic.value)
    )
  })
})

const addToCart = (product) => {
  if (product.stock <= 0) return
  const existing = cart.value.find(i => i._id === product._id)
  if (existing) existing.quantity++
  else cart.value.push({ ...product, quantity: 1 })
  showCart.value = true
}

onMounted(async () => {
  const [p, f] = await Promise.all([
    axios.get(`${API_URL}/products`),
    axios.get(`${API_URL}/feedbacks`)
  ])
  products.value = p.data
  feedbacks.value = f.data
})
</script>

<style scoped>
* { box-sizing: border-box; }

.home {
  max-width: 1200px;
  margin: auto;
  padding: 12px;
}

/* HEADER */
.header-main {
  text-align: center;
}

.main-logo {
  width: 120px;
}

@media (min-width: 768px) {
  .main-logo {
    width: 160px;
  }
}

.search-wrapper {
  position: relative;
  margin-top: 10px;
}

.icon-search {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-bar {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

/* FILTROS */
.main-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin: 12px 0;
}

.main-filters button {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 20px;
  border: 1px solid #eee;
  background: white;
}

.main-filters button.active {
  background: #E30613;
  color: white;
}

/* TOPICS */
.topics-wrapper {
  width: 100%;
  position: relative;
}

.btn-topics-menu {
  width: 100%;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
}

.topics-dropdown {
  width: 100%;
  position: absolute;
  top: 110%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  z-index: 999;
}

.topics-dropdown button {
  width: 100%;
  padding: 10px;
  text-align: left;
  border: none;
  background: none;
}

/* GRID */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

/* ZOOM */
.zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoomed-image {
  max-width: 95%;
  max-height: 70vh;
  border-radius: 10px;
}

/* TESTIMONIAL */
.testimonial-slider {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
  scroll-snap-type: x mandatory;
}

.testimonial-card {
  min-width: 220px;
  scroll-snap-align: start;
}

/* CARRINHO */
.cart-toggle {
  position: fixed;
  bottom: 15px;
  right: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #E30613;
  color: white;
  border: none;
}

.cart-count {
  position: absolute;
  top: 0;
  right: 0;
  background: green;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* LOGIN */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 350px;
  border-radius: 15px;
  padding: 20px;
  background: white;
}

/* RESULT */
.no-results {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
}
</style>