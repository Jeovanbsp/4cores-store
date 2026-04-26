<template>
  <div class="home">
    <Notification :message="toastMsg" :type="toastType" v-model:show="showToast" />
    
    <Transition name="fade">
      <div v-if="zoomedImage" class="zoom-overlay" @click="zoomedImage = null">
        <div class="zoom-content" @click.stop>
          <img :src="zoomedImage" class="zoomed-image" />
          <button class="close-zoom" @click="zoomedImage = null">×</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showLoginModal" class="login-overlay">
        <div class="login-card">
          <div class="login-header">
            <LockIcon :size="32" color="#E30613" />
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
              <button type="submit" class="btn-auth">Acessar Painel</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <header class="header-main">
      <img src="../assets/4cores.png" alt="Logo 4Cores" class="main-logo" @dblclick="showLoginModal = true">
      
      <HeroCarousel :images="heroImages" />
      
      <div class="search-wrapper">
        <SearchIcon class="icon-search" />
        <input type="text" v-model="search" placeholder="Busque um personagem ou tema..." class="search-bar" />
      </div>
    </header>

    <section class="filter-controls">
      <div class="main-filters">
        <button :class="{ active: filter === 'todos' }" @click="filter = 'todos'">Todos</button>
        <button :class="{ active: filter === 'venda' }" @click="filter = 'venda'">Comprar</button>
        <button :class="{ active: filter === 'aluguel' }" @click="filter = 'aluguel'">Alugar</button>
      </div>

      <div class="topics-wrapper">
        <button class="btn-topics-menu" @click="showTopicsMenu = !showTopicsMenu">
          <LayoutGridIcon :size="18" />
          <span>{{ selectedTopic === 'todos' ? 'Explorar Tópicos' : selectedTopic }}</span>
          <ChevronDownIcon :size="16" :class="{ rotate: showTopicsMenu }" />
        </button>

        <Transition name="slide-up">
          <div v-if="showTopicsMenu" class="topics-dropdown">
            <button 
              :class="{ active: selectedTopic === 'todos' }" 
              @click="selectedTopic = 'todos'; showTopicsMenu = false"
            >
              Todos os Itens
            </button>
            <button 
              v-for="t in availableTopics" :key="t" 
              :class="{ active: selectedTopic === t }"
              @click="selectedTopic = t; showTopicsMenu = false"
            >
              {{ t }}
            </button>
          </div>
        </Transition>
      </div>
    </section>

    <div v-if="isLoading" class="no-results">
      <PackageSearchIcon class="icon-big" />
      <p>Aguarde um momento que estamos carregando nosso catálogo</p>
    </div>
    
    <div v-else-if="filteredProducts.length > 0" class="product-grid">
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
      <p>Nenhum item encontrado.</p>
    </div>

    <section class="testimonials" v-if="feedbacks.length > 0">
      <h3>O que nossos clientes dizem</h3>
      <div class="testimonial-slider">
        <div v-for="f in feedbacks" :key="f._id" class="testimonial-card">
          <div class="stars-row">
            <StarIcon v-for="i in (f.stars || 5)" :key="i" class="icon-star-fill" />
          </div>
          <p class="feedback-text">"{{ f.text || f.comment || f.depoimento }}"</p>
          <span class="client-name">{{ f.name || f.user || f.cliente }}</span>
        </div>
      </div>
    </section>

    <CartModal
      :cartItems="cart"
      :isOpen="showCart"
      @close="showCart = false"
      @update-qty="updateCartQty"
      @remove="removeFromCart"
    />
    <button class="cart-toggle" @click="showCart = !showCart">
      <ShoppingCartIcon />
      <span v-if="cart.length > 0" class="cart-count">{{ totalCartQty }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { 
  SearchIcon, ShoppingCartIcon, StarIcon, PackageSearchIcon, 
  LockIcon, ChevronDownIcon, LayoutGridIcon 
} from 'lucide-vue-next';

import ProductCard from '../components/ProductCard.vue';
import CartModal from '../components/CartModal.vue';
import Notification from '../components/Notification.vue';
import HeroCarousel from '../components/HeroCarousel.vue';
import { API_URL } from '../config';

const router = useRouter();

// Estados Reativos
const products = ref([]);
const feedbacks = ref([]);
const heroImages = ref([]);
const search = ref('');
const filter = ref('todos');
const selectedTopic = ref('todos');
const showTopicsMenu = ref(false);
const zoomedImage = ref(null);
// Carrinho persistido no localStorage para não perder a encomenda ao recarregar.
const CART_STORAGE_KEY = '4cores_cart_v1';
const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(i => i && i._id && typeof i.quantity === 'number' && i.quantity > 0)
      .map(i => ({ ...i, quantity: Math.max(1, Math.floor(i.quantity)) }));
  } catch {
    return [];
  }
};
const cart = ref(loadCart());
const showCart = ref(false);

watch(cart, (val) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(val));
  } catch {
    // storage cheio ou indisponível — ignora silenciosamente
  }
}, { deep: true });
const showLoginModal = ref(false);
const passwordInput = ref('');
const isLoading = ref(true);
const showToast = ref(false);
const toastMsg = ref('');
const toastType = ref('error');

const openZoom = (url) => { zoomedImage.value = url; };

// Tópicos baseados nos produtos que não estão ocultos
const availableTopics = computed(() => {
  const topics = products.value
    .filter(p => p.visible !== false)
    .map(p => p.topic)
    .filter(t => t && t.trim() !== "");
  return [...new Set(topics)];
});

const notify = (msg, type = 'error') => {
  toastMsg.value = msg;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => showToast.value = false, 3000);
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [pRes, fRes, hRes] = await Promise.all([
      axios.get(`${API_URL}/products`),
      axios.get(`${API_URL}/feedbacks`),
      axios.get(`${API_URL}/hero-images`)
    ]);
    products.value = pRes.data;
    feedbacks.value = fRes.data;
    heroImages.value = hRes.data;
  } catch (err) {
    console.error("Erro ao carregar dados", err);
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const isVisible = p.visible !== false;
    const matchesSearch = p.name?.toLowerCase().includes(search.value.toLowerCase());
    const matchesFilter = filter.value === 'todos' || p.category === filter.value;
    const matchesTopic = selectedTopic.value === 'todos' || p.topic === selectedTopic.value;
    return isVisible && matchesSearch && matchesFilter && matchesTopic;
  });
});

const addToCart = (product) => {
  const soldOut = product.soldOut === true || (product.soldOut === undefined && product.stock === 0);
  if (soldOut) {
    notify("Item indisponível no momento!");
    return;
  }
  const existing = cart.value.find(item => item._id === product._id);
  if (existing) {
    existing.quantity++;
    notify(`${product.name} (${existing.quantity}x) no carrinho`, 'success');
  } else {
    cart.value.push({ ...product, quantity: 1 });
    notify(`${product.name} adicionado à encomenda`, 'success');
  }
  showCart.value = true;
};

const updateCartQty = ({ id, quantity }) => {
  const item = cart.value.find(i => i._id === id);
  if (!item) return;
  const q = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  item.quantity = q;
};

const removeFromCart = (id) => {
  const idx = cart.value.findIndex(i => i._id === id);
  if (idx === -1) return;
  const [removed] = cart.value.splice(idx, 1);
  notify(`${removed.name} removido da encomenda`, 'success');
  if (cart.value.length === 0) {
    showCart.value = false;
  }
};

const totalCartQty = computed(() =>
  cart.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);

onMounted(fetchData);
</script>

<style scoped>
.home { max-width: 1200px; margin: 0 auto; padding: 16px; font-family: 'Inter', sans-serif; }

@media (min-width: 640px) {
  .home { padding: 20px; }
}

/* Cabeçalho */
.header-main { text-align: center; margin-bottom: 30px; }
.main-logo { width: 140px; margin-bottom: 16px; cursor: pointer; }

@media (min-width: 640px) {
  .main-logo { width: 200px; margin-bottom: 20px; }
}
.search-wrapper { position: relative; max-width: 500px; margin: 0 auto; }
.icon-search { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-bar { width: 100%; padding: 15px 15px 15px 45px; border-radius: 30px; border: 1px solid #e2e8f0; font-size: 1rem; }

/* Filtros e Menu de Tópicos */
.filter-controls { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 40px; }
.main-filters { display: flex; gap: 10px; }
.main-filters button { padding: 10px 24px; border-radius: 25px; border: 1px solid #eee; background: white; cursor: pointer; font-weight: 600; color: #666; }
.main-filters button.active { background: #E30613; color: white; border-color: #E30613; }

.topics-wrapper { position: relative; }
.btn-topics-menu { display: flex; align-items: center; gap: 10px; padding: 12px 25px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 15px; font-weight: 700; color: #1e293b; cursor: pointer; }
.btn-topics-menu:hover { border-color: #E30613; background: white; }
.rotate { transform: rotate(180deg); transition: 0.3s; }

.topics-dropdown { position: absolute; top: 120%; left: 50%; transform: translateX(-50%); background: white; min-width: 220px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 10px; z-index: 2000; display: flex; flex-direction: column; gap: 5px; }
.topics-dropdown button { padding: 12px; text-align: left; border: none; background: none; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; }
.topics-dropdown button.active { background: #fef2f2; color: #E30613; }

/* Grid */
.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

@media (min-width: 640px) {
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 25px; }
}

/* Zoom */
.zoom-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 5000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.zoomed-image { max-width: 90%; max-height: 85vh; border-radius: 10px; }
.close-zoom { position: absolute; top: 20px; right: 20px; color: white; background: none; border: none; font-size: 40px; cursor: pointer; }

/* Feedbacks */
.testimonials { margin-top: 60px; text-align: center; }
.testimonial-slider { display: flex; overflow-x: auto; gap: 20px; padding: 20px; scrollbar-width: none; }
.testimonial-card { min-width: 280px; background: white; padding: 20px; border-radius: 15px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.stars-row { display: flex; justify-content: center; gap: 4px; margin-bottom: 10px; }
.icon-star-fill { color: #FFB800; fill: #FFB800; width: 16px; }
.feedback-text { font-style: italic; color: #475569; margin-bottom: 10px; }
.client-name { font-weight: bold; color: #1e293b; }

/* Carrinho */
.cart-toggle { position: fixed; bottom: 30px; right: 30px; background: #E30613; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; z-index: 1000; box-shadow: 0 5px 15px rgba(227,6,19,0.3); }
.cart-count { position: absolute; top: 0; right: 0; background: #008D36; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

/* Login Modal */
.login-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 6000; display: flex; align-items: center; justify-content: center; }
.login-card { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; }
.admin-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0; font-size: 1.1rem; text-align: center; }
.login-actions { display: flex; gap: 10px; }
.btn-auth { flex: 1; padding: 12px; background: #E30613; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
.btn-cancel-login { flex: 1; padding: 12px; background: #f1f5f9; border-radius: 10px; border: none; cursor: pointer; }

.no-results { text-align: center; padding: 50px; color: #94a3b8; }
.icon-big { width: 60px; height: 60px; margin-bottom: 10px; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: all 0.3s ease-out; }
.slide-up-enter-from { opacity: 0; transform: translate(-50%, 15px); }
</style>