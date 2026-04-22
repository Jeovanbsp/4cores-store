<template>
  <div class="card" :class="{ 'out-of-stock': isSoldOut }">
    <div class="image-wrapper">
      <span v-if="product.topic" class="topic-tag-overlay">{{ product.topic }}</span>

      <div v-if="isSoldOut" class="sold-out-badge">ESGOTADO</div>

      <div v-if="product.displayMode === 'carousel' && product.images && product.images.length > 1" class="carousel-container">
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
        :src="(product.images && product.images[0]) || 'https://via.placeholder.com/300'" 
        class="product-img clickable" 
        @click="$emit('zoom-image', (product.images && product.images[0]) || 'https://via.placeholder.com/300')"
      />
      
      <span class="category-tag" :class="product.category">
        {{ product.category === 'aluguel' ? 'Aluguel' : 'Venda' }}
      </span>
    </div>

    <div class="content">
      <h4>{{ product.name }}</h4>
      <p class="price">R$ {{ formatBRL(product.price) }}</p>
      
      <p v-if="product.description" class="details">
        {{ product.description }}
      </p>
      
      <div class="action-row">
        <button 
          @click="$emit('add', product)" 
          class="btn-add"
          :disabled="isSoldOut"
        >
          {{ isSoldOut ? 'Indisponível' : 'Adicionar à Encomenda' }}
        </button>
        <button
          type="button"
          class="btn-share"
          :title="shareSupported ? 'Compartilhar produto' : 'Compartilhar no WhatsApp'"
          aria-label="Compartilhar produto"
          @click="shareProduct"
        >
          <Share2Icon :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Share2Icon } from 'lucide-vue-next';
import { formatBRL } from '../utils/format';

const props = defineProps(['product']);
defineEmits(['add', 'zoom-image']);

const shareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

const buildShareText = () => {
  const tipo = props.product.category === 'aluguel' ? 'Aluguel' : 'Venda';
  const preco = `R$ ${formatBRL(props.product.price)}`;
  const linhas = [
    `*${props.product.name}* — ${tipo}`,
    `Preço: ${preco}`,
  ];
  if (props.product.description) linhas.push(props.product.description);
  linhas.push('', 'Confira no catálogo da 4Cores:');
  return linhas.join('\n');
};

const shareProduct = async () => {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = buildShareText();
  const shareData = {
    title: `4Cores — ${props.product.name}`,
    text,
    url,
  };

  if (shareSupported) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // Usuário cancelou ou API não disponível: cai no fallback.
      if (err && err.name === 'AbortError') return;
    }
  }

  // Fallback universal: abre o WhatsApp com a mensagem já pronta.
  const message = `${text}\n${url}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank', 'noopener');
};

const currentIndex = ref(0);

// Suporta tanto o novo campo `soldOut` quanto docs antigos (stock === 0).
const isSoldOut = computed(() => {
  if (props.product.soldOut === true) return true;
  if (props.product.soldOut === false) return false;
  return props.product.stock === 0;
});

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
  white-space: pre-wrap;
  word-break: break-word;
}

.action-row { display: flex; gap: 8px; margin-top: auto; align-items: stretch; }

.btn-add { 
  flex: 1;
  padding: 12px; 
  background: #1e293b; 
  color: white; 
  border: none; 
  border-radius: 10px; 
  cursor: pointer; 
  font-weight: 700; 
}
.btn-add:hover:not(:disabled) { background: #E30613; }
.btn-add:disabled { background: #cbd5e1; cursor: not-allowed; color: #64748b; }

.btn-share {
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  padding: 0 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.btn-share:hover { background: #25d366; color: white; }
</style>