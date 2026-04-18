<template>
  <Transition name="slide-fade">
    <div class="cart-popup" v-if="isOpen">
      <header class="cart-header">
        <div class="header-title">
          <ShoppingCartIcon class="icon-lucide" />
          <h3>Seu Carrinho</h3>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <XIcon class="icon-close" />
        </button>
      </header>

      <div class="cart-body">
        <div v-if="cartItems.length > 0" class="items-container">
          <div v-for="item in cartItems" :key="item._id" class="cart-item">
            <div class="item-info">
              <strong>{{ item.name }}</strong>
              <span class="qty-label">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>

          <div class="total-row">
            <span>Total:</span>
            <strong>R$ {{ totalCartValue.toFixed(2) }}</strong>
          </div>
          
          <button @click="sendToWhatsApp" class="btn-whatsapp">
            <MessageCircleIcon class="icon-wpp" />
            Solicitar via WhatsApp
          </button>
        </div>

        <div v-else class="empty-state">
          <ShoppingBagIcon class="icon-empty" />
          <p>Seu carrinho está vazio.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { 
  ShoppingCartIcon, 
  XIcon, 
  MessageCircleIcon, 
  ShoppingBagIcon 
} from 'lucide-vue-next';

const props = defineProps(['cartItems', 'isOpen']);
defineEmits(['close']);

const totalCartValue = computed(() => {
  return props.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

const sendToWhatsApp = () => {
  const phoneNumber = "5571982184483";
  let message = "Olá 4Cores! Gostaria de encomendar:\n\n";
  
  props.cartItems.forEach(item => {
    message += `• ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });

  message += `\n*Total Geral: R$ ${totalCartValue.value.toFixed(2)}*`;

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.cart-popup { position: fixed; bottom: 100px; right: 20px; width: 320px; background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); z-index: 1000; overflow: hidden; border: 1px solid #eee; }
.cart-header { background: #fdfdfd; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.header-title { display: flex; align-items: center; gap: 10px; }
.header-title h3 { margin: 0; font-size: 1.1rem; color: #333; }
.icon-lucide { width: 20px; color: #E30613; }
.close-btn { background: none; border: none; cursor: pointer; color: #ccc; }
.icon-close { width: 18px; }
.cart-body { padding: 20px; }
.cart-item { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 12px; color: #555; }
.item-info { display: flex; align-items: center; gap: 8px; }
.qty-label { background: #f1f1f1; padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; font-weight: bold; }
.item-price { font-weight: bold; color: #333; }
.total-row { margin-top: 15px; padding-top: 10px; border-top: 2px dashed #eee; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; }
.total-row strong { color: #E30613; }
.btn-whatsapp { width: 100%; background-color: #25d366; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-whatsapp:hover { background-color: #1eb954; }
.empty-state { text-align: center; padding: 20px; color: #bbb; }
.icon-empty { width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.3; }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(20px); opacity: 0; }
</style>