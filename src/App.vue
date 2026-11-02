<script setup>
import { watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import CourtBackground from './components/CourtBackground.vue';
import ToastMessage from './components/ToastMessage.vue';

const { t } = useI18n();
const route = useRoute();

// Tiêu đề tab đổi theo trang và ngôn ngữ.
watchEffect(() => {
  document.title = t(`${route.meta.i18nKey ?? 'split'}.docTitle`);
});
</script>

<template>
  <CourtBackground />
  <main class="wrap">
    <AppHeader />
    <RouterView />
    <AppFooter />
  </main>
  <ToastMessage />
</template>
