<template>
  <div class="card" :class="{ 'out-of-stock': product.stock === 0 }">
    <div class="image-wrapper">
      <span v-if="product.topic" class="topic-tag-overlay">{{ product.topic }}</span>

      <div v-if="product.stock === 0" class="sold-out-badge">ESGOTADO</div>

      <div v-if="product.displayMode === 'carousel' && product.images.length > 1" class="carousel-container">
        <img 
          :src="product.images[currentIndex]" 
          class="product-img clickable" 
          @click="$emit('zoom-image', product.images[currentIndex])"
        />
        
        <button class="nav-btn prev" @click.stop="prevImg">‹</button>
        <button class="nav-btn next" @click.stop="nextImg">›</button>
        
        <div class="dots">
          <span 
            v-for="(_, i) in product.images" 
            :key="i" 
            :class="{ active: i === currentIndex }"
            @click.stop="currentIndex = i"
          ></span>
        </div>
      </div>

      <img 
        v-else 
        :src="product.images[0] || 'https://via.placeholder.com/300'" 
        class="product-img clickable" 
        @click="$emit('zoom-image', product.images[0] || 'https://via.placeholder.com/300')"
      />
      
      <span class="category-tag" :class="product.category">
        {{ product.category === 'aluguel' ? 'Aluguel' : 'Venda' }}
      </span>
    </div>

    <div class="content">
      <h4>{{ product.name }}</h4>
      <p class="price">R$ {{ product.price.toFixed(2) }}</p>
      
      <p v-if="product.description" class="details">
        {{ product.description }}
      </p>
      
      <button 
        @click="$emit('add', product)" 
        class="btn-add"
        :disabled="product.stock === 0"
      >
        {{ product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['product']);
defineEmits(['add', 'zoom-image']);

const currentIndex = ref(0);

const nextImg = () => {
  if (currentIndex.value < props.product.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const prevImg = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.product.images.length - 1;
  }
};
</script>

<style scoped>
.card { 
  background: white; 
  border-radius: 15px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
  overflow: hidden; 
  transition: transform 0.2s; 
  position: relative; 
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card:hover { transform: translateY(-5px); }

.out-of-stock { opacity: 0.7; filter: grayscale(0.8); }

.sold-out-badge { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  background: #E30613; 
  color: white; 
  padding: 8px 16px; 
  font-weight: 800; 
  border-radius: 5px; 
  z-index: 20; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
  font-size: 0.9rem;
  pointer-events: none;
}

.image-wrapper { position: relative; height: 220px; width: 100%; background: #f8fafc; }
.clickable { cursor: zoom-in; }

.topic-tag-overlay { 
  position: absolute; 
  top: 10px; 
  left: 10px; 
  background: rgba(255, 255, 255, 0.95); 
  color: #1e293b; 
  padding: 4px 10px; 
  border-radius: 6px; 
  font-size: 10px; 
  font-weight: 800; 
  text-transform: uppercase; 
  z-index: 5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.carousel-container { position: relative; width: 100%; height: 100%; }

.nav-btn { 
  position: absolute; 
  top: 50%; 
  transform: translateY(-50%); 
  background: rgba(255, 255, 255, 0.9); 
  border: none; 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  cursor: pointer; 
  z-index: 10; 
  font-size: 20px; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.prev { left: 8px; } 
.next { right: 8px; }

.dots { 
  position: absolute; 
  bottom: 12px; 
  width: 100%; 
  display: flex; 
  justify-content: center; 
  gap: 6px; 
  z-index: 10; 
}
.dots span { 
  width: 8px; 
  height: 8px; 
  border-radius: 50%; 
  background: rgba(255, 255, 255, 0.6); 
  cursor: pointer; 
}
.dots span.active { background: white; transform: scale(1.3); }

.product-img { width: 100%; height: 100%; object-fit: cover; }

.category-tag { 
  position: absolute; 
  top: 10px; 
  right: 10px; 
  padding: 5px 12px; 
  border-radius: 20px; 
  font-size: 10px; 
  font-weight: 800; 
  color: white; 
  text-transform: uppercase; 
  z-index: 5; 
}
.venda { background: #E30613; } 
.aluguel { background: #0056b3; }

.content { padding: 15px; display: flex; flex-direction: column; flex-grow: 1; }
h4 { margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700; }
.price { font-size: 1.25rem; font-weight: 800; color: #059669; margin: 10px 0; }

.details { 
  font-size: 0.85rem; 
  color: #64748b; 
  margin-bottom: 15px; 
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita a 2 linhas */
  line-clamp: 2;         /* Versão padrão para tirar o aviso do VS Code */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-add { 
  width: 100%; 
  padding: 12px; 
  background: #1e293b; 
  color: white; 
  border: none; 
  border-radius: 10px; 
  cursor: pointer; 
  font-weight: 700; 
  margin-top: auto;
}
.btn-add:hover:not(:disabled) { background: #E30613; }
.btn-add:disabled { background: #cbd5e1; cursor: not-allowed; color: #64748b; }
</style>