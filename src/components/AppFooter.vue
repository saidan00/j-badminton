<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Link sang các trang còn lại, mũi tên chỉ theo thứ tự trang.
const links = computed(() => {
  const pages = router.getRoutes()
    .filter((r) => r.meta.navLabel)
    .sort((x, y) => x.path.length - y.path.length);
  const current = pages.findIndex((r) => r.name === route.name);
  return pages
    .map((r, i) => ({ r, i }))
    .filter(({ i }) => i !== current)
    .map(({ r, i }) => ({
      to: { name: r.name },
      label: i < current ? `← ${r.meta.navLabel}` : `${r.meta.navLabel} →`,
    }));
});
</script>

<template>
  <footer class="foot">
    <p v-if="route.meta.note">{{ route.meta.note }}</p>
    <nav aria-label="Trang">
      <RouterLink v-for="link in links" :key="link.label" :to="link.to">{{ link.label }}</RouterLink>
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
