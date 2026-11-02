<script setup>
import { computed, onMounted, provide, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import RankingTable from '@/components/stats/RankingTable.vue';
import StatsFilters from '@/components/stats/StatsFilters.vue';
import TournamentCard from '@/components/stats/TournamentCard.vue';
import { buildStats, loadStatsData } from '@/lib/stats.js';

const { t } = useI18n();
const players = shallowRef(new Map());
const tournaments = shallowRef([]);
const errors = ref([]);
const loadError = ref('');
const loading = ref(true);
const filter = ref({ type: 'all', year: 'all' });

const nameOf = (id) => players.value.get(id)?.name ?? id;
provide('nameOf', nameOf);
provide('players', { get: (id) => players.value.get(id) });

const years = computed(() => [...new Set(tournaments.value.map((t) => t.date.slice(0, 4)))].sort().reverse());
const filtered = computed(() => {
  const { type, year } = filter.value;
  return tournaments.value.filter((t) => (type === 'all' || t.type === type)
    && (year === 'all' || t.date.startsWith(year)));
});
const stats = computed(() => buildStats(filtered.value));
const history = computed(() => [...filtered.value].sort((x, y) => y.date.localeCompare(x.date)));

onMounted(async () => {
  try {
    const data = await loadStatsData();
    players.value = data.players;
    tournaments.value = data.tournaments;
    errors.value = data.errors;
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <StatsFilters v-model="filter" :years="years" />

  <div v-if="loadError" class="error" role="alert">{{ t('stats.errors.load', { message: loadError }) }}</div>
  <div v-else-if="errors.length" class="error" role="alert">
    {{ t('stats.errors.title') }}
    <ul>
      <li v-for="(e, i) in errors" :key="i">{{ t(e.key, e.params) }}</li>
    </ul>
  </div>

  <div class="grid">
    <RankingTable :stats="stats" :loading="loading" />
    <section class="history" :aria-label="t('stats.history.label')">
      <TournamentCard v-for="(item, i) in history" :key="item.id ?? item.date" :tournament="item" :open="i === 0" />
      <div v-if="!loading && !history.length" class="card section empty">{{ t('stats.history.empty') }}</div>
    </section>
  </div>
</template>

<style scoped>
.error {
  margin-bottom: 20px;
}

.error ul {
  margin-top: 4px;
  padding-left: 18px;
  font-weight: 500;
}

.history {
  display: grid;
  gap: 20px;
}
</style>
