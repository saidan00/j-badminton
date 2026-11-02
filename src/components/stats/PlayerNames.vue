<script setup>
import { inject } from 'vue';

defineProps({
  ids: { type: Array, required: true },
  sep: { type: String, default: ' & ' },
});

const nameOf = inject('nameOf');
</script>

<!-- Chỉ cho xuống dòng giữa các tên, không cắt đôi "Hoàng Anh". -->
<template>
  <template v-for="(id, i) in ids" :key="id">{{ i ? sep : '' }}<span class="nm">{{ nameOf(id) }}</span></template>
</template>

<style scoped>
.nm {
  white-space: nowrap;
}
</style>
