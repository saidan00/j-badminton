<script setup>
import NumberStepper from './NumberStepper.vue';

const count = defineModel({ type: Number, required: true });
defineProps({
  kind: { type: String, required: true, validator: (v) => ['men', 'women'].includes(v) },
  name: { type: String, required: true },
  ratio: { type: String, required: true },
});
</script>

<template>
  <div class="tile" :class="`tile--${kind}`">
    <div class="tile-head">
      <span class="tile-name">{{ name }}</span>
      <span class="tile-ratio">{{ ratio }}</span>
    </div>
    <NumberStepper v-model="count" large :label="`Số ${name.toLowerCase()}`"
      :dec-label="`Bớt 1 ${name.toLowerCase()}`" :inc-label="`Thêm 1 ${name.toLowerCase()}`" />
  </div>
</template>

<style scoped>
.tile {
  --c: var(--men);
  --c-ink: var(--men-ink);
  border-radius: 16px;
  padding: 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 16%, #fff), #fff 70%);
  border: 1.5px solid color-mix(in srgb, var(--c) 40%, var(--rule));
}

.tile--women {
  --c: var(--women);
  --c-ink: var(--women-ink);
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tile-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 800 20px/1 var(--display);
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--c-ink);
}

.tile-name::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 25%, transparent);
}

.tile-ratio {
  font: 700 13px/1 var(--display);
  letter-spacing: .04em;
  padding: 4px 7px;
  border-radius: 6px;
  background: #fff;
  color: var(--c-ink);
  border: 1px solid color-mix(in srgb, var(--c) 40%, var(--rule));
}

@media (max-width: 420px) {
  .tile {
    padding: 10px;
  }
}
</style>
