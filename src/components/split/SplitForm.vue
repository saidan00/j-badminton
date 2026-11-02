<script setup>
import { computed, ref } from 'vue';
import ShuttleIcon from '@/components/icons/ShuttleIcon.vue';
import { dec, vnd } from '@/lib/format.js';
import { shuttleCost, SHUTTLES_PER_TUBE, totalWeight, WOMEN_RATIO } from '@/lib/split.js';
import LineupTile from './LineupTile.vue';
import MoneyInput from './MoneyInput.vue';
import NumberStepper from './NumberStepper.vue';

const inputs = defineModel({ type: Object, required: true });
defineProps({ error: { type: String, default: '' } });
const emit = defineEmits(['submit']);

const cta = ref(null);

const people = computed(() => inputs.value.men + inputs.value.women);
const weight = computed(() => dec(totalWeight(inputs.value.men, inputs.value.women)));
const shuttleHint = computed(() => {
  const { shuttles, tubePrice } = inputs.value;
  return `${shuttles}/${SHUTTLES_PER_TUBE} ống = ${vnd(shuttleCost(shuttles, tubePrice))}`;
});
const waterHint = computed(() => (inputs.value.men === 0 && inputs.value.water > 0
  ? 'Không có nam → chia chung theo hệ số'
  : 'Chỉ chia cho nam'));

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
        <h2><em>01</em>Đội hình</h2>
      </div>
      <div class="lineup">
        <LineupTile v-model="inputs.men" kind="men" name="Nam" ratio="×1.0" />
        <LineupTile v-model="inputs.women" kind="women" name="Nữ" :ratio="`×${WOMEN_RATIO}`" />
      </div>
      <p class="live-hint"><b>{{ people }}</b> người · tổng hệ số <b>{{ weight }}</b></p>
    </section>

    <section class="section">
      <div class="sec-title">
        <h2><em>02</em>Chi phí</h2>
      </div>
      <div class="fields">
        <label class="field">
          <span class="field-label">Tiền sân</span>
          <MoneyInput v-model="inputs.court" />
        </label>

        <div class="row2">
          <div class="field">
            <label class="field-label" for="shuttles">Số quả cầu</label>
            <NumberStepper id="shuttles" v-model="inputs.shuttles" dec-label="Bớt 1 quả" inc-label="Thêm 1 quả" />
            <span class="hint">{{ shuttleHint }}</span>
          </div>
          <label class="field">
            <span class="field-label">Giá 1 ống cầu</span>
            <MoneyInput v-model="inputs.tubePrice" />
            <span class="hint">1 ống = {{ SHUTTLES_PER_TUBE }} quả</span>
          </label>
        </div>

        <label class="field">
          <span class="field-label">Tiền nước</span>
          <MoneyInput v-model="inputs.water" placeholder="0" />
          <span class="hint">{{ waterHint }}</span>
        </label>
      </div>
    </section>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <button ref="cta" type="submit" class="cta">
      <ShuttleIcon />
      Tính tiền
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
