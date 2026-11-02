<script setup>
import { ref } from 'vue';
import { useQrImage } from '@/composables/useQrImage.js';
import { useToast } from '@/composables/useToast.js';
import { vnd } from '@/lib/format.js';

defineProps({ result: { type: Object, required: true } });

const { src, replace } = useQrImage();
const toast = useToast();
const fileInput = ref(null);

const pick = () => fileInput.value.click();

async function onFile(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const saved = await replace(file);
    toast.show(saved ? 'Đã lưu ảnh QR trên trình duyệt này ✓' : 'Đã đổi QR (chưa lưu được, mở lại trang sẽ mất)');
  } catch {
    toast.show('Không đọc được ảnh này 😢');
  }
}
</script>

<template>
  <div class="qr-block">
    <div class="qr-frame" role="button" tabindex="0" aria-label="Chọn ảnh QR" title="Bấm để chọn ảnh QR" @click="pick"
      @keydown.enter.space.prevent="pick">
      <img :src="src" alt="QR chuyển khoản">
    </div>
    <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile">
    <div class="qr-text">
      <h3>Quét QR chuyển khoản</h3>
      <p>Nội dung: tên + “cầu lông”</p>
      <ul class="qr-amounts">
        <li v-if="result.men" class="m">Nam <b>{{ vnd(result.menPay) }}/người</b></li>
        <li v-if="result.women" class="w">Nữ <b>{{ vnd(result.womenPay) }}/người</b></li>
      </ul>
      <p class="qr-tip">Bấm vào QR để đổi ảnh</p>
    </div>
  </div>
</template>

<style scoped>
.qr-block {
  display: grid;
  justify-items: center;
  gap: 14px;
  margin-top: 22px;
  padding: 16px;
  border-radius: 18px;
  background: var(--paper-2);
  text-align: center;
}

@media (min-width: 420px) {
  .qr-block {
    grid-template-columns: auto 1fr;
    justify-items: start;
    align-items: center;
    text-align: left;
  }
}

.qr-frame {
  --b: var(--ink);
  width: 184px;
  aspect-ratio: 1;
  padding: 12px;
  border-radius: 4px;
  background:
    linear-gradient(var(--b), var(--b)) top left / 26px 3px,
    linear-gradient(var(--b), var(--b)) top left / 3px 26px,
    linear-gradient(var(--b), var(--b)) top right / 26px 3px,
    linear-gradient(var(--b), var(--b)) top right / 3px 26px,
    linear-gradient(var(--b), var(--b)) bottom left / 26px 3px,
    linear-gradient(var(--b), var(--b)) bottom left / 3px 26px,
    linear-gradient(var(--b), var(--b)) bottom right / 26px 3px,
    linear-gradient(var(--b), var(--b)) bottom right / 3px 26px,
    #fff;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: transform .15s;
}

.qr-frame:hover {
  transform: scale(1.02);
}

.qr-frame:focus-visible {
  outline: 3px solid var(--lime-deep);
  outline-offset: 4px;
}

.qr-frame img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: contain;
}

.qr-text h3 {
  font: 800 22px/1 var(--display);
  text-transform: uppercase;
  letter-spacing: .03em;
}

.qr-text p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
}

.qr-text .qr-tip {
  margin-top: 10px;
  font-size: 12px;
  opacity: .8;
}

.qr-amounts {
  list-style: none;
  padding: 0;
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.qr-amounts li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.qr-amounts li::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
}

.qr-amounts .m {
  --c: var(--men);
}

.qr-amounts .w {
  --c: var(--women);
}

.qr-amounts b {
  font: 700 19px/1 var(--display);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 419px) {
  .qr-amounts li {
    justify-content: center;
  }
}
</style>
