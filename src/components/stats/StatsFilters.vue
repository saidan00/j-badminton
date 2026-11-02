<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TYPES } from '@/lib/stats.js';

const filter = defineModel({ type: Object, required: true });
const props = defineProps({ years: { type: Array, required: true } });

const { t } = useI18n();

const groups = computed(() => [
  {
    key: 'type',
    label: t('stats.filters.type'),
    options: [['all', t('stats.filters.all')], ...TYPES.map((type) => [type, t(`stats.type.${type}`)])],
  },
  {
    key: 'year',
    label: t('stats.filters.year'),
    options: [['all', t('stats.filters.all')], ...props.years.map((y) => [y, y])],
  },
]);
</script>

<template>
  <nav class="filters" :aria-label="t('stats.filters.label')">
    <div v-for="group in groups" :key="group.key" class="seg" role="group" :aria-label="group.label">
      <span class="seg-label">{{ group.label }}</span>
      <button v-for="[value, text] in group.options" :key="value" type="button"
        :aria-pressed="filter[group.key] === value" @click="filter[group.key] = value">{{ text }}</button>
    </div>
  </nav>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-bottom: 24px;
}

.seg {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.seg-label {
  margin-right: 4px;
  font: 600 11px/1 var(--body);
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .55);
}

button {
  height: 32px;
  padding: 0 12px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(255, 255, 255, .09);
  color: #e6f4ec;
  font: 600 13px/1 var(--body);
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}

button:hover {
  background: rgba(255, 255, 255, .16);
}

button[aria-pressed="true"] {
  background: var(--lime);
  border-color: var(--lime);
  color: var(--lime-ink);
}

button:focus-visible {
  outline: 2px solid var(--lime);
  outline-offset: 2px;
}
</style>
