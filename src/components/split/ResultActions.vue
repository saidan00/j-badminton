<script setup>
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import { useQrImage } from '@/composables/useQrImage.js';
import { useToast } from '@/composables/useToast.js';
import { LOGO_URL } from '@/config.js';
import { copyImage as copyImageBlob, copyText, download, storage } from '@/lib/browser.js';
import { today } from '@/lib/format.js';
import { renderCard } from '@/lib/resultCard.js';
import { summary } from '@/lib/split.js';

const props = defineProps({ result: { type: Object, required: true } });

const FORMULA_KEY = 'badminton-split:full-formula';

const { t } = useI18n();
const { src: qrSrc } = useQrImage();
const toast = useToast();
const busy = ref(false);

// Ảnh copy/tải về kèm đủ các dòng tính (hệ số, tiền 1 hệ số, nước) hay chỉ công thức tiền mỗi người.
const fullFormula = ref(storage.get(FORMULA_KEY) !== '0');
watch(fullFormula, (on) => storage.set(FORMULA_KEY, on ? '1' : '0'));

// Đổi nhãn nút trong chốc lát để báo kết quả (Đã copy ✓, Lỗi rồi…).
const flashes = reactive({});
const timers = {};
function flash(key, text, ok = true) {
  flashes[key] = { text, ok };
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => delete flashes[key], 1800);
}

const filename = () => t('split.filename', { date: props.result.date || today() });
const card = () => renderCard(props.result, { qrSrc: qrSrc.value, logoSrc: LOGO_URL, fullFormula: fullFormula.value });

async function copyImage() {
  busy.value = true;
  try {
    const outcome = await copyImageBlob(card(), filename());
    if (outcome !== 'cancelled') flash('image', t(`split.actions.${outcome}`));
    if (outcome === 'copied') toast.show(t('split.actions.imageCopied'));
  } catch {
    flash('image', t('split.actions.failed'), false);
  } finally {
    busy.value = false;
  }
}

async function copySummary() {
  const ok = await copyText(summary(props.result));
  flash('text', t(ok ? 'split.actions.copied' : 'split.actions.failed'), ok);
}

async function saveImage() {
  try {
    download(await card(), filename());
    flash('save', '');
  } catch {
    flash('save', '', false);
  }
}
</script>

<template>
  <ToggleSwitch v-model="fullFormula" class="formula-toggle" :label="t('split.actions.fullFormula')"
    :title="t('split.actions.fullFormulaHint')" />
  <div class="actions">
    <button type="button" class="btn btn--primary" :class="{ 'is-done': flashes.image?.ok }"
      :aria-busy="busy || undefined" @click="copyImage">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span>{{ flashes.image?.text ?? t('split.actions.copyImage') }}</span>
    </button>
    <button type="button" class="btn" :class="{ 'is-done': flashes.text?.ok }" @click="copySummary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      <span>{{ flashes.text?.text ?? t('split.actions.copyText') }}</span>
    </button>
    <button type="button" class="btn btn--icon" :class="{ 'is-done': flashes.save?.ok }" :aria-label="t('split.actions.download')"
      :title="t('split.actions.download')" @click="saveImage">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.formula-toggle {
  margin-top: 18px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin-top: 12px;
}

/* Màn hẹp (nhất là bản tiếng Anh) không đủ chỗ cho 3 nút một hàng: Copy ảnh lên hàng riêng */
@media (max-width: 459px) {
  .actions {
    grid-template-columns: 1fr auto;
  }

  .btn--primary {
    grid-column: 1 / -1;
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1.5px solid var(--ink);
  background: transparent;
  font: 700 15px/1 var(--body);
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s, opacity .15s;
}

.btn:hover {
  background: var(--ink);
  color: #fff;
}

.btn--primary {
  background: var(--ink);
  color: #fff;
}

.btn--primary:hover {
  background: var(--court);
  border-color: var(--court);
}

.btn--icon {
  width: 50px;
  padding: 0;
}

.btn.is-done {
  background: var(--court);
  border-color: var(--court);
  color: #fff;
}

.btn[aria-busy="true"] {
  opacity: .65;
  cursor: progress;
}

.btn svg {
  flex: none;
  width: 18px;
  height: 18px;
}
</style>
