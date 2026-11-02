<script setup>
import QrBlock from './QrBlock.vue';
import ResultActions from './ResultActions.vue';
import ResultBoard from './ResultBoard.vue';
import ResultReceipt from './ResultReceipt.vue';

defineProps({
  result: { type: Object, default: null },
  animate: Boolean,
  announce: { type: String, default: '' },
});
</script>

<template>
  <section class="result card">
    <ResultBoard :result="result" :animate="animate" />
    <div v-if="result" class="result-body">
      <ResultReceipt :result="result" />
      <QrBlock :result="result" />
      <ResultActions :result="result" />
    </div>
    <p class="sr-only" role="status">{{ announce }}</p>
  </section>
</template>

<style scoped>
.result {
  scroll-margin-top: 16px;
}

@media (min-width: 900px) {
  .result {
    position: sticky;
    top: 24px;
  }
}

/* Đường xé biên lai, hai lỗ tròn ăn vào nền sân */
.result-body {
  position: relative;
  padding: 22px 20px 22px;
  border-top: 2px dashed var(--rule);
}

.result-body::before,
.result-body::after {
  content: "";
  position: absolute;
  top: -12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--court);
}

.result-body::before {
  left: -11px;
}

.result-body::after {
  right: -11px;
}
</style>
