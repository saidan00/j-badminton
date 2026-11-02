<script setup>
import { useRoute } from 'vue-router';
import { CLUB_NAME, LOGO_URL } from '@/config.js';
import ShuttleIcon from './icons/ShuttleIcon.vue';

const route = useRoute();
</script>

<template>
  <header class="hero">
    <div class="logo">
      <ShuttleIcon />
    </div>
    <div>
      <p class="eyebrow">{{ CLUB_NAME }}</p>
      <h1>{{ route.meta.title }} <span>{{ route.meta.accent }}</span></h1>
      <div v-if="route.meta.chips?.length" class="chips">
        <span v-for="chip in route.meta.chips" :key="chip" class="chip">{{ chip }}</span>
      </div>
    </div>
    <div class="logo-wrapper">
      <img class="club-logo" :alt="CLUB_NAME" :src="LOGO_URL">
    </div>
  </header>
</template>

<style scoped>
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
