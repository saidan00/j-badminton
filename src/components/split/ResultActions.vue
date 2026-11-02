<script setup>
import { reactive, ref } from 'vue';
import { useQrImage } from '@/composables/useQrImage.js';
import { useToast } from '@/composables/useToast.js';
import { LOGO_URL } from '@/config.js';
import { copyText, download, shareOrDownload } from '@/lib/browser.js';
import { today } from '@/lib/format.js';
import { renderCard } from '@/lib/resultCard.js';
import { summary } from '@/lib/split.js';

const props = defineProps({ result: { type: Object, required: true } });

const { src: qrSrc } = useQrImage();
const toast = useToast();
const busy = ref(false);

// Đổi nhãn nút trong chốc lát để báo kết quả (Đã copy ✓, Lỗi rồi…).
const flashes = reactive({});
const timers = {};
function flash(key, text, ok = true) {
  flashes[key] = { text, ok };
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => delete flashes[key], 1800);
}

const filename = () => `chia-tien-cau-long-${today()}.png`;
const card = () => renderCard(props.result, { qrSrc: qrSrc.value, logoSrc: LOGO_URL });

async function copyImage() {
  busy.value = true;
  // ClipboardItem nhận Promise để Safari không mất "user gesture" trong lúc vẽ.
  const job = card();
  try {
    let outcome = 'copied';
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': job })]);
    } catch {
      outcome = await shareOrDownload(await job, filename());
    }
    const labels = { copied: 'Đã copy ✓', shared: 'Đã chia sẻ ✓', downloaded: 'Đã tải ✓' };
    if (labels[outcome]) flash('image', labels[outcome]);
    if (outcome === 'copied') toast.show('Đã copy ảnh, dán vào nhóm thôi! 🏸');
  } catch {
    flash('image', 'Lỗi rồi 😢', false);
  } finally {
    busy.value = false;
  }
}

async function copySummary() {
  const ok = await copyText(summary(props.result));
  flash('text', ok ? 'Đã copy ✓' : 'Lỗi rồi 😢', ok);
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
  <div class="actions">
    <button type="button" class="btn btn--primary" :class="{ 'is-done': flashes.image?.ok }"
      :aria-busy="busy || undefined" @click="copyImage">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span>{{ flashes.image?.text ?? 'Copy ảnh' }}</span>
    </button>
    <button type="button" class="btn" :class="{ 'is-done': flashes.text?.ok }" @click="copySummary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      <span>{{ flashes.text?.text ?? 'Copy chữ' }}</span>
    </button>
    <button type="button" class="btn btn--icon" :class="{ 'is-done': flashes.save?.ok }" aria-label="Tải ảnh về máy"
      title="Tải ảnh về máy" @click="saveImage">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin-top: 16px;
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
