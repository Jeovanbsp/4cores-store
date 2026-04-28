<template>
  <Transition name="modal">
    <div v-if="show" class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-modal">
        <div class="confirm-icon" :class="type">
          <AlertTriangleIcon v-if="type === 'danger'" :size="32" />
          <HelpCircleIcon v-else :size="32" />
        </div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button @click="handleCancel" class="btn-cancel">{{ cancelText }}</button>
          <button @click="handleConfirm" class="btn-confirm" :class="type">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { AlertTriangleIcon, HelpCircleIcon } from 'lucide-vue-next';

const show = ref(false);
const title = ref('Confirmar');
const message = ref('Tem certeza que deseja continuar?');
const type = ref('danger');
const confirmText = ref('Confirmar');
const cancelText = ref('Cancelar');

let resolvePromise = null;

const open = (options = {}) => {
  title.value = options.title || 'Confirmar';
  message.value = options.message || 'Tem certeza que deseja continuar?';
  type.value = options.type || 'danger';
  confirmText.value = options.confirmText || 'Confirmar';
  cancelText.value = options.cancelText || 'Cancelar';
  
  return new Promise((resolve) => {
    resolvePromise = resolve;
    show.value = true;
  });
};

const handleConfirm = () => {
  show.value = false;
  if (resolvePromise) resolvePromise(true);
};

const handleCancel = () => {
  show.value = false;
  if (resolvePromise) resolvePromise(false);
};

defineExpose({ open });
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirm-icon.danger {
  background: #fef2f2;
  color: #dc2626;
}

.confirm-icon.info {
  background: #eff6ff;
  color: #2563eb;
}

.confirm-modal h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  color: #1e293b;
}

.confirm-modal p {
  margin: 0 0 20px;
  color: #64748b;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  color: white;
}

.btn-confirm.danger {
  background: #dc2626;
}

.btn-confirm.danger:hover {
  background: #b91c1c;
}

.btn-confirm.info {
  background: #2563eb;
}

.btn-confirm.info:hover {
  background: #1d4ed8;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>