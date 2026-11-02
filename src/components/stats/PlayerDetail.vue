<script setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { bestPartner, titleOf } from '@/lib/stats.js';
import PlayerNames from './PlayerNames.vue';

const props = defineProps({ stat: { type: Object, required: true } });

const { t } = useI18n();
const nameOf = inject('nameOf');
const best = computed(() => bestPartner(props.stat));
const log = computed(() => [...props.stat.log].sort((x, y) => y.t.date.localeCompare(x.t.date) || x.i - y.i));
</script>

<template>
  <div class="pd">
    <dl class="pd-stats">
      <div>
        <dt>{{ t('stats.detail.events') }}</dt>
        <dd>{{ stat.events }}</dd>
      </div>
      <div>
        <dt>{{ t('stats.detail.teamWins') }}</dt>
        <dd>{{ stat.teamWins }}/{{ stat.events }}</dd>
      </div>
      <div>
        <dt>{{ t('stats.detail.bestPartner') }}</dt>
        <dd v-if="best">{{ nameOf(best[0]) }}<small>{{ best[1].won }}/{{ best[1].played }}</small></dd>
        <dd v-else>—</dd>
      </div>
    </dl>
    <ol class="pd-log">
      <li v-for="e in log" :key="`${e.t.id}-${e.i}`" :class="{ 'is-win': e.won }">
        <span class="wl" :aria-label="t(e.won ? 'stats.detail.won' : 'stats.detail.lost')">
          {{ t(e.won ? 'stats.detail.wonShort' : 'stats.detail.lostShort') }}
        </span>
        <span class="pd-text">
          <i18n-t :keypath="e.partner ? 'stats.detail.doubles' : 'stats.detail.singles'" tag="span">
            <template #partner><b>{{ nameOf(e.partner) }}</b></template>
            <template #opponents>
              <PlayerNames :ids="e.opp" />
            </template>
          </i18n-t>
          <small>
            {{ t('stats.detail.match', { title: titleOf(e.t), n: e.i + 1 }) }}{{ e.decider ? t('stats.detail.decider') : '' }}
          </small>
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
