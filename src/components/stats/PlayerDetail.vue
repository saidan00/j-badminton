<script setup>
import { computed, inject } from 'vue';
import { bestPartner, titleOf } from '@/lib/stats.js';
import PlayerNames from './PlayerNames.vue';

const props = defineProps({ stat: { type: Object, required: true } });

const nameOf = inject('nameOf');
const best = computed(() => bestPartner(props.stat));
const log = computed(() => [...props.stat.log].sort((x, y) => y.t.date.localeCompare(x.t.date) || x.i - y.i));
</script>

<template>
  <div class="pd">
    <dl class="pd-stats">
      <div>
        <dt>Giải tham gia</dt>
        <dd>{{ stat.events }}</dd>
      </div>
      <div>
        <dt>Đội thắng chung cuộc</dt>
        <dd>{{ stat.teamWins }}/{{ stat.events }}</dd>
      </div>
      <div>
        <dt>Đánh cặp ăn ý nhất</dt>
        <dd v-if="best">{{ nameOf(best[0]) }}<small>{{ best[1].won }}/{{ best[1].played }}</small></dd>
        <dd v-else>—</dd>
      </div>
    </dl>
    <ol class="pd-log">
      <li v-for="e in log" :key="`${e.t.id}-${e.i}`" :class="{ 'is-win': e.won }">
        <span class="wl" :aria-label="e.won ? 'Thắng' : 'Thua'">{{ e.won ? 'T' : 'B' }}</span>
        <span class="pd-text">
          <template v-if="e.partner">cùng <b>{{ nameOf(e.partner) }}</b></template>
          <template v-else>Đánh đơn</template>
          gặp
          <PlayerNames :ids="e.opp" />
          <small>{{ titleOf(e.t) }} · trận {{ e.i + 1 }}{{ e.decider ? ' · quyết định' : '' }}</small>
        </span>
        <span class="pd-score">{{ e.mine }}–{{ e.theirs }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.pd {
  padding: 14px;
  border-radius: 14px;
  background: var(--paper-2);
}

.pd-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.pd-stats dt {
  font: 500 12px/1.2 var(--body);
  color: var(--muted);
}

.pd-stats dd {
  margin-top: 4px;
  font: 700 21px/1.1 var(--display);
  font-variant-numeric: tabular-nums;
}

.pd-stats dd small {
  margin-left: 4px;
  font: 600 15px/1 var(--display);
  color: var(--muted);
}

.pd-log {
  list-style: none;
  margin-top: 14px;
  padding: 4px 0 0;
  border-top: 1.5px dashed var(--rule);
}

.pd-log li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding-top: 9px;
  font: 500 13px/1.35 var(--body);
}

.wl {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1px solid var(--rule);
  background: #fff;
  font: 800 13px/1 var(--display);
  color: var(--muted);
}

.is-win .wl {
  border-color: var(--court-hi);
  background: var(--court-hi);
  color: #fff;
}

.pd-text small {
  display: block;
  font-size: 11px;
  color: var(--muted);
}

.pd-score {
  font: 700 18px/1 var(--display);
  font-variant-numeric: tabular-nums;
}
</style>
