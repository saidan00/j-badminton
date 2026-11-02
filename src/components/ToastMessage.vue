<script setup>
import { useToast } from '@/composables/useToast.js';

const { state, runAction } = useToast();
</script>

<template>
  <div class="toast" :class="{ 'is-on': state.visible }" role="status" aria-live="polite">
    <span>{{ state.message }}</span>
    <button v-if="state.action" type="button" @click="runAction">{{ state.action.label }}</button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: calc(100% - 32px);
  padding: 12px 12px 12px 16px;
  border-radius: 14px;
  background: var(--ink);
  color: #fff;
  font: 500 14px/1.4 var(--body);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, .55);
  opacity: 0;
  transform: translate(-50%, 16px);
  pointer-events: none;
  transition: opacity .2s, transform .2s;
}

.toast.is-on {
  opacity: 1;
  transform: translate(-50%, 0);
  pointer-events: auto;
}

button {
  flex: none;
  height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: var(--lime);
  color: var(--lime-ink);
  font: 700 13px/1 var(--body);
  cursor: pointer;
}
</style>
