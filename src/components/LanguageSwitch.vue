<script setup>
import { useI18n } from 'vue-i18n';
import { LOCALES, setLocale } from '@/i18n.js';

const { locale, t } = useI18n();
</script>

<template>
  <div class="lang" role="group" :aria-label="t('lang.label')">
    <button v-for="code in LOCALES" :key="code" type="button" :lang="code" :aria-pressed="locale === code"
      @click="setLocale(code)">{{ code.toUpperCase() }}</button>
  </div>
</template>

<style scoped>
.lang {
  display: inline-flex;
  padding: 3px;
  border-radius: 99px;
  background: rgba(255, 255, 255, .09);
  border: 1px solid rgba(255, 255, 255, .18);
}

button {
  min-width: 36px;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 99px;
  background: transparent;
  color: rgba(255, 255, 255, .7);
  font: 700 12px/1 var(--body);
  letter-spacing: .08em;
  cursor: pointer;
  transition: background .15s, color .15s;
}

button:hover {
  color: #fff;
}

button[aria-pressed="true"] {
  background: var(--lime);
  color: var(--lime-ink);
}

button:focus-visible {
  outline: 2px solid var(--lime);
  outline-offset: 2px;
}
</style>
