<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { LOGO_URL } from '@/config.js';
import ShuttleIcon from './icons/ShuttleIcon.vue';
import LanguageSwitch from './LanguageSwitch.vue';

const { t } = useI18n();
const route = useRoute();

const page = computed(() => route.meta.i18nKey ?? 'split');
const chips = computed(() => route.meta.chips?.() ?? []);
</script>

<template>
  <div class="topbar">
    <LanguageSwitch />
  </div>
  <header class="hero">
    <div class="logo">
      <ShuttleIcon />
    </div>
    <div>
      <p class="eyebrow">{{ t('club') }}</p>
      <h1>{{ t(`${page}.title`) }} <span>{{ t(`${page}.accent`) }}</span></h1>
      <div v-if="chips.length" class="chips">
        <span v-for="chip in chips" :key="chip" class="chip">{{ chip }}</span>
      </div>
    </div>
    <div class="logo-wrapper">
      <img class="club-logo" :alt="t('club')" :src="LOGO_URL">
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: flex-end;
  margin: -14px 0 10px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #fff;
  margin-bottom: 26px;
}

.logo {
  flex: none;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--lime);
  color: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 7px rgba(216, 255, 60, .16), 0 14px 30px -8px rgba(0, 0, 0, .45);
}

.logo svg {
  width: 46px;
  height: 46px;
  transform: rotate(-32deg);
}

/* Khung tròn nền tối, ảnh phóng nhẹ cho kín viền */
.logo-wrapper {
  flex: none;
  width: 96px;
  height: 96px;
  margin-left: auto;
  border-radius: 50%;
  background: #070d1b;
  box-shadow: 0 0 0 4px rgba(24, 38, 61, 0.9), 0 0 0 11px rgba(59, 130, 246, 0.22), 0 14px 30px -8px rgba(0, 0, 0, .45);
  overflow: hidden;
}

.club-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
}

.eyebrow {
  font: 600 12px/1 var(--body);
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--lime);
}

h1 {
  font: italic 800 clamp(38px, 8vw, 66px)/.9 var(--display);
  text-transform: uppercase;
  letter-spacing: .005em;
  margin-top: 8px;
}

h1 span {
  color: var(--lime);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.chip {
  font: 600 12px/1 var(--body);
  padding: 6px 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, .09);
  border: 1px solid rgba(255, 255, 255, .18);
  color: #e6f4ec;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .hero {
    align-items: flex-start;
    gap: 14px;
  }

  .logo {
    width: 56px;
    height: 56px;
    margin-top: 4px;
  }

  .logo svg {
    width: 34px;
    height: 34px;
  }

  .eyebrow {
    font-size: 11px;
    letter-spacing: .1em;
    white-space: nowrap;
  }

  .logo-wrapper {
    width: 64px;
    height: 64px;
    margin-top: 4px;
    box-shadow: 0 0 0 3px rgba(24, 38, 61, 0.9), 0 0 0 8px rgba(59, 130, 246, 0.22), 0 10px 24px -8px rgba(0, 0, 0, .45);
  }
}

/* Máy rất hẹp: bỏ logo cầu để logo CLB không bị đẩy tràn ra ngoài */
@media (max-width: 359px) {
  .logo {
    display: none;
  }
}
</style>
