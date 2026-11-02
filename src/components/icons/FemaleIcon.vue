<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <svg class="ico-f" viewBox="0 0 24 24" role="img" :aria-label="t('stats.female')">
    <title>{{ t('stats.female') }}</title>
    <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 14.5V22M8.5 18.5h7" />
    </g>
  </svg>
</template>

<style scoped>
.ico-f {
  width: 15px;
  height: 15px;
  margin-left: 4px;
  color: var(--female);
  vertical-align: -2px;
}
</style>
