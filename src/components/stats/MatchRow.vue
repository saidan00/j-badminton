<script setup>
import { computed } from 'vue';
import { winnerSide } from '@/lib/stats.js';
import PlayerNames from './PlayerNames.vue';

const props = defineProps({
  match: { type: Object, required: true },
  no: { type: [Number, String], default: '' },
  note: { type: String, default: '' },
});

const aWon = computed(() => winnerSide(props.match) === 'a');
</script>

<!-- Màu bên thắng lấy từ --win-a / --win-b của danh sách cha (đội A/B), mặc định màu chữ. -->
<template>
  <li class="m">
    <span class="m-no">{{ no }}</span>
    <span class="m-side m-a" :class="{ win: aWon }">
      <PlayerNames :ids="match.a" stack />
    </span>
    <span class="m-score">
      <b :class="{ win: aWon }">{{ match.score[0] }}</b>–<b :class="{ win: !aWon }">{{ match.score[1] }}</b>
      <small v-if="note">{{ note }}</small>
    </span>
    <span class="m-side m-b" :class="{ win: !aWon }">
      <PlayerNames :ids="match.b" stack />
    </span>
  </li>
</template>

<style scoped>
.m {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 70px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--rule);
  font: 500 14px/1.25 var(--body);
  color: var(--muted);
}

.m:last-child {
  border-bottom: 0;
}

.m-no {
  font: 700 13px/1 var(--display);
  opacity: .7;
}

.m-a {
  text-align: right;
}

.m-side.win {
  font-weight: 700;
}

.m-a.win {
  color: var(--win-a, var(--ink));
}

.m-b.win {
  color: var(--win-b, var(--ink));
}

.m-score {
  font: 700 20px/1 var(--display);
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}

.m-score b {
  font-weight: 600;
}

.m-score b.win {
  font-weight: 800;
  color: var(--ink);
}

.m-score small {
  display: block;
  margin-top: 3px;
  font: 700 10px/1 var(--body);
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--court-hi);
}

@media (max-width: 420px) {
  .m {
    gap: 8px;
    font-size: 13px;
  }
}
</style>
