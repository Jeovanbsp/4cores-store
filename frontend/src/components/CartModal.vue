<template>
  <Transition name="slide-fade">
    <div class="cart-popup" v-if="isOpen">
      <header class="cart-header">
        <div class="header-title">
          <ShoppingCartIcon class="icon-lucide" />
          <h3>Minha Encomenda</h3>
        </div>
        <button @click="$emit('close')" class="close-btn" aria-label="Fechar">
          <XIcon class="icon-close" />
        </button>
      </header>

      <div class="cart-body">
        <div v-if="cartItems.length > 0" class="items-container">
          <div v-for="item in cartItems" :key="item._id" class="cart-item">
            <div class="item-main">
              <div class="item-info">
                <strong>{{ item.name }}</strong>
                <span class="item-category" :class="item.category">
                  {{ item.category === 'aluguel' ? 'Aluguel' : 'Venda' }}
                </span>
              </div>
              <button
                class="btn-remove"
                @click="$emit('remove', item._id)"
                aria-label="Remover item"
                title="Remover item"
              >
                <Trash2Icon class="icon-trash" />
              </button>
            </div>

            <div class="item-controls">
              <div class="qty-control">
                <button
                  class="qty-btn"
                  @click="$emit('update-qty', { id: item._id, quantity: item.quantity - 1 })"
                  :disabled="item.quantity <= 1"
                  aria-label="Diminuir quantidade"
                >
                  <MinusIcon class="icon-qty" />
                </button>
                <input
                  type="number"
                  class="qty-input"
                  :value="item.quantity"
                  min="1"
                  @input="onQtyInput($event, item._id)"
                  aria-label="Quantidade"
                />
                <button
                  class="qty-btn"
                  @click="$emit('update-qty', { id: item._id, quantity: item.quantity + 1 })"
                  aria-label="Aumentar quantidade"
                >
                  <PlusIcon class="icon-qty" />
                </button>
              </div>
              <span class="item-price">R$ {{ formatBRL(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="total-row">
            <span>Total estimado:</span>
            <strong>R$ {{ formatBRL(totalCartValue) }}</strong>
          </div>

          <p class="encomenda-note">
            Valor sujeito a confirmação pela 4Cores após o envio da encomenda.
          </p>

          <button @click="sendToWhatsApp" class="btn-whatsapp">
            <MessageCircleIcon class="icon-wpp" />
            Enviar encomenda pelo WhatsApp
          </button>
        </div>

        <div v-else class="empty-state">
          <ShoppingBagIcon class="icon-empty" />
          <p>Sua encomenda está vazia.</p>
          <small>Adicione produtos para solicitar via WhatsApp.</small>
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
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  Trash2Icon,
} from 'lucide-vue-next';
import { formatBRL } from '../utils/format';

const props = defineProps(['cartItems', 'isOpen']);
const emit = defineEmits(['close', 'update-qty', 'remove']);

const totalCartValue = computed(() => {
  return props.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

const onQtyInput = (event, id) => {
  const raw = parseInt(event.target.value, 10);
  const quantity = Number.isFinite(raw) && raw > 0 ? raw : 1;
  event.target.value = quantity;
  emit('update-qty', { id, quantity });
};

const sendToWhatsApp = () => {
  const phoneNumber = "5571982184483";
  let message = "Olá 4Cores! Gostaria de fazer uma *encomenda*:\n\n";

  props.cartItems.forEach(item => {
    const tipo = item.category === 'aluguel' ? 'Aluguel' : 'Venda';
    message += `• ${item.name} [${tipo}] — ${item.quantity}x — R$ ${formatBRL(item.price * item.quantity)}\n`;
  });

  message += `\n*Total estimado: R$ ${formatBRL(totalCartValue.value)}*`;
  message += `\n\nAguardo confirmação da disponibilidade e dos valores. Obrigado!`;

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.cart-popup {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 340px;
  max-width: calc(100vw - 24px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #eee;
}

@media (max-width: 480px) {
  .cart-popup { right: 12px; left: 12px; width: auto; bottom: 90px; }
}

.cart-header { background: #fdfdfd; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.header-title { display: flex; align-items: center; gap: 10px; }
.header-title h3 { margin: 0; font-size: 1.1rem; color: #333; }
.icon-lucide { width: 20px; color: #E30613; }
.close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; }
.close-btn:hover { color: #1e293b; }
.icon-close { width: 18px; }

.cart-body { padding: 18px 20px; max-height: 60vh; overflow-y: auto; }

.cart-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
}
.cart-item:last-of-type { border-bottom: none; }

.item-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.item-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.item-info strong { font-size: 0.95rem; color: #1e293b; word-break: break-word; }

.item-category {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}
.item-category.venda { background: #E30613; }
.item-category.aluguel { background: #0056b3; }

.btn-remove {
  background: #fef2f2;
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E30613;
  flex-shrink: 0;
}
.btn-remove:hover { background: #fee2e2; }
.icon-trash { width: 15px; height: 15px; }

.item-controls { display: flex; justify-content: space-between; align-items: center; gap: 10px; }

.qty-control {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:disabled { color: #cbd5e1; cursor: not-allowed; background: transparent; }
.qty-btn:hover:not(:disabled) { background: #E30613; color: white; }
.icon-qty { width: 14px; height: 14px; }

.qty-input {
  width: 40px;
  border: none;
  background: transparent;
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  -moz-appearance: textfield;
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.item-price { font-weight: bold; color: #333; font-size: 0.95rem; white-space: nowrap; }

.total-row { margin-top: 15px; padding-top: 12px; border-top: 2px dashed #eee; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; }
.total-row strong { color: #E30613; }

.encomenda-note { font-size: 0.75rem; color: #64748b; text-align: center; margin: 8px 0 12px; }

.btn-whatsapp { width: 100%; background-color: #25d366; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 0.95rem; }
.btn-whatsapp:hover { background-color: #1eb954; }
.icon-wpp { width: 18px; height: 18px; }

.empty-state { text-align: center; padding: 30px 20px; color: #bbb; }
.empty-state p { margin: 10px 0 4px; font-weight: 600; color: #64748b; }
.empty-state small { font-size: 0.8rem; color: #94a3b8; }
.icon-empty { width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.3; }

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(20px); opacity: 0; }
</style>
