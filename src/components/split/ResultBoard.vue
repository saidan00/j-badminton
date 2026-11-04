<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSplitMode } from '@/composables/useSplitMode.js';
import { vnd } from '@/lib/format.js';
import { payGroups } from '@/lib/split.js';
import CountUp from './CountUp.vue';

const props = defineProps({
  result: { type: Object, default: null },
  animate: Boolean,
});

const { t } = useI18n();
const equal = useSplitMode();

// Chưa tính thì vẫn hiện khung theo chế độ đang chọn.
const teams = computed(() => {
  if (props.result) return payGroups(props.result);
  return (equal.value ? ['all'] : ['men', 'women']).map((kind) => ({ kind }));
});
</script>

<template>
  <div class="board">
    <div class="board-top">
      <span class="live" :class="{ 'is-idle': !result }"><i></i>{{ t('split.result') }}</span>
      <span class="board-total">{{ t('split.total') }}<b>{{ result ? vnd(result.total) : '—' }}</b></span>
    </div>
    <div class="teams" :class="{ 'is-single': teams.length === 1 }">
      <template v-for="(team, i) in teams" :key="team.kind">
        <div v-if="i > 0" class="net" aria-hidden="true"></div>
        <div class="team" :class="[`team--${team.kind}`, { 'is-empty': result && !team.count }]">
          <div class="team-name">
            {{ t(`split.${team.kind}`) }}
            <small>{{ result ? t('split.people', team.count) : t('split.peopleUnknown') }}</small>
          </div>
          <CountUp class="score" :value="team.count ? team.pay : null" :animate="animate" />
          <div class="per">{{ t('split.perPerson') }}</div>
        </div>
      </template>
    </div>
    <i18n-t v-if="!result" keypath="split.idle" tag="p" class="idle-msg">
      <template #action><b>{{ t('split.calculate') }}</b></template>
    </i18n-t>
  </div>
</template>

<style scoped>
.live {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 10px var(--lime);
  animation: pulse 1.6s ease-in-out infinite;
}

.live.is-idle i {
  background: rgba(255, 255, 255, .35);
  box-shadow: none;
  animation: none;
}

@keyframes pulse {
  50% {
    opacity: .35;
  }
}

.board-total b {
  margin-left: 6px;
  font: 700 20px/1 var(--display);
  letter-spacing: .02em;
  color: var(--lime);
  font-variant-numeric: tabular-nums;
  text-transform: none;
}

.teams.is-single {
  grid-template-columns: 1fr;
}

.team--women {
  --c: var(--women);
}

.team--all {
  --c: var(--lime);
}

.team.is-empty .score {
  opacity: .3;
  text-shadow: none;
}

.per {
  margin-top: 6px;
  font: 500 12px/1 var(--body);
  color: rgba(255, 255, 255, .55);
}

.idle-msg {
  margin-top: 18px;
  text-align: center;
  font: 500 14px/1.4 var(--body);
  color: rgba(255, 255, 255, .6);
}

.idle-msg b {
  color: var(--lime);
}
</style>
