<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Link sang các trang còn lại, mũi tên chỉ theo thứ tự trang.
const links = computed(() => {
  const pages = router.getRoutes()
    .filter((r) => r.meta.i18nKey)
    .sort((x, y) => x.path.length - y.path.length);
  const current = pages.findIndex((r) => r.name === route.name);
  return pages
    .map((r, i) => ({ r, i }))
    .filter(({ i }) => i !== current)
    .map(({ r, i }) => {
      const label = t(`nav.${r.meta.i18nKey}`);
      return { to: { name: r.name }, label: i < current ? `← ${label}` : `${label} →` };
    });
});
</script>

<template>
  <footer class="foot">
    <p v-if="route.meta.note">{{ t('footer.note') }}</p>
    <nav :aria-label="t('nav.label')">
      <RouterLink v-for="link in links" :key="link.to.name" :to="link.to">{{ link.label }}</RouterLink>
    </nav>
  </footer>
</template>

<style scoped>
.foot {
  margin-top: 28px;
  text-align: center;
  font: 500 12px/1.5 var(--body);
  color: rgba(255, 255, 255, .55);
}

nav {
  display: flex;
  justify-content: center;
  gap: 16px;
}

a {
  color: var(--lime);
  font-weight: 600;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
