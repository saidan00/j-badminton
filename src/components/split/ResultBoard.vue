<script setup>
import { computed } from 'vue';
import { vnd } from '@/lib/format.js';
import CountUp from './CountUp.vue';

const props = defineProps({
  result: { type: Object, default: null },
  animate: Boolean,
});

const teams = computed(() => {
  const r = props.result;
  return [
    { kind: 'men', name: 'Nam', count: r?.men, pay: r?.menPay },
    { kind: 'women', name: 'Nữ', count: r?.women, pay: r?.womenPay },
  ];
});
</script>

<template>
  <div class="board">
    <div class="board-top">
      <span class="live" :class="{ 'is-idle': !result }"><i></i>Kết quả</span>
      <span class="board-total">Tổng<b>{{ result ? vnd(result.total) : '—' }}</b></span>
    </div>
    <div class="teams">
      <template v-for="(team, i) in teams" :key="team.kind">
        <div v-if="i > 0" class="net" aria-hidden="true"></div>
        <div class="team" :class="[`team--${team.kind}`, { 'is-empty': result && !team.count }]">
          <div class="team-name">{{ team.name }}<small>{{ result ? team.count : '—' }} người</small></div>
          <CountUp class="score" :value="team.count ? team.pay : null" :animate="animate" />
          <div class="per">đ / người</div>
        </div>
      </template>
    </div>
    <p v-if="!result" class="idle-msg">Nhập thông tin rồi bấm <b>Tính tiền</b> nhé</p>
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

.team--women {
  --c: var(--women);
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
