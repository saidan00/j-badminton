<script setup>
import { computed, inject, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import ChevronIcon from '@/components/icons/ChevronIcon.vue';
import FemaleIcon from '@/components/icons/FemaleIcon.vue';
import { pct } from '@/lib/format.js';
import { MIN_MATCHES, rankRows, rate } from '@/lib/stats.js';
import PlayerDetail from './PlayerDetail.vue';

const props = defineProps({
  stats: { type: Array, required: true },
  loading: Boolean,
});

const { t } = useI18n();
const nameOf = inject('nameOf');
const players = inject('players');
const expanded = reactive(new Set());

const rows = computed(() => rankRows(props.stats, nameOf));
const hasLow = computed(() => rows.value.some((row) => row.isLow));

function toggle(id) {
  if (expanded.has(id)) expanded.delete(id);
  else expanded.add(id);
}
</script>

<template>
  <section class="card section">
    <div class="sec-title">
      <h2><em>01</em>{{ t('stats.ranking.title') }}</h2>
      <p>{{ t('stats.ranking.hint', { n: MIN_MATCHES }) }}</p>
    </div>
    <table class="lb">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col" class="who">{{ t('stats.ranking.player') }}</th>
          <th scope="col" :title="t('stats.ranking.winsHint')">{{ t('stats.ranking.wins') }}</th>
          <th scope="col">{{ t('stats.ranking.rate') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td colspan="4" class="empty">{{ t(loading ? 'stats.ranking.loading' : 'stats.ranking.empty') }}</td>
        </tr>
        <template v-for="{ s, isLow, rank } in rows" :key="s.id">
          <tr class="row" :class="{ 'is-low': isLow, 'is-top': rank === 1 }">
            <td class="rank"><b>{{ isLow ? '–' : rank }}</b></td>
            <td class="who">
              <button type="button" :aria-expanded="expanded.has(s.id)" :aria-controls="`pd-${s.id}`"
                @click="toggle(s.id)">
                <span>{{ nameOf(s.id) }}<FemaleIcon v-if="players.get(s.id)?.gender === 'F'" /></span>
                <ChevronIcon />
              </button>
            </td>
            <td>{{ s.won }}/{{ s.played }}</td>
            <td>{{ pct(rate(s)) }}</td>
          </tr>
          <tr v-show="expanded.has(s.id)" :id="`pd-${s.id}`" class="detail">
            <td colspan="4">
              <PlayerDetail v-if="expanded.has(s.id)" :stat="s" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <p v-if="hasLow" class="lb-note">{{ t('stats.ranking.lowNote', { n: MIN_MATCHES }) }}</p>
  </section>
</template>

<style scoped>
.section {
  padding: 22px 20px 18px;
}

.lb {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.lb th {
  padding: 0 5px 10px;
  border-bottom: 2px solid var(--ink);
  font: 600 11px/1 var(--body);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: right;
  white-space: nowrap;
}

.lb td {
  padding: 10px 5px;
  border-bottom: 1px solid var(--rule);
  text-align: right;
  font: 700 19px/1 var(--display);
  white-space: nowrap;
}

.lb th:first-child,
.lb td.rank {
  width: 34px;
  padding-left: 0;
  text-align: center;
}

.lb th:last-child,
.lb td:last-child {
  padding-right: 0;
}

.lb th.who,
.lb td.who {
  width: 100%;
  text-align: left;
}

.lb td.who {
  white-space: normal;
}

.rank b {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font: 800 17px/1 var(--display);
}

.row.is-top .rank b {
  background: var(--lime);
  color: var(--lime-ink);
  box-shadow: 0 0 0 3px rgba(169, 212, 0, .25);
}

.who button {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 0;
  border: 0;
  background: none;
  font: 600 15px/1.2 var(--body);
  text-align: left;
  cursor: pointer;
}

.who button:focus-visible {
  outline: 2px solid var(--lime-deep);
  outline-offset: 2px;
  border-radius: 6px;
}

.who .chev {
  color: var(--muted);
}

.who button[aria-expanded="true"] .chev {
  transform: rotate(180deg);
}

.row.is-low td {
  color: var(--muted);
}

.lb tr.detail td {
  padding: 0 0 12px;
  text-align: left;
  font: inherit;
  white-space: normal;
}

.lb-note {
  margin-top: 12px;
  font: 500 12px/1.4 var(--body);
  color: var(--muted);
}

@media (max-width: 420px) {
  .section {
    padding: 20px 14px 16px;
  }

  .lb td {
    font-size: 17px;
  }

  .who button {
    font-size: 14px;
  }
}
</style>
