<script setup>
const on = defineModel({ type: Boolean, required: true });
defineProps({ label: { type: String, required: true } });
</script>

<template>
  <label class="switch">
    <input v-model="on" type="checkbox" role="switch">
    <span>{{ label }}</span>
    <span class="track" aria-hidden="true"></span>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: center;
  font: 600 13px/1 var(--body);
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}

.switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.track {
  position: relative;
  flex: none;
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background: var(--rule);
  transition: background .15s;
}

.track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .25);
  transition: transform .15s;
}

.switch:has(input:checked) {
  color: var(--ink);
}

.switch input:checked~.track {
  background: var(--court-hi);
}

.switch input:checked~.track::after {
  transform: translateX(16px);
}

.switch input:focus-visible~.track {
  outline: 3px solid var(--lime-deep);
  outline-offset: 2px;
}
</style>
