<script setup>
import { reactive, ref, watch } from 'vue';
import ResultPanel from '@/components/split/ResultPanel.vue';
import SplitForm from '@/components/split/SplitForm.vue';
import { storage } from '@/lib/browser.js';
import { prefersReducedMotion, vnd } from '@/lib/format.js';
import { DEFAULTS, split } from '@/lib/split.js';

const STORAGE_KEY = 'badminton-split:v1';

function loadSaved() {
  try { return JSON.parse(storage.get(STORAGE_KEY)) || {}; } catch { return {}; }
}

const saved = { ...DEFAULTS, ...loadSaved() };
const inputs = reactive(Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, Number(saved[key]) || 0])));

const error = ref('');
const result = ref(null);
const animate = ref(false);
const announce = ref('');
const form = ref(null);
const panel = ref(null);

function calculate(withAnimation) {
  if (inputs.men + inputs.women === 0) {
    error.value = 'Cần ít nhất 1 người chơi mới chia được nha!';
    return false;
  }
  error.value = '';
  animate.value = withAnimation;
  result.value = split({ ...inputs });
  return true;
}

// Đã bấm tính một lần thì kết quả tự cập nhật theo ô nhập.
watch(inputs, () => {
  storage.set(STORAGE_KEY, JSON.stringify(inputs));
  if (result.value) calculate(false);
});

function onSubmit() {
  if (!calculate(true)) return;
  form.value.smash();
  const r = result.value;
  announce.value = [
    r.men ? `Nam ${vnd(r.menPay)} mỗi người` : '',
    r.women ? `Nữ ${vnd(r.womenPay)} mỗi người` : '',
  ].filter(Boolean).join(', ');
  if (matchMedia('(max-width: 899px)').matches) {
    panel.value.$el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}
</script>

<template>
  <div class="grid">
    <SplitForm ref="form" v-model="inputs" :error="error" @submit="onSubmit" />
    <ResultPanel ref="panel" :result="result" :animate="animate" :announce="announce" />
  </div>
</template>
