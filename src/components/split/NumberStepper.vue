<script setup>
import { ref, watch } from 'vue';
import { digits } from '@/lib/format.js';

const model = defineModel({ type: Number, required: true });
const props = defineProps({
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  decLabel: { type: String, required: true },
  incLabel: { type: String, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
  large: Boolean,
});

// Giữ chữ đang gõ (kể cả ô trống) để không nhảy số khi người dùng đang xoá.
const text = ref(String(model.value));
const parse = (s) => Number(digits(s)) || 0;
const clamp = (n) => Math.min(props.max, Math.max(props.min, n));

watch(model, (v) => {
  if (parse(text.value) !== v) text.value = String(v);
});

function onInput(e) {
  text.value = e.target.value;
  model.value = parse(text.value);
}

function onChange() {
  model.value = clamp(parse(text.value));
  text.value = String(model.value);
}

function step(delta) {
  model.value = clamp(model.value + delta);
  text.value = String(model.value);
}
</script>

<template>
  <div class="stepper" :class="{ 'is-lg': large }">
    <button type="button" class="step" :aria-label="decLabel" @click="step(-1)">−</button>
    <input :id="id" type="number" inputmode="numeric" :min="min" :max="max" :aria-label="label" :value="text"
      @input="onInput" @change="onChange">
    <button type="button" class="step" :aria-label="incLabel" @click="step(1)">+</button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  height: 52px;
  background: #fff;
  border: 1.5px solid var(--rule);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color .15s, box-shadow .15s;
}

.stepper:focus-within {
  border-color: var(--lime-deep);
  box-shadow: 0 0 0 4px rgba(169, 212, 0, .22);
}

.step {
  flex: none;
  width: 44px;
  height: 100%;
  border: 0;
  background: transparent;
  font: 500 24px/1 var(--body);
  color: var(--ink);
  cursor: pointer;
  transition: background .12s;
}

.step:hover {
  background: var(--paper-2);
}

.step:active {
  background: var(--lime);
}

input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  text-align: center;
  font: 700 28px/1 var(--display);
  font-variant-numeric: tabular-nums;
  outline: none;
  -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.is-lg {
  height: 60px;
}

.is-lg input {
  font-size: 38px;
}

@media (max-width: 420px) {
  .is-lg .step {
    width: 36px;
  }

  .is-lg input {
    font-size: 32px;
  }
}
</style>
