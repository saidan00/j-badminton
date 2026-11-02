<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { vnd } from '@/lib/format.js';
import { howRows, payFormulas, shuttleNote, surplusNote } from '@/lib/split.js';

const props = defineProps({ result: { type: Object, required: true } });

const { t } = useI18n();
const how = computed(() => howRows(props.result));
const pay = computed(() => payFormulas(props.result));
</script>

<template>
  <div>
    <p class="label">{{ t('split.receipt.costs') }}</p>
    <div class="r-row"><span>{{ t('split.receipt.court') }}</span><b>{{ vnd(result.court) }}</b></div>
    <div class="r-row">
      <span>{{ t('split.receipt.shuttles') }}<small>{{ shuttleNote(result) }}</small></span>
      <b>{{ vnd(result.shuttleCost) }}</b>
    </div>
    <div class="r-row"><span>{{ t('split.receipt.water') }}</span><b>{{ vnd(result.water) }}</b></div>
    <div class="r-row r-total"><span>{{ t('split.receipt.total') }}</span><b>{{ vnd(result.total) }}</b></div>
    <div class="collected">
      <span>{{ t('split.receipt.collected') }}</span>
      <span><b>{{ vnd(result.collected) }}</b> {{ surplusNote(result) }}</span>
    </div>

    <div class="how">
      <p class="label">{{ t('split.how.title') }}</p>
      <dl>
        <template v-for="[label, value] in how" :key="label">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </template>
        <dt>{{ t('split.men') }}</dt>
        <dd class="men">{{ pay.men ?? '—' }}</dd>
        <dt>{{ t('split.women') }}</dt>
        <dd class="women">{{ pay.women ?? '—' }}</dd>
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
