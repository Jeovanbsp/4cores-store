<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="toast-message" :class="type">
        <div class="toast-icon">
          <CheckCircleIcon v-if="type === 'success'" :size="20" />
          <AlertCircleIcon v-else-if="type === 'error'" :size="20" />
          <InfoIcon v-else :size="20" />
        </div>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-vue-next';

const show = ref(false);
const message = ref('');
const type = ref('success');

const showToast = (msg, toastType = 'success', duration = 3000) => {
  message.value = msg;
  type.value = toastType;
  show.value = true;
  
  setTimeout(() => {
    show.value = false;
  }, duration);
};

defineExpose({ showToast });
</script>

<style scoped>
.toast-message {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  color: white;
}

.toast-message.success {
  background: #10b981;
}

.toast-message.error {
  background: #ef4444;
}

.toast-message.info {
  background: #3b82f6;
}

.toast-icon {
  display: flex;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>