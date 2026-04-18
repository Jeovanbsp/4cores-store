<template>
  <Transition name="drop-down">
    <div v-if="show" class="notification-overlay">
      <div class="notification-toast" :class="type">
        <div class="toast-content">
          <div class="icon-circle">
            <AlertCircleIcon v-if="type === 'error'" :size="24" />
            <CheckCircleIcon v-else :size="24" />
          </div>
          <div class="text-group">
            <span class="toast-title">{{ type === 'error' ? 'Atenção' : 'Sucesso!' }}</span>
            <span class="toast-message">{{ message }}</span>
          </div>
        </div>
        <button @click="close" class="close-toast">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { AlertCircleIcon, CheckCircleIcon } from 'lucide-vue-next';

const props = defineProps({
  message: String,
  type: { type: String, default: 'error' },
  show: Boolean
});

const emit = defineEmits(['update:show']);

const close = () => {
  emit('update:show', false);
};
</script>

<style scoped>
/* Overlay para garantir que fique acima de tudo e centralizado */
.notification-overlay {
  position: fixed;
  top: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 9999; /* Valor alto para não ser coberto por nada */
  pointer-events: none; /* Permite clicar no que está atrás se não for no toast */
}

.notification-toast {
  pointer-events: auto; /* Reativa o clique para o toast */
  min-width: 350px;
  max-width: 90%;
  padding: 16px 24px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.text-group {
  display: flex;
  flex-direction: column;
}

.toast-title {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 0.9rem;
  color: #666;
}

/* Estilo Erro (Padrão 4Cores) */
.error .icon-circle { background: #fee2e2; color: #E30613; }
.error .toast-title { color: #E30613; }
.error { border-bottom: 4px solid #E30613; }

/* Estilo Sucesso */
.success .icon-circle { background: #dcfce7; color: #10b981; }
.success .toast-title { color: #10b981; }
.success { border-bottom: 4px solid #10b981; }

.close-toast {
  background: none;
  border: none;
  font-size: 28px;
  color: #ccc;
  cursor: pointer;
  line-height: 1;
  padding-left: 15px;
  transition: color 0.2s;
}

.close-toast:hover { color: #333; }

/* Animação de cair do topo */
.drop-down-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.drop-down-leave-active { transition: all 0.3s ease; }

.drop-down-enter-from {
  transform: translateY(-100px);
  opacity: 0;
}
.drop-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>