<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { digits, num } from '@/lib/format.js';

const model = defineModel({ type: Number, required: true });
defineProps({
  id: { type: String, default: undefined },
  placeholder: { type: String, default: undefined },
});

const show = (v) => (v ? num(v) : '');
const text = ref(show(model.value));

watch(model, (v) => {
  if ((Number(digits(text.value)) || 0) !== v) text.value = show(v);
});

// Đổi ngôn ngữ thì đổi luôn dấu phân cách hàng nghìn (240.000 ↔ 240,000).
const { locale } = useI18n();
watch(locale, () => {
  text.value = show(model.value);
});

// Định dạng 240.000 khi gõ, giữ nguyên vị trí con trỏ.
function onInput(e) {
  const el = e.target;
  const caret = el.selectionStart ?? el.value.length;
  const digitsBefore = digits(el.value.slice(0, caret)).length;
  const raw = digits(el.value).replace(/^0+(?=\d)/, '').slice(0, 10);
  el.value = text.value = raw ? num(Number(raw)) : '';
  model.value = Number(raw) || 0;
  if (document.activeElement !== el) return;
  let pos = 0;
  for (let seen = 0; pos < el.value.length && seen < digitsBefore; pos++) {
    if (/\d/.test(el.value[pos])) seen++;
  }
  el.setSelectionRange(pos, pos);
}
</script>

<template>
  <span class="money">
    <input :id="id" type="text" inputmode="numeric" autocomplete="off" :placeholder="placeholder" :value="text"
      @input="onInput">
    <span class="unit">đ</span>
  </span>
</template>

<style scoped>
.money {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  border: 1.5px solid var(--rule);
  border-radius: 14px;
  transition: border-color .15s, box-shadow .15s;
}

.money:focus-within {
  border-color: var(--lime-deep);
  box-shadow: 0 0 0 4px rgba(169, 212, 0, .22);
}

input {
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  padding: 0 34px 0 14px;
  font: 700 24px/1 var(--display);
  font-variant-numeric: tabular-nums;
  letter-spacing: .01em;
  outline: none;
}

.unit {
  position: absolute;
  right: 14px;
  font: 600 16px/1 var(--display);
  color: var(--muted);
  pointer-events: none;
}
</style>
