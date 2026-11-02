<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ShuttleIcon from '@/components/icons/ShuttleIcon.vue';
import { dec, vnd } from '@/lib/format.js';
import { shuttleCost, SHUTTLES_PER_TUBE, totalWeight, WOMEN_RATIO } from '@/lib/split.js';
import LineupTile from './LineupTile.vue';
import MoneyInput from './MoneyInput.vue';
import NumberStepper from './NumberStepper.vue';

const inputs = defineModel({ type: Object, required: true });
// error là key i18n để đổi ngôn ngữ thì thông báo đổi theo.
defineProps({ error: { type: String, default: '' } });
const emit = defineEmits(['submit']);

const { t } = useI18n();
const cta = ref(null);

const people = computed(() => inputs.value.men + inputs.value.women);
const weight = computed(() => dec(totalWeight(inputs.value.men, inputs.value.women)));
const shuttleHint = computed(() => {
  const { shuttles, tubePrice } = inputs.value;
  return t('split.shuttleHint', {
    used: shuttles, per: SHUTTLES_PER_TUBE, cost: vnd(shuttleCost(shuttles, tubePrice)),
  });
});
const waterHint = computed(() => (inputs.value.men === 0 && inputs.value.water > 0
  ? t('split.waterShared')
  : t('split.waterMenOnly')));

// Gọi lại animation "đập cầu" mỗi lần tính thành công.
function smash() {
  const el = cta.value;
  el.classList.remove('smash');
  void el.offsetWidth;
  el.classList.add('smash');
}

defineExpose({ smash });
</script>

<template>
  <form class="card" novalidate @submit.prevent="emit('submit')">
    <section class="section">
      <div class="sec-title">
        <h2><em>01</em>{{ t('split.lineup') }}</h2>
      </div>
      <div class="lineup">
        <LineupTile v-model="inputs.men" kind="men" ratio="×1.0" />
        <LineupTile v-model="inputs.women" kind="women" :ratio="`×${WOMEN_RATIO}`" />
      </div>
      <i18n-t keypath="split.lineupHint" tag="p" class="live-hint" :plural="people">
        <template #people><b>{{ people }}</b></template>
        <template #weight><b>{{ weight }}</b></template>
      </i18n-t>
    </section>

    <section class="section">
      <div class="sec-title">
        <h2><em>02</em>{{ t('split.costs') }}</h2>
      </div>
      <div class="fields">
        <label class="field">
          <span class="field-label">{{ t('split.court') }}</span>
          <MoneyInput v-model="inputs.court" />
        </label>

        <div class="row2">
          <div class="field">
            <label class="field-label" for="shuttles">{{ t('split.shuttles') }}</label>
            <NumberStepper id="shuttles" v-model="inputs.shuttles" :dec-label="t('split.remove.shuttles')"
              :inc-label="t('split.add.shuttles')" />
            <span class="hint">{{ shuttleHint }}</span>
          </div>
          <label class="field">
            <span class="field-label">{{ t('split.tubePrice') }}</span>
            <MoneyInput v-model="inputs.tubePrice" />
            <span class="hint">{{ t('split.tubeSize', { n: SHUTTLES_PER_TUBE }) }}</span>
          </label>
        </div>

        <label class="field">
          <span class="field-label">{{ t('split.water') }}</span>
          <MoneyInput v-model="inputs.water" placeholder="0" />
          <span class="hint">{{ waterHint }}</span>
        </label>
      </div>
    </section>

    <p v-if="error" class="error" role="alert">{{ t(error) }}</p>

    <button ref="cta" type="submit" class="cta">
      <ShuttleIcon />
      {{ t('split.calculate') }}
    </button>
  </form>
</template>

<style scoped>
.lineup {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.live-hint {
  margin-top: 10px;
  font: 500 13px/1.3 var(--body);
  color: var(--muted);
}

.live-hint b {
  color: var(--ink);
  font-weight: 700;
}

.fields {
  display: grid;
  gap: 14px;
}

.row2 {
  display: grid;
  gap: 14px;
}

@media (min-width: 360px) {
  .row2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

.field {
  display: block;
}

.field-label {
  display: block;
  font: 600 13px/1 var(--body);
  margin-bottom: 7px;
}

.hint {
  display: block;
  margin-top: 6px;
  font: 500 12px/1.35 var(--body);
  color: var(--muted);
}

.error {
  margin: 14px 20px 0;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: calc(100% - 40px);
  height: 62px;
  margin: 20px 20px 24px;
  border: 0;
  border-radius: 16px;
  background: var(--lime);
  color: var(--lime-ink);
  font: italic 800 27px/1 var(--display);
  letter-spacing: .05em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 6px 0 var(--lime-deep), 0 16px 30px -12px rgba(0, 0, 0, .45);
  transition: transform .12s, box-shadow .12s, filter .12s;
}

.cta:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}

.cta:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--lime-deep), 0 8px 18px -10px rgba(0, 0, 0, .4);
}

.cta:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}

.cta svg {
  width: 30px;
  height: 30px;
  transform: rotate(-32deg);
}

.cta.smash svg {
  animation: smash .65s cubic-bezier(.3, 1.5, .5, 1);
}

@keyframes smash {
  0% {
    transform: rotate(-32deg);
  }

  35% {
    transform: translate(10px, -10px) rotate(-75deg) scale(1.1);
  }

  100% {
    transform: rotate(-32deg);
  }
}
</style>
