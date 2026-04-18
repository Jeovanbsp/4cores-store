<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="logo-container" @click="goHome">
        <img src="../assets/4cores.png" alt="4Cores Logo" class="nav-logo" />
        <h1 class="brand-name">
          <span class="digit">4</span><span class="text">Cores</span>
        </h1>
      </div>

      <div class="nav-links">
        <a href="/#catalogo" class="nav-item">Catálogo</a>
        <a href="/#sobre" class="nav-item">Sobre</a>
        
        <button class="admin-access" @click="$emit('open-login')" title="Acesso Administrativo">
          <LayersIcon :size="22" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { LayersIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

// Define que este componente comunica a abertura do login para fora
defineEmits(['open-login']);

const goHome = () => {
  if (router) router.push('/');
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  z-index: 1000;
  padding: 10px 24px;
}
.nav-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.logo-container { display: flex; align-items: center; cursor: pointer; }
.nav-logo { height: 48px; width: auto; margin-right: 10px; }
.brand-name { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.5rem; letter-spacing: -0.05em; margin: 0; display: flex; align-items: center; }
.digit { color: #E30613; }
.text { color: #1a1a1a; }
.nav-links { display: flex; align-items: center; }
.nav-item { text-decoration: none; color: #444; margin-left: 25px; font-size: 0.95rem; font-weight: 600; transition: color 0.2s; cursor: pointer; }
.nav-item:hover { color: #E30613; }
.admin-access { background: #fcfcfc; border: 1px solid #eee; width: 40px; height: 40px; border-radius: 10px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 25px; transition: all 0.3s ease; }
.admin-access:hover { background: #E30613; color: white; border-color: #E30613; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(227, 6, 19, 0.15); }

@media (max-width: 480px) {
  .nav-logo { height: 38px; }
  .brand-name { font-size: 1.2rem; }
  .nav-item { margin-left: 15px; font-size: 0.85rem; }
}
</style>