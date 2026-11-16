<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast.js';
import { copyImage } from '@/lib/browser.js';

const props = defineProps({
  // Hàm vẽ ảnh, trả về Promise<Blob>; gọi ngay lúc bấm để giữ "user gesture" trên Safari.
  render: { type: Function, required: true },
  filename: { type: String, required: true },
  label: { type: String, required: true },
  // Nút nằm trên bảng tối (thẻ giải) thay vì nền giấy.
  dark: Boolean,
});

const { t } = useI18n();
const toast = useToast();
const busy = ref(false);
const state = ref('');
let timer;

function flash(value) {
  state.value = value;
  clearTimeout(timer);
  timer = setTimeout(() => { state.value = ''; }, 1800);
}

async function copy() {
  if (busy.value) return;
  busy.value = true;
  try {
    const outcome = await copyImage(props.render(), props.filename);
    if (outcome === 'cancelled') return;
    flash('done');
    toast.show(t(outcome === 'copied' ? 'split.actions.imageCopied' : `split.actions.${outcome}`));
  } catch {
    flash('failed');
    toast.show(t('split.actions.failed'));
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <button type="button" class="copy-img" :class="[{ 'is-dark': dark }, state && `is-${state}`]" :aria-label="label"
    :title="label" :aria-busy="busy || undefined" @click="copy">
    <svg v-if="state === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  </button>
</template>

<style scoped>
.copy-img {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1.5px solid var(--rule);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s, opacity .15s;
}

.copy-img:hover {
  border-color: var(--ink);
}

.copy-img:focus-visible {
  outline: 3px solid var(--lime-deep);
  outline-offset: 2px;
}

.copy-img.is-dark {
  border-color: rgba(255, 255, 255, .22);
  background: rgba(255, 255, 255, .08);
  color: #fff;
}

.copy-img.is-dark:hover {
  border-color: rgba(255, 255, 255, .6);
}

.copy-img.is-done {
  border-color: var(--court);
  background: var(--court);
  color: #fff;
}

.copy-img.is-dark.is-done {
  border-color: var(--lime);
  background: var(--lime);
  color: var(--lime-ink);
}

.copy-img.is-failed {
  border-color: #b3261e;
  color: #b3261e;
}

.copy-img[aria-busy="true"] {
  opacity: .6;
  cursor: progress;
}

.copy-img svg {
  width: 17px;
  height: 17px;
}
</style>
