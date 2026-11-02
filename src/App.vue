<script setup>
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import CourtBackground from './components/CourtBackground.vue';
import ToastMessage from './components/ToastMessage.vue';
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
