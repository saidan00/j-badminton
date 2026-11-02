<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { num, prefersReducedMotion } from '@/lib/format.js';
import { ROUND_STEP } from '@/lib/split.js';

const props = defineProps({
  value: { type: Number, default: null },
  animate: Boolean,
});

const text = ref(props.value == null ? '—' : num(props.value));
let current = props.value ?? 0;
let raf = 0;

// Số chạy từ giá trị cũ lên giá trị mới, bước theo mức làm tròn.
watch(() => props.value, (value) => {
  cancelAnimationFrame(raf);
  if (value == null) {
    text.value = '—';
    current = 0;
    return;
  }
  const from = current;
  current = value;
  if (!props.animate || prefersReducedMotion() || from === value) {
    text.value = num(value);
    return;
  }
  const start = performance.now();
  const duration = 650;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    text.value = num(Math.round((from + (value - from) * eased) / ROUND_STEP) * ROUND_STEP);
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <div>{{ text }}</div>
</template>
