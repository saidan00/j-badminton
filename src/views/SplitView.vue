<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ResultPanel from '@/components/split/ResultPanel.vue';
import SplitForm from '@/components/split/SplitForm.vue';
import { storage } from '@/lib/browser.js';
import { prefersReducedMotion, vnd } from '@/lib/format.js';
import { DEFAULTS, split } from '@/lib/split.js';

const STORAGE_KEY = 'badminton-split:v1';
const { t } = useI18n();

function loadSaved() {
  try { return JSON.parse(storage.get(STORAGE_KEY)) || {}; } catch { return {}; }
}

const saved = { ...DEFAULTS, ...loadSaved() };
const inputs = ref(Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, Number(saved[key]) || 0])));

const error = ref(''); // key i18n
const result = ref(null);
const animate = ref(false);
const announce = ref('');
const form = ref(null);
const panel = ref(null);

function calculate(withAnimation) {
  if (inputs.value.men + inputs.value.women === 0) {
    error.value = 'split.needPlayers';
    return false;
  }
  error.value = '';
  animate.value = withAnimation;
  result.value = split({ ...inputs.value });
  return true;
}

// Đã bấm tính một lần thì kết quả tự cập nhật theo ô nhập.
watch(inputs, () => {
  storage.set(STORAGE_KEY, JSON.stringify(inputs.value));
  if (result.value) calculate(false);
}, { deep: true });

function onSubmit() {
  if (!calculate(true)) return;
  form.value.smash();
  const r = result.value;
  announce.value = [
    r.men ? t('split.announce.men', { amount: vnd(r.menPay) }) : '',
    r.women ? t('split.announce.women', { amount: vnd(r.womenPay) }) : '',
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
