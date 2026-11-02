import { ref } from 'vue';
import { DEFAULT_QR_URL } from '@/config.js';
import { shrinkImage, storage } from '@/lib/browser.js';

const QR_KEY = 'badminton-split:qr';

// QR người dùng tự chọn được lưu trên trình duyệt, chưa chọn thì dùng ảnh mặc định.
const src = ref(storage.get(QR_KEY) || DEFAULT_QR_URL);

async function replace(file) {
  const data = await shrinkImage(file);
  src.value = data;
  return storage.set(QR_KEY, data);
}

export function useQrImage() {
  return { src, replace };
}
