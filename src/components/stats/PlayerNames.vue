<script setup>
import { inject } from 'vue';

defineProps({
  ids: { type: Array, required: true },
  sep: { type: String, default: ' & ' },
  // Mỗi người một dòng như bảng kết quả BWF, dùng cho cặp đánh đôi.
  stack: Boolean,
});

const nameOf = inject('nameOf');
</script>

<!-- Chỉ cho xuống dòng giữa các tên, không cắt đôi "Hoàng Anh". -->
<template>
  <template v-for="(id, i) in ids" :key="id">{{ i && !stack ? sep : '' }}<span class="nm" :class="{ stack }">{{ nameOf(id) }}</span></template>
</template>

<style scoped>
.nm {
  white-space: nowrap;
}

.nm.stack {
  display: block;
}
</style>
