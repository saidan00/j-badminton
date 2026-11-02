<script setup>
import { computed } from 'vue';
import { num, vnd } from '@/lib/format.js';
import { howRows, SHUTTLES_PER_TUBE, WOMEN_RATIO } from '@/lib/split.js';

const props = defineProps({ result: { type: Object, required: true } });

const how = computed(() => howRows(props.result));
const menLine = computed(() => {
  const r = props.result;
  if (!r.men) return '—';
  return r.waterEach > 0
    ? `${num(r.unit)} + ${num(r.waterEach)} = ${num(r.menExact)} → ${vnd(r.menPay)}`
    : `${num(r.unit)} → ${vnd(r.menPay)}`;
});
const womenLine = computed(() => {
  const r = props.result;
  return r.women ? `${num(r.unit)} × ${WOMEN_RATIO} = ${num(r.womenExact)} → ${vnd(r.womenPay)}` : '—';
});
</script>

<template>
  <div>
    <p class="label">Chi phí</p>
    <div class="r-row"><span>Tiền sân</span><b>{{ vnd(result.court) }}</b></div>
    <div class="r-row">
      <span>Tiền cầu<small>{{ result.shuttles }}/{{ SHUTTLES_PER_TUBE }} × {{ num(result.tubePrice) }}</small></span>
      <b>{{ vnd(result.shuttleCost) }}</b>
    </div>
    <div class="r-row"><span>Tiền nước</span><b>{{ vnd(result.water) }}</b></div>
    <div class="r-row r-total"><span>Tổng tiền</span><b>{{ vnd(result.total) }}</b></div>
    <div class="collected">
      <span>Thu về sau làm tròn</span>
      <span><b>{{ vnd(result.collected) }}</b> {{ result.surplus > 0.5 ? `· dư ${vnd(result.surplus)}` : '' }}</span>
    </div>

    <div class="how">
      <p class="label">Cách tính</p>
      <dl>
        <template v-for="[label, value] in how" :key="label">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </template>
        <dt>Nam</dt>
        <dd class="men">{{ menLine }}</dd>
        <dt>Nữ</dt>
        <dd class="women">{{ womenLine }}</dd>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.label {
  font: 800 15px/1 var(--display);
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}

.r-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 7px 0;
  font-size: 15px;
}

.r-row>span {
  color: var(--muted);
}

.r-row small {
  margin-left: 6px;
  font-size: 12px;
  color: var(--muted);
  opacity: .85;
}

.r-row b {
  font: 700 21px/1 var(--display);
  font-variant-numeric: tabular-nums;
  color: var(--ink);
  white-space: nowrap;
}

.r-total {
  margin-top: 6px;
  padding-top: 12px;
  border-top: 2px solid var(--ink);
}

.r-total>span {
  color: var(--ink);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  font-size: 14px;
}

.r-total b {
  font-size: 30px;
}

.collected {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--paper-2);
  font: 500 13px/1.35 var(--body);
  color: var(--muted);
}

.collected b {
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.how {
  margin-top: 20px;
}

.how dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 7px 14px;
  font-size: 13px;
  line-height: 1.35;
}

.how dt {
  color: var(--muted);
}

.how dd {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.how dd.men {
  color: var(--men-ink);
}

.how dd.women {
  color: var(--women-ink);
}
</style>
