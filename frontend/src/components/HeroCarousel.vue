<template>
  <div v-if="images.length > 0" class="hero-carousel">
    <div class="carousel-wrapper">
      <div class="carousel-track" :style="carouselStyle">
        <div 
          v-for="(img, index) in images" 
          :key="img._id" 
          class="carousel-slide"
        >
          <img 
            :src="img.imageUrl" 
            :alt="img.altText || 'Imagem destaque'" 
            class="hero-image"
            :class="{ 'clickable': img.link }"
            @click="goToLink(img.link)"
          />
        </div>
      </div>
    </div>
    
    <div v-if="images.length > 1" class="carousel-controls">
      <button @click="prevSlide" class="carousel-btn prev">‹</button>
      <div class="carousel-dots">
        <span 
          v-for="(img, index) in images" 
          :key="index" 
          class="dot"
          :class="{ active: currentIndex === index }"
          @click="currentIndex = index"
        ></span>
      </div>
      <button @click="nextSlide" class="carousel-btn next">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
});

const currentIndex = ref(0);
let autoplayInterval = null;

const carouselStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`
}));

const goToLink = (link) => {
  if (link) {
    window.open(link, '_blank');
  }
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

onMounted(() => {
  if (props.images.length > 1) {
    autoplayInterval = setInterval(nextSlide, 5000);
  }
});

onUnmounted(() => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
  }
});
</script>

<style scoped>
.hero-carousel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 30px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.carousel-wrapper {
  overflow: hidden;
  border-radius: 16px;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
}

.hero-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.hero-image.clickable {
  cursor: pointer;
}

.hero-image.clickable:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

@media (min-width: 768px) {
  .hero-image {
    height: 400px;
  }
}

.carousel-controls {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10;
}

.carousel-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-btn:hover {
  background: white;
  transform: scale(1.1);
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: white;
  transform: scale(1.2);
}
</style>